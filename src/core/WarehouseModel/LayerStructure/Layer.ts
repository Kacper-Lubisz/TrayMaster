import Utils from "../Utils";
import deepEqual from "deep-equal";
import database from "../Database";
import {TopLayer} from "./TopLayer";
import {MiddleLayer} from "./MiddleLayer";
import {BottomLayer} from "./BottomLayer";
import {WarehouseModel} from "../../WarehouseModel";

/**
 * Represents additional metadata for the top-level database model
 */
export interface TopLevelFields {
    layerIdentifiers: LayerIdentifiers;
}

/**
 * Represents a collection of layer names and their corresponding IDs
 */
export interface LayerIdentifiers {
    [collectionName: string]: string;
}

/**
 * Represents one of the three sub-classes of Layer
 */
export type Layers = TopLayer<any, any> | MiddleLayer<any, any, any> | BottomLayer<any, any>;
/**
 * Represents sub-classes of Layer that are guaranteed to have children
 */
export type UpperLayer = TopLayer<any, any> | MiddleLayer<any, any, any>;
/**
 * Represents sub-classes of Layer that are guaranteed to have parents
 */
export type LowerLayer = MiddleLayer<any, any, any> | BottomLayer<any, any>;

/**
 * Represents data and methods common to all layers in the object model
 * @template TFields - The Fields type to have its members saved to and loaded from the database
 */
export abstract class Layer<TFields> {
    public abstract readonly layerID: WarehouseModel;
    public abstract readonly collectionName: string;
    public readonly id: string;
    public loaded: boolean;
    public loadComplete?: () => void;
    protected fields: TFields;
    protected originalFields: TFields;

    protected constructor(id: string, fields: TFields) {
        this.id = id;
        this.fields = fields;
        this.originalFields = Object.assign({}, fields);
        this.loaded = false;
    }

    /**
     * The database path of the object
     */
    public get path(): string {
        return Utils.joinPaths(this.collectionPath, this.id);
    }

    /**
     * The top-level database path of the object
     */
    public get topLevelPath(): string {
        return Utils.joinPaths(this.topLayerPath, this.collectionName, this.id);
    }

    /**
     * The database path of the collection the object belongs to
     */
    public abstract get collectionPath(): string;

    /**
     * The database path to the top layer object
     */
    public abstract get topLayerPath(): string;

    /**
     * The set of layer collection names with corresponding IDs at and above the layer
     */
    public abstract get layerIdentifiers(): LayerIdentifiers;

    /**
     * Perform a Depth First Search on the object
     * @param callback - A callback for each object found in the search
     */
    public abstract dfs(callback: (layer: Layers) => void): void;

    /**
     * Perform a Breadth First Search on the object
     * @param callback - A callback for each object found in the search
     */
    public abstract bfs(callback: (layer: Layers) => void): void;

    protected get changed(): boolean {
        return !deepEqual(this.fields, this.originalFields);
    }

    protected fieldsSaved(): void {
        this.originalFields = Object.assign({}, this.fields);
    }

    protected async stageLayer(forceStage = false): Promise<void> {
        if (this.changed || forceStage) {
            await Promise.all([
                database.set(this.path, this.fields),
                database.set(this.topLevelPath, {
                    ...this.fields,
                    layerIdentifiers: this.layerIdentifiers
                })
            ]);
            this.fieldsSaved();
        }
    }

    protected async loadLayer(forceLoad = true): Promise<this> {
        if (!this.loaded || forceLoad) {
            this.fields = (await database.loadDocument<TFields>(this.path))?.fields ?? this.fields;
            this.fieldsSaved();
            this.loaded = true;
            this.loadComplete?.call(this);
        }
        return this;
    }

    /**
     * Commit all staged changes to the database
     */
    public async commitAllStaged(): Promise<void> {
        await database.commit();
    }

    /**
     * Save the object
     * @async
     * @param forceStage - Save the object regardless of whether fields have changed or not
     * @param commitAtEnd - Force the database to commit the changes at the end of saving
     */
    public abstract stage(forceStage: boolean, commitAtEnd: boolean): Promise<void>;

    /**
     * Load the object (breadth first)
     * @async
     */
    public abstract load(): Promise<this>;

    /**
     * Load the object (depth first)
     * @param forceLoad
     */
    public abstract loadDepthFirst(forceLoad: boolean): Promise<this>;
}