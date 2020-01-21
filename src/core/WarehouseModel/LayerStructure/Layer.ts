import Utils from "../Utils";
import {TopLayer} from "./TopLayer";
import {MiddleLayer} from "./MiddleLayer";
import {BottomLayer} from "./BottomLayer";
import {WarehouseModel} from "../../WarehouseModel";
import firebase from "../../Firebase";
import {DatabaseObject} from "../../Firebase/DatabaseObject";

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
export abstract class Layer<TFields> extends DatabaseObject<TFields> {
    public abstract readonly collectionName: string;
    public abstract readonly layerID: WarehouseModel;
    public loadComplete?: () => void;

    protected constructor(id: string, fields: TFields) {
        super(id, fields);
    }

    /**
     * The top-level database path of the object
     */
    public get topLevelPath(): string {
        return Utils.joinPaths(this.topLayerPath, this.collectionName, this.id);
    }

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

    protected async stageLayer(forceStage = false): Promise<void> {
        if (this.changed || forceStage) {
            await Promise.all([
                firebase.database.set(this.path, this.fields),
                firebase.database.set(this.topLevelPath, {
                    ...this.fields,
                    layerIdentifiers: this.layerIdentifiers
                })
            ]);
            this.fieldsSaved();
        }
    }

    protected async loadLayer(forceLoad = true): Promise<this> {
        if (!this.loaded || forceLoad) {
            this.fields = (await firebase.database.loadDocument<TFields>(this.path))?.fields ?? this.fields;
            this.fieldsSaved();
            this.loaded = true;
            this.loadComplete?.call(this);
        }
        return this;
    }

    public abstract async delete(commit: boolean): Promise<void>;

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