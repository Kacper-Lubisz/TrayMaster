import firebase from "../../Firebase";
import {WarehouseModel} from "../../WarehouseModel";
import Utils, {Collection, Queue, Stack} from "../Utils";
import {BottomLayer} from "./BottomLayer";
import {
    collectionNameRange,
    Layer,
    LayerFields,
    LayerIdentifiers,
    Layers,
    LowerLayer, TopLevelFields
} from "./Layer";
import {MiddleLayer} from "./MiddleLayer";

/**
 * Represents the top layer in the object model (that has children)
 * @template TFields - The Fields type to have its members saved to and loaded from the database
 * @template TChildren - The type of the type's children
 */
export abstract class TopLayer<TFields extends LayerFields, TChildren extends LowerLayer> extends Layer<TFields> {
    public abstract readonly childCollectionName: string = "";
    public children: TChildren[];
    public childrenLoaded: boolean;

    protected constructor(id: string, fields: TFields, children?: TChildren[]) {
        super(id, fields);
        this.children = children ?? [];
        this.childrenLoaded = typeof children !== "undefined";
    }

    public get collectionPath(): string {
        return this.collectionName;
    }

    public get topLayerPath(): string {
        return this.path;
    }

    public get topLevelPath(): string {
        return this.topLayerPath;
    }

    /**
     * The top-level database path of the collection of children
     */
    public get topLevelChildCollectionPath(): string {
        return Utils.joinPaths(this.topLayerPath, this.childCollectionName);
    }

    /**
     * Get the index of a given child within the local collection of children
     * @param child - The child to get the index of
     */
    public getChildIndex(child: TChildren): number {
        return this.children.indexOf(child);
    }

    public get layerIdentifiers(): LayerIdentifiers {
        const refs: LayerIdentifiers = {};
        refs[this.collectionName] = this.id;
        return refs;
    }

    public dfs(callback: (layer: Layers) => void, minLayer: WarehouseModel = 0): void {
        this.search<Stack<LowerLayer>>(new Stack<LowerLayer>(), callback, minLayer);
    }

    public bfs(callback: (layer: Layers) => void, minLayer: WarehouseModel = 0): void {
        this.search<Queue<LowerLayer>>(new Queue<LowerLayer>(), callback, minLayer);
    }

    protected search<TCollection extends Collection<LowerLayer>>(
        layerSet: TCollection, callback: (layer: Layers) => void, minLayer: WarehouseModel): void {
        const layerQueue: Queue<LowerLayer> = new Queue<LowerLayer>(this.children);
        callback(this);
        while (!layerSet.empty) {
            const layer: Layers | undefined = layerSet.remove();
            if (layer) {
                if (layer.layerID < minLayer) {
                    break;
                }

                callback(layer);

                if (layer instanceof MiddleLayer) {
                    for (const child of layer.children) {
                        layerQueue.enqueue(child);
                    }
                }
            }
        }
    }

    // noinspection DuplicatedCode
    public async load(forceLoad = false, minLayer: WarehouseModel = this.layerID): Promise<this> {
        await this.loadLayer(forceLoad);

        const queriesResults = await Promise.all(collectionNameRange(minLayer, this.layerID)
            .map(async colName => firebase.database.loadQuery<unknown & TopLevelFields>(firebase.database.db.collection(Utils.joinPaths(this.topLayerPath, colName)).orderBy("index"))));

        if (!this.childrenLoaded) {
            type State = {
                generator: (id: string, fields: unknown, parent: any) => LowerLayer;
                collectionName: string;
                childCollectionName: string;
                topLevelChildCollectionPath: string;
            };

            let currentState: State = {
                generator: this.createChild,
                collectionName: this.collectionName,
                childCollectionName: this.childCollectionName,
                topLevelChildCollectionPath: this.topLevelChildCollectionPath
            };

            const childMap: Map<string, Map<string, Layers>> = new Map<string, Map<string, Layers>>([
                [this.collectionName, new Map<string, Layers>([[this.id, this]])]
            ]);

            for (const queryResults of queriesResults) {
                childMap.set(currentState.childCollectionName, new Map<string, Layers>());
                let nextState: State | undefined;

                for (const queryResult of queryResults) {
                    const parent = childMap.get(currentState.collectionName)?.get(queryResult.fields.layerIdentifiers[currentState.collectionName]);
                    if (parent && !(parent instanceof BottomLayer)) {
                        parent.childrenLoaded = true;
                        const child: LowerLayer = currentState.generator(queryResult.id, queryResult.fields, parent);
                        child.loaded = true;
                        childMap.get(currentState.childCollectionName)?.set(queryResult.id, child);
                        if (child instanceof MiddleLayer && !nextState) {
                            nextState = {
                                generator: child.createChild,
                                collectionName: child.collectionName,
                                childCollectionName: child.childCollectionName,
                                topLevelChildCollectionPath: child.topLevelChildCollectionPath
                            };
                        }
                    }
                }

                if (nextState) {
                    currentState = {...nextState};
                } else {
                    break;
                }
            }

            for (const colName of collectionNameRange(minLayer + 1, this.layerID)) {
                for (const parent of Array.from(childMap.get(colName)?.values() ?? [])) {
                    if (!(parent instanceof BottomLayer)) {
                        parent.childrenLoaded = true;
                    }
                }
            }
        }

        return this;
    }

    public async delete(commit = false): Promise<void> {
        for (const child of this.children) {
            await child.delete();
        }

        firebase.database.delete(this.topLevelPath);

        if (commit) {
            await firebase.database.commit();
        }
    }

    protected stageLayer(forceStage = false): void {
        if (this.changed || forceStage) {
            firebase.database.set(this.topLevelPath, {
                ...this.fields,
                layerIdentifiers: this.layerIdentifiers
            });
            this.fieldsSaved();
        }
    }

    /**
     * Stage changes to the object to the database
     * @async
     * @param forceStage - Stage the object regardless of whether fields have changed or not
     * @param commit - Get the database to commit the changes at the end of staging
     * @param minLayer - The minimum layer to stage down to
     */
    public async stage(
        forceStage = false, commit = false, minLayer: WarehouseModel = this.layerID): Promise<void> {
        this.stageLayer(forceStage);

        if (this.layerID >= minLayer) {
            for (const child of this.children) {
                await child.stage(forceStage, false, minLayer);
            }
        }

        if (commit) {
            await firebase.database.commit();
        }
    }

    /**
     * Spawn a child instance
     */
    public abstract createChild: (id: string, fields: unknown, parent: any) => TChildren;
}