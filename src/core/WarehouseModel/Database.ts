import * as fb from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "path";
import Utils, {Queue} from "./Utils";
import {ONLINE} from "../WarehouseModel";
import deepEqual from "deep-equal";


type DocumentSnapshot = fb.firestore.DocumentSnapshot;
type Query = fb.firestore.Query;
type WriteBatch = fb.firestore.WriteBatch;
type Firestore = fb.firestore.Firestore;

//type Authentication = fb.auth.Auth; // todo: authentication


enum WriteOperation {
    set,
    update,
    delete
}

interface DatabaseOperation<T> {
    type: WriteOperation;
    path: string;
    obj?: T;
}

export class DatabaseDocument<TF> {
    public constructor(public readonly collectionPath: string, public readonly id: string, public readonly fields: TF) {
    }

    public get path(): string {
        return Utils.joinPaths(this.collectionPath, this.id);
    }
}

class Firebase {
    public static firebase: Firebase = new Firebase();

    public readonly db: Firestore;
    protected readonly dbChangeQueue: Queue<DatabaseOperation<any>>;

    public constructor() {
        const firebaseConfig = {
            apiKey: "AIzaSyDR3NWkFU7G9F5CZNrZ1GvSz0GXZ3qcj9w",
            authDomain: "shelfmaster-b719c.firebaseapp.com",
            databaseURL: "https://shelfmaster-b719c.firebaseio.com",
            projectId: "shelfmaster-b719c",
            storageBucket: "shelfmaster-b719c.appspot.com",
            messagingSenderId: "94491668696",
            appId: "1:94491668696:web:66c6e469d7bc1167b827ad"
        };

        fb.initializeApp(firebaseConfig);

        this.db = fb.firestore();
        this.db.enablePersistence().catch(err => console.log(err));

        this.dbChangeQueue = new Queue<DatabaseOperation<any>>();
    }

    //#region Writing
    public async update<T>(path: string, obj: T): Promise<void> {
        this.dbChangeQueue.enqueue({type: WriteOperation.update, path: path, obj: obj});
    }

    public async set<T>(path: string, obj: T): Promise<void> {
        this.dbChangeQueue.enqueue({type: WriteOperation.set, path: path, obj: obj});
    }

    public async delete(path: string): Promise<void> {
        this.dbChangeQueue.enqueue({type: WriteOperation.set, path: path});
    }

    public async commit(): Promise<void> {
        if (ONLINE) {
            const batch: WriteBatch = this.db.batch();
            while (!this.dbChangeQueue.empty) {
                const change: DatabaseOperation<any> | undefined = this.dbChangeQueue.dequeue();
                if (typeof change !== "undefined") {
                    switch (change.type) {
                        case WriteOperation.set:
                            if (typeof change.obj !== "undefined") {
                                batch.set(this.db.doc(change.path), change.obj);
                            }
                            break;
                        case WriteOperation.update:
                            if (typeof change.obj !== "undefined") {
                                batch.update(this.db.doc(change.path), change.obj);
                            }
                            break;
                        case WriteOperation.delete:
                            batch.delete(this.db.doc(change.path));
                            break;
                    }
                }
            }
            await batch.commit();
        } else {
            this.dbChangeQueue.clear();
        }
    }

    //#endregion

    //#region Reading
    public async loadDocument<TF>(path: string): Promise<DatabaseDocument<TF> | undefined> {
        if (!ONLINE) {
            return;
        }
        const response: DocumentSnapshot = await this.db.doc(path).get();
        return new DatabaseDocument<TF>(response.ref.parent.path, response.id, response.data() as TF);
    }

    public async loadCollection<TF>(path: string): Promise<DatabaseDocument<TF>[]> {
        if (!ONLINE) {
            return [];
        }
        return (await this.db.collection(path).get()).docs.map(snapshot =>
            new DatabaseDocument<TF>(snapshot.ref.parent.path, snapshot.id, snapshot.data() as TF));
    }

    public async loadQuery<TF>(query: Query): Promise<DatabaseDocument<TF>[]> {
        if (!ONLINE) {
            return [];
        }
        return (await query.get()).docs.map(snapshot =>
            new DatabaseDocument<TF>(snapshot.ref.parent.path, snapshot.id, snapshot.data() as TF));
    }

    //#endregion
}


export class DatabaseCollection<TF> extends Map<string, TF> {
    protected readonly collectionPath: string;
    protected changed: boolean;
    protected deleted: Set<string>;

    public constructor(collectionPath: string, values?: [string, TF][]) {
        if (values) {
            super(values);
        } else {
            super();
        }
        this.collectionPath = collectionPath;
        this.changed = false;
        this.deleted = new Set<string>();
    }

    public async load(): Promise<void> {
        (await Firebase.firebase.loadCollection<TF>(this.collectionPath))
            .forEach(document => super.set(document.id, document.fields));
    }

    public async save(forceSave = false, forceCommit = false): Promise<void> {
        if (this.changed || forceSave) {
            for (const id of Array.from(this.deleted)) {
                await Firebase.firebase.delete(Utils.joinPaths(this.collectionPath, id));
            }
            this.deleted.clear();
            for (const [id, item] of Array.from(this)) {
                await Firebase.firebase.set(Utils.joinPaths(this.collectionPath, id), item);
            }
        }
        if (forceCommit) {
            await Firebase.firebase.commit();
        }
    }

    public get itemList(): TF[] {
        return Array.from(this).map(([_, category]) => category);
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

export default (): Firebase => Firebase.firebase;
