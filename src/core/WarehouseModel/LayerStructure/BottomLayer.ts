import {Layer, LayerIdentifiers, Layers, UpperLayer} from "./Layer";
import database from "../Database";
import Utils from "../Utils";


export abstract class BottomLayer<TU extends UpperLayer, TF> extends Layer<TF> {
    public parent: TU;

    protected constructor(id: string, fields: TF, parent: TU) {
        super(id, fields);
        this.parent = parent;
    }

    public get collectionPath(): string {
        return Utils.joinPaths(this.parent?.path ?? "", this.collectionName);
    }

    public get topLayerPath(): string {
        return this.parent?.topLayerPath ?? "";
    }

    public get layerIdentifiers(): LayerIdentifiers {
        const refs: LayerIdentifiers = this.parent?.layerIdentifiers ?? {};
        refs[this.collectionName] = this.id;
        return refs;
    }

    public get indexInParent(): number {
        return this.parent.getChildIndex(this);
    }

    public dfs(callback: (layer: Layers) => void): void {
        callback(this);
    }

    public bfs(callback: (layer: Layers) => void): void {
        callback(this);
    }

    public async depthFirstLoad(forceLoad = false): Promise<this> {
        await this.loadLayer(forceLoad);
        return this;
    }

    public async load(minLayer = 0): Promise<this> {
        await this.loadLayer(true);
        return this;
    }

    public async save(
        forceSave = false, commitAtEnd = false): Promise<void> {
        await this.saveLayer(forceSave);

        if (commitAtEnd) {
            await database().commit();
        }
    }
}