import {Layer, LayerIdentifiers, Layers, UpperLayer} from "./Layer";
import database from "../Database";
import Utils from "../Utils";

/**
 * Represents the bottom layer in the object model (that has a parent)
 * @template TParent - The type of the type's parent
 * @template TFields - The Fields type to have its members saved to and loaded from the database
 */
export abstract class BottomLayer<TParent extends UpperLayer, TFields> extends Layer<TFields> {
    public parent: TParent;

    protected constructor(id: string, fields: TFields, parent: TParent) {
        super(id, fields);
        this.parent = parent;
    }

    public get collectionPath(): string {
        return Utils.joinPaths(this.parent.path, this.collectionName);
    }

    public get topLayerPath(): string {
        return this.parent.topLayerPath;
    }

    public get layerIdentifiers(): LayerIdentifiers {
        const refs: LayerIdentifiers = this.parent.layerIdentifiers;
        refs[this.collectionName] = this.id;
        return refs;
    }

    /**
     * Get the index of the object within its parent's collection
     */
    public get indexInParent(): number {
        return this.parent.getChildIndex(this);
    }

    public dfs(callback: (layer: Layers) => void): void {
        callback(this);
    }

    public bfs(callback: (layer: Layers) => void): void {
        callback(this);
    }

    public async loadDepthFirst(forceLoad = false): Promise<this> {
        await this.loadLayer(forceLoad);
        return this;
    }

    public async load(): Promise<this> {
        await this.loadLayer(true);
        return this;
    }

    public async stage(
        forceStage = false, commitAtEnd = false): Promise<void> {
        await this.stageLayer(forceStage);

        if (commitAtEnd) {
            await database.commit();
        }
    }
}