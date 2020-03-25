import firebase from "../../Firebase";
import {WarehouseModel} from "../../WarehouseModel";
import Utils, {Queue} from "../Utils";
import {BottomLayer} from "./BottomLayer";
import {collectionNameRange, Layer, LayerFields, LayerIdentifiers, Layers, LowerLayer, UpperLayer} from "./Layer";

/**
 * Represents a middle layer in the object model (that has children and a parent)
 * @template TParent - The type of the type's parent
 * @template TFields - The Fields type to have its members saved to and loaded from the database
 * @template TChildren - The type of the type's children
 */
export abstract class MiddleLayer<TParent extends UpperLayer, TFields extends LayerFields, TChildren extends LowerLayer> extends Layer<TFields> {
    public abstract readonly childCollectionName: string;
    public parent: TParent;
    public children: TChildren[];
    public childrenLoaded: boolean;
    private loading: boolean;

    protected constructor(id: string, fields: TFields, parent: TParent, children?: TChildren[]) {
        super(id, fields);
        this.loading = false;
        this.parent = parent;
        this.children = children ?? [];
        this.childrenLoaded = typeof children !== "undefined";
        this.parent.children.push(this);
    }

    public get collectionPath(): string {
        return Utils.joinPaths(this.parent.path, this.collectionName);
    }

    public get topLayerPath(): string {
        return this.parent.topLayerPath;
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
        const refs: LayerIdentifiers = this.parent?.layerIdentifiers ?? {};
        refs[this.collectionName] = this.id;
        return refs;
    }

    /**
     * Get the index of the object within its parent's collection
     */
    public get index(): number {
        return this.parent.getChildIndex(this);
    }

    public dfs(callback: (layer: Layers) => void, minLayer = 0): void {
        callback(this);
        if (minLayer <= this.layerID) {
            for (const child of this.children) {
                child.dfs(callback, minLayer);
            }
        }
    }

    public bfs(callback: (layer: Layers) => void): void {
        const layerQueue: Queue<LowerLayer> = new Queue<LowerLayer>([this]);
        while (!layerQueue.empty) {
            const layer: Layers | undefined = layerQueue.dequeue();
            if (layer) {
                callback(layer);

                if (layer instanceof MiddleLayer) {
                    for (const child of layer.children) {
                        layerQueue.enqueue(child);
                    }
                }
            }
        }
    }

    public async load(forceLoad = false, minLayer: WarehouseModel = this.layerID): Promise<this> {
        if (!this.loading) {
            this.loading = true;
            await this.loadLayer(forceLoad);

            if (!this.childrenLoaded || forceLoad) {
                if (this.childrenLoaded) {
                    this.remove(true);
                }

                const queriesResults = await Promise.all(collectionNameRange(minLayer, this.layerID)
                    .map(async colName => firebase.database.loadQuery<LayerFields>(firebase.database.db.collection(Utils.joinPaths(this.topLayerPath, colName)).orderBy("index"))));

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
                            child.fieldsSaved();
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

                this.childrenLoaded = true;

                for (const colName of collectionNameRange(minLayer + 1, this.layerID)) {
                    for (const parent of Array.from(childMap.get(colName)?.values() ?? [])) {
                        if (!(parent instanceof BottomLayer)) {
                            parent.childrenLoaded = true;
                        }
                    }
                }
            }

            this.loading = false;
        }

        return this;
    }

    public async delete(commit = false): Promise<void> {
        for (let i = this.children.length - 1; i >= 0; i--) {
            await this.children[i].delete(false);
        }

        this.parent.children.splice(this.index, 1);

        firebase.database.delete(this.topLevelPath);

        if (commit) {
            await firebase.database.commit();
        }
    }

    public remove(onlyChildren = false): void {
        for (let i = this.children.length - 1; i >= 0; i--) {
            this.children[i].remove();
        }

        if (!onlyChildren) {
            this.parent.children.splice(this.index, 1);
        }
    }

    protected stageLayer(forceStage = false): void {
        if (this.changed || forceStage) {
            this.updateBlame();
            firebase.database.set(this.topLevelPath, {
                ...this.fields,
                layerIdentifiers: this.layerIdentifiers,
                index: this.index,
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
        forceStage = false,
        commit = false,
        minLayer: WarehouseModel = this.layerID
    ): Promise<void> {
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