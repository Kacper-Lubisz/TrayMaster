import {Layer, LayerIdentifiers, Layers, LowerLayer, TopLevelFields} from "./Layer";
import database from "../Database";
import Utils, {Queue} from "../Utils";
import {WarehouseModel} from "../../WarehouseModel";
import {MiddleLayer} from "./MiddleLayer";
import {BottomLayer} from "./BottomLayer";

export abstract class TopLayer<TF, TL extends LowerLayer> extends Layer<TF> {
    public abstract readonly childCollectionName: string = "";
    public children: TL[];
    public childrenLoaded: boolean;

    protected constructor(id: string, fields: TF, children?: TL[]) {
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
    public getChildIndex(child: TL): number {
        return this.children.indexOf(child);
    }

    public get layerIdentifiers(): LayerIdentifiers {
        const refs: LayerIdentifiers = {};
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
        const layerQueue: Queue<LowerLayer> = new Queue<LowerLayer>(this.children);
        callback(this);
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

    public abstract async loadChildren(forceLoad: boolean): Promise<void>;

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
            generator: (id: string, fields: unknown, parent: any) => LowerLayer,
            collectionName: string,
            childCollectionName: string,
            topLevelChildCollectionPath: string
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

            for (const document of (await database().loadCollection<unknown & TopLevelFields>(currentState.topLevelChildCollectionPath))) {
                let parent = childMap.get(currentState.collectionName)?.get(document.fields.layerIdentifiers[currentState.collectionName]);
                if (parent && !(parent instanceof BottomLayer)) {
                    parent.childrenLoaded = true;
                    const child: LowerLayer = currentState.generator(document.id, document.fields, parent);
                    childMap.get(currentState.childCollectionName)?.set(document.id, child);
                    parent.children.push(child);
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

    public async save(
        forceSave = false, recurse = false, commitAtEnd = false): Promise<void> {
        await this.saveLayer(forceSave);

        if (recurse) {
            for (const child of this.children) {
                await child.save(forceSave, recurse, false);
            }
        }

        if (commitAtEnd) {
            await database().commit();
        }
    }

    /**
     * Spawn a child instance
     */
    public abstract createChild: (id: string, fields: unknown, parent: any) => TL;
}