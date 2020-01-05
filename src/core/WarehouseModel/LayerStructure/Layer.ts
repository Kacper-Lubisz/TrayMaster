import Utils from "../Utils";
import deepEqual from "deep-equal";
import database from "../Database";


interface TopLevelFields {
    layerIdentifiers: LayerIdentifiers;
}

export interface LayerIdentifiers {
    [collectionName: string]: string;
}


export abstract class Layer<TF> {
    protected abstract readonly collectionName: string;
    protected readonly id: string;
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
        return deepEqual(this.fields, this.originalFields);
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

    public abstract dfs(callback: (layer: Layer<any>) => void): void;

    protected fieldsSaved(): void {
        this.originalFields = Object.assign({}, this.fields);
    }

    protected async loadLayer(forceLoad = true): Promise<void> {
        if (!this.loaded || forceLoad) {
            this.fields = (await database().loadDocument<TF>(this.path))?.fields ?? this.fields;
            this.fieldsSaved();
            this.loaded = true;
        }
    }

    protected async saveLayer(forceSave = false): Promise<void> {
        if (this.changed || forceSave) {
            await database().set(this.path, this.fields);
            const fields: TopLevelFields & TF = this.fields as TopLevelFields & TF;
            fields.layerIdentifiers = this.layerIdentifiers;
            await database().set(this.topLevelPath, fields);
            this.fieldsSaved();
        }
    }

    public abstract load(forceLoad: boolean, recurse: boolean): Promise<this>;

    public abstract save(forceSave: boolean, recurse: boolean, commitAtEnd: boolean): Promise<void>;
}
