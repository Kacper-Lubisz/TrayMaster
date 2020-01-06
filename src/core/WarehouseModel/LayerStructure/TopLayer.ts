import {Layer, LayerIdentifiers, Layers, LowerLayer} from "./Layer";
import {BottomLayer} from "./BottomLayer";
import database from "../Database";
import Utils, {Queue} from "../Utils";
import {breadthFirstLoad} from "../../WarehouseModel";


export abstract class TopLayer<TF, T extends TopLayer<any, T, any>, TL extends LowerLayer> extends Layer<TF> {
    public abstract readonly childCollectionName: string = "";
    public children: TL[];
    protected childrenLoaded: boolean;

    protected constructor(id: string, fields: TF, children: TL[] = []) {
        super(id, fields);
        this.children = children;
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

    public get topLevelChildCollectionPath(): string {
        return Utils.joinPaths(this.topLayerPath, this.childCollectionName);
    }

    public get childCollectionPath(): string {
        return Utils.joinPaths(this.path, this.childCollectionName);
    }

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

                if (!(layer instanceof BottomLayer)) {
                    for (const child of layer.children) {
                        layerQueue.enqueue(child);
                    }
                }
            }
        }
    }

    // noinspection DuplicatedCode
    public abstract async loadNextLayer(forceLoad: boolean): Promise<void>;

    public async depthFirstLoad(forceLoad = false, recursionCount = 0): Promise<this> {
        await this.loadLayer(forceLoad);

        if (recursionCount > 0) {
            await this.loadNextLayer(forceLoad);
            for (const child of this.children) {
                await child.depthFirstLoad(forceLoad, recursionCount - 1);
            }
        }

        return this;
    }

    public async load(minLayer = 0): Promise<this> {
        await breadthFirstLoad.call(this, minLayer);
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

    public abstract createChild: (id: string, fields: unknown, parent: any) => TL;
}