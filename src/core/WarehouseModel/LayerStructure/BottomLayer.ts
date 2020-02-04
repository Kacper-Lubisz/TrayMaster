import firebase from "../../Firebase";
import Utils from "../Utils";
import {Layer, LayerIdentifiers, Layers, UpperLayer} from "./Layer";

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
        this.parent.children.push(this);
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
    public get index(): number {
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

    public async delete(commit = false): Promise<void> {
        this.parent.children.splice(this.index, 1);

        firebase.database.delete(this.topLevelPath);

        if (commit) {
            await firebase.database.commit();
        }
    }

    protected stageLayer(forceStage = false): void {
        if (this.changed || forceStage) {
            firebase.database.set(this.topLevelPath, {
                ...this.fields,
                layerIdentifiers: this.layerIdentifiers,
                index: this.index,
            });
            this.fieldsSaved();
        }
    }

    /**
     * Stage changes to the object to the database
     * @async
     * @param forceStage - Stage the object regardless of whether fields have changed or not
     * @param commit - Get the database to commit the changes at the end of staging
     */
    public async stage(
        forceStage = false, commit = false): Promise<void> {
        this.stageLayer(forceStage);

        if (commit) {
            await firebase.database.commit();
        }
    }
}