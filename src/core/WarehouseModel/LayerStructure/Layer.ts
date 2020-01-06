import Utils from "../Utils";
import deepEqual from "deep-equal";
import database from "../Database";
import {TopLayer} from "./TopLayer";
import {MiddleLayer} from "./MiddleLayer";
import {BottomLayer} from "./BottomLayer";
import {WarehouseModel} from "../../WarehouseModel";


export interface TopLevelFields {
    layerIdentifiers: LayerIdentifiers;
}

export interface LayerIdentifiers {
    [collectionName: string]: string;
}

export type Layers = TopLayer<any, any, any> | MiddleLayer<any, any, any, any> | BottomLayer<any, any>;
export type UpperLayer = TopLayer<any, any, any> | MiddleLayer<any, any, any, any>;
export type LowerLayer = MiddleLayer<any, any, any, any> | BottomLayer<any, any>;


export abstract class Layer<TF> {
    public abstract readonly layerID: WarehouseModel;
    public abstract readonly collectionName: string;
    public readonly id: string;
    protected fields: TF;
    private originalFields: TF;
    private loaded: boolean;

    protected constructor(id: string, fields: TF) {
        this.id = id;
        this.fields = fields;
        this.originalFields = Object.assign({}, fields);
        this.loaded = false;
    }

    protected get changed(): boolean {
        return !deepEqual(this.fields, this.originalFields);
    }

    public get path(): string {
        return Utils.joinPaths(this.collectionPath, this.id);
    }

    public get topLevelPath(): string {
        return Utils.joinPaths(this.topLayerPath, this.collectionName, this.id);
    }

    public abstract get collectionPath(): string;

    public abstract get topLayerPath(): string;

    public abstract get layerIdentifiers(): LayerIdentifiers;

    public abstract dfs(callback: (layer: Layers) => void): void;

    public abstract bfs(callback: (layer: Layers) => void): void;

    protected fieldsSaved(): void {
        this.originalFields = Object.assign({}, this.fields);
    }

    public async loadLayer(forceLoad = true): Promise<this> {
        if (!this.loaded || forceLoad) {
            this.fields = (await database().loadDocument<TF>(this.path))?.fields ?? this.fields;
            this.fieldsSaved();
            this.loaded = true;
        }
        return this;
    }

    protected async saveLayer(forceSave = false): Promise<void> {
        if (this.changed || forceSave) {
            await database().set(this.path, this.fields);
            await database().set(this.topLevelPath, {
                ...this.fields,
                layerIdentifiers: this.layerIdentifiers
            });
            this.fieldsSaved();
        }
    }

    public abstract depthFirstLoad(forceLoad: boolean): Promise<this>;

    public abstract load(): Promise<this>;

    public abstract save(forceSave: boolean, commitAtEnd: boolean): Promise<void>;
}
