import Utils from "../WarehouseModel/Utils";
import deepEqual from "deep-equal";
import firebase from "../Firebase";

export class DatabaseCollection<TF> extends Map<string, TF> {
    protected readonly collectionPath: string;
    protected changed: boolean;
    protected deleted: Set<string>;
    protected loaded: boolean;

    public constructor(collectionPath: string, values?: [string, TF][]) {
        if (values) {
            super(values);
        } else {
            super();
        }
        this.collectionPath = collectionPath;
        this.changed = false;
        this.loaded = false;
        this.deleted = new Set<string>();
    }

    public async load(forceLoad = false): Promise<void> {
        if (!this.loaded || forceLoad) {
            (await firebase.database.loadCollection<TF>(this.collectionPath))
                .forEach(document => super.set(document.id, document.fields));
            this.loaded = true;
        }
    }

    public async stage(forceStage = false, commit = false): Promise<void> {
        if (this.changed || forceStage) {
            for (const id of Array.from(this.deleted)) {
                firebase.database.delete(Utils.joinPaths(this.collectionPath, id));
            }
            this.deleted.clear();
            for (const [id, item] of Array.from(this)) {
                firebase.database.set(Utils.joinPaths(this.collectionPath, id), item);
            }
        }
        if (commit) {
            await firebase.database.commit();
        }
    }

    public get itemList(): TF[] {
        return Array.from(this).map(([_, category]) => category);
    }

    public get idList(): string[] {
        return Array.from(this).map(([id, _]) => id);
    }

    public getItemId(item?: TF): string {
        if (typeof item === "undefined") {
            return "";
        }
        for (const [id, currentItem] of Array.from(this)) {
            if (deepEqual(item, currentItem)) {
                return id;
            }
        }
        return "";
    }

    public set(id: string, value: TF): this {
        this.changed = true;
        return super.set(id, value);
    }

    public delete(id: string): boolean {
        if (this.get(id)) {
            this.deleted.add(id);
            this.changed = true;
        }
        return super.delete(id);
    }

    public add(item: TF): void {
        if (this.getItemId(item) === "") {
            this.set(Utils.generateRandomId(), item);
        }
    }

    public remove(item: TF): void {
        this.delete(this.getItemId(item));
    }
}