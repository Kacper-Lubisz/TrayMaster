import {Layer, LayerIdentifiers, Layers, LowerLayer, TopLevelFields, UpperLayer} from "./Layer";
import Utils, {Queue} from "../Utils";
import {WarehouseModel} from "../../WarehouseModel";
import {BottomLayer} from "./BottomLayer";
import firebase from "../../Firebase";

/**
 * Represents a middle layer in the object model (that has children and a parent)
 * @template TParent - The type of the type's parent
 * @template TFields - The Fields type to have its members saved to and loaded from the database
 * @template TChildren - The type of the type's children
 */
export abstract class MiddleLayer<TParent extends UpperLayer, TFields, TChildren extends LowerLayer> extends Layer<TFields> {
    public abstract readonly childCollectionName: string = "";
    public parent: TParent;
    public children: TChildren[];
    public childrenLoaded: boolean;
    public childLoadComplete?: () => void;

    protected constructor(id: string, fields: TFields, parent: TParent, children?: TChildren[]) {
        super(id, fields);
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

    /**
     * Get the index of the object within its parent's collection
     */
    public get indexInParent(): number {
        return this.parent.getChildIndex(this);
    }

    public get layerIdentifiers(): LayerIdentifiers {
        const refs: LayerIdentifiers = this.parent?.layerIdentifiers ?? {};
        refs[this.collectionName] = this.id;
        return refs;
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

    /**
     * Load the immediate children from the database
     * @param forceLoad - Load whether the children are already loaded or not
     */
    public async loadChildren(forceLoad = false): Promise<void> {
        if (!this.childrenLoaded || forceLoad) {
            const query = firebase.database.db.collection(this.topLevelChildCollectionPath)
                                  .where(`layerIdentifiers.${this.collectionName}`, "==", this.id);
            this.children = (await firebase.database.loadQuery<unknown>(query))
                .map(document => this.createChild(document.id, document.fields, this));
            this.childrenLoaded = true;
        }
    }

    // noinspection DuplicatedCode
    /**
     * Load down to minLayer a layer at a time (using the top-level structure in the database).
     * @async
     * @param minLayer - The number of the layer to load down to
     */
    protected async breadthFirstLoad(minLayer: WarehouseModel = this.layerID): Promise<void> {
        this.loadLayer();
        this.childrenLoaded = minLayer < this.layerID;

        const childMap: Map<string, Map<string, Layers>> = new Map<string, Map<string, Layers>>([
            [this.collectionName, new Map<string, Layers>([[this.id, this]])]
        ]);

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

        for (let i = this.layerID - 1; i >= minLayer; i--) {
            childMap.set(currentState.childCollectionName, new Map<string, Layers>());
            let nextState: State | undefined;

            for (const document of (await firebase.database.loadCollection<unknown & TopLevelFields>(currentState.topLevelChildCollectionPath))) {
                const parent = childMap.get(currentState.collectionName)?.get(document.fields.layerIdentifiers[currentState.collectionName]);
                if (parent && !(parent instanceof BottomLayer)) {
                    parent.childrenLoaded = true;
                    const child: LowerLayer = currentState.generator(document.id, document.fields, parent);
                    child.loaded = true;
                    child.loadComplete?.call(child);
                    childMap.get(currentState.childCollectionName)?.set(document.id, child);
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

        this.dfs(layer => {
            if (!(layer instanceof BottomLayer)) {
                layer.childLoadComplete?.call(layer);
            }
        });
    }

    public async loadDepthFirst(forceLoad = false, minLayer: WarehouseModel = this.layerID): Promise<this> {
        await this.loadLayer(forceLoad);

        if (this.layerID >= minLayer) {
            await this.loadChildren(forceLoad);
            for (const child of this.children) {
                await child.loadDepthFirst(forceLoad, minLayer);
            }
        }

        return this;
    }

    public async load(minLayer: WarehouseModel = this.layerID): Promise<this> {
        await this.breadthFirstLoad.call(this, minLayer);
        return this;
    }

    // noinspection DuplicatedCode
    public async delete(commit = false): Promise<void> {
        firebase.database.delete(this.path);

        for (let i = this.children.length - 1; i > -1; i--) {
            await this.children[i].delete();
            delete this.children[i];
        }

        if (commit) {
            await firebase.database.commit();
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
        await this.stageLayer(forceStage);

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