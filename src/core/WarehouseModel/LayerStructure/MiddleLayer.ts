import {Layer, LayerIdentifiers, Layers, LowerLayer, UpperLayer} from "./Layer";
import {BottomLayer} from "./BottomLayer";
import database from "../Database";
import Utils, {Queue} from "../Utils";
import {breadthFirstLoad} from "../../WarehouseModel";


export abstract class MiddleLayer<TU extends UpperLayer, T extends MiddleLayer<any, T, any, any>, TF, TL extends LowerLayer> extends Layer<TF> {
    public abstract readonly childCollectionName: string = "";
    public parent: TU;
    public children: TL[];
    protected childrenLoaded: boolean;

    protected constructor(id: string, fields: TF, parent: TU, children: TL[] = []) {
        super(id, fields);
        this.parent = parent;
        this.children = children;
        this.childrenLoaded = typeof children !== "undefined";
    }

    public get collectionPath(): string {
        return Utils.joinPaths(this.parent?.path ?? "", this.collectionName);
    }

    public get topLayerPath(): string {
        return this.parent?.topLayerPath ?? "";
    }

    public get topLevelChildCollectionPath(): string {
        return Utils.joinPaths(this.topLayerPath, this.childCollectionName);
    }

    public get childCollectionPath(): string {
        return Utils.joinPaths(this.path, this.childCollectionName);
    }

    public get indexInParent(): number {
        return this.parent.getChildIndex(this);
    }

    public getChildIndex(child: TL): number {
        return this.children.indexOf(child);
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

                if (!(layer instanceof BottomLayer)) {
                    for (const child of layer.children) {
                        layerQueue.enqueue(child);
                    }
                }
            }
        }
    }

    public async loadNextLayer(forceLoad = false): Promise<void> {
        if (!this.childrenLoaded || forceLoad) {
            const query = database().db.collection(this.topLevelChildCollectionPath)
                                    .where(`layerIdentifiers.${this.collectionName}`, "==", this.id);
            this.children = (await database().loadQuery<unknown>(query))
                .map(document => this.createChild(document.id, document.fields, this));
            this.childrenLoaded = true;
        }
    }

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