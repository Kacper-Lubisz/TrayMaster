import {Layer, LayerIdentifiers, Layers, LowerLayer, TopLevelFields} from "./Layer";
import {MiddleLayer} from "./MiddleLayer";
import {BottomLayer} from "./BottomLayer";
import database from "../Database";
import Utils, {Queue} from "../Utils";


export abstract class TopLayer<TF, T extends TopLayer<any, T, any>, TL extends LowerLayer> extends Layer<TF> {
    public abstract readonly childCollectionName: string = "";
    public children: TL[];
    protected childrenLoaded: boolean;

    protected constructor(id: string, fields: TF, children: TL[] = []) {
        super(id, fields);
        this.children = children;
        this.childrenLoaded = typeof children !== "undefined";
    }

    public get collectionPath(): string {
        return this.collectionName;
    }

    public get topLayerPath(): string {
        return this.path;
    }

    public get topLevelPath(): string {
        return this.topLayerPath;
    }

    public get topLevelChildCollectionPath(): string {
        return Utils.joinPaths(this.topLayerPath, this.childCollectionName);
    }

    public get childCollectionPath(): string {
        return Utils.joinPaths(this.path, this.childCollectionName);
    }

    public getChildIndex(child: TL): number {
        return this.children.indexOf(child);
    }

    public get layerIdentifiers(): LayerIdentifiers {
        const refs: LayerIdentifiers = {};
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
        const layerQueue: Queue<LowerLayer> = new Queue<LowerLayer>(this.children);
        callback(this);
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

    // noinspection DuplicatedCode
    public abstract async loadNextLayer(forceLoad: boolean): Promise<void>;

    public async dfsLoad(forceLoad = false, recursionCount = 0): Promise<this> {
        await this.loadLayer(forceLoad);

        if (recursionCount > 0) {
            await this.loadNextLayer(forceLoad);
            for (const child of this.children) {
                await child.dfsLoad(forceLoad, recursionCount - 1);
            }
        }

        return this;
    }

    public async load(minLayer = 0): Promise<this> {
        this.loadLayer();
        const childMap: Map<string, Map<string, Layers>> = new Map<string, Map<string, Layers>>([
            [this.collectionName, new Map<string, Layers>([[this.id, this]])]
        ]);

        type State = {
            generator: (id: string, fields: unknown, parent: any) => LowerLayer,
            collectionName: string,
            childCollectionName: string,
            topLevelChildCollectionPath: string
        };

        let currentState: State = {
            generator: this.createChild,
            collectionName: this.collectionName,
            childCollectionName: this.childCollectionName,
            topLevelChildCollectionPath: this.topLevelChildCollectionPath
        };

        for (let i = this.layerID - 1; i >= minLayer; i--) {
            childMap.set(currentState.childCollectionName, new Map<string, Layers>());
            let nextState: State | undefined;

            for (const document of (await database().loadCollection<unknown & TopLevelFields>(currentState.topLevelChildCollectionPath))) {
                let parent = childMap.get(currentState.collectionName)?.get(document.fields.layerIdentifiers[currentState.collectionName]);
                if (parent && !(parent instanceof BottomLayer)) {
                    const child: LowerLayer = currentState.generator(document.id, document.fields, parent);
                    childMap.get(currentState.childCollectionName)?.set(document.id, child);
                    parent.children.push(child);
                    if (child instanceof MiddleLayer && !nextState) {
                        nextState = {
                            generator: child.createChild,
                            collectionName: child.collectionName,
                            childCollectionName: child.childCollectionName,
                            topLevelChildCollectionPath: child.topLevelChildCollectionPath
                        };
                    }
                }
            }

            if (nextState) {
                currentState = {...nextState};
            } else {
                break;
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

    public abstract createChild: (id: string, fields: unknown, parent: any) => TL;
}