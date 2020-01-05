import {Layer, LayerIdentifiers} from "./Layer";
import {TopLayer} from "./TopLayer";
import {MiddleLayer} from "./MiddleLayer";
import database from "../Database";
import Utils from "../Utils";


export abstract class BottomLayer<TU extends TopLayer<any, any, any> | MiddleLayer<any, any, any, any>, TF> extends Layer<TF> {
    protected parent?: TU;

    protected constructor(id: string, fields: TF, parent?: TU) {
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

    public dfs(callback: (layer: Layer<any>) => void): void {
        callback(this);
    }

    public async load(forceLoad = false, recurse = false): Promise<this> {
        await this.loadLayer(forceLoad);
        return this;
    }

    public async save(
        forceSave = false, recurse = false, commitAtEnd = false): Promise<void> {
        await this.saveLayer(forceSave);

        if (commitAtEnd) {
            await database().commit();
        }
    }
}