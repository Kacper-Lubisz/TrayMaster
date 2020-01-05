import {Layer, LayerIdentifiers} from "./Layer";
import {TopLayer} from "./TopLayer";
import {BottomLayer} from "./BottomLayer";
import database from "../Database";
import Utils from "../Utils";


export abstract class MiddleLayer<TU extends TopLayer<any, any, any> | MiddleLayer<any, any, any, any>, T extends MiddleLayer<any, T, any, any>, TF, TL extends MiddleLayer<any, any, any, any> | BottomLayer<any, any>> extends Layer<TF> {
    protected abstract readonly childCollectionName: string = "";
    protected parent?: TU;
    protected children: TL[];
    protected childrenLoaded: boolean;

    protected constructor(id: string, fields: TF, parent?: TU, children?: TL[]) {
        super(id, fields);
        this.parent = parent;
        this.children = children || [];
        this.childrenLoaded = typeof children !== "undefined";
    }

    public get collectionPath(): string {
        return Utils.joinPaths(this.parent?.path ?? "", this.collectionName);
    }

    public get topLayerPath(): string {
        return this.parent?.topLayerPath ?? "";
    }

    public get childCollectionPath(): string {
        return Utils.joinPaths(this.path, this.childCollectionName);
    }

    public get layerIdentifiers(): LayerIdentifiers {
        const refs: LayerIdentifiers = this.parent?.layerIdentifiers ?? {};
        refs[this.collectionName] = this.id;
        return refs;
    }

    public dfs(callback: (layer: Layer<any>) => void): void {
        callback(this);
        for (const child of this.children) {
            child.dfs(callback);
        }
    }

    // noinspection DuplicatedCode
    public async loadNextLayer(forceLoad = false): Promise<void> {
        if (!this.childrenLoaded || forceLoad) {
            const query = database().db.collection(this.childCollectionPath)
                                    .where(`layerIdentifiers.${this.collectionName}`, "==", this.id);
            this.children = (await database().loadQuery<unknown>(query))
                .map(document => this.createChild(document.id, document.fields, this));
            this.childrenLoaded = true;
        }
    }

    public async load(forceLoad = false, recurse = false): Promise<this> {
        await this.loadLayer(forceLoad);

        if (recurse) {
            await this.loadNextLayer(forceLoad);
            for (const child of this.children) {
                await child.load(forceLoad, recurse);
            }
        }

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

    protected abstract createChild: (id: string, fields: unknown, parent: any) => TL;
}