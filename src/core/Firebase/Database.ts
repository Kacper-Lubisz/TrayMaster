import * as fb from "firebase/app";
import "firebase/firestore";
import {ONLINE} from "../Firebase";
import Utils, {Queue} from "../WarehouseModel/Utils";
import {FirebaseError} from "./FirebaseError";

type DocumentSnapshot = fb.firestore.DocumentSnapshot;
type Query = fb.firestore.Query;
type WriteBatch = fb.firestore.WriteBatch;
type Firestore = fb.firestore.Firestore;

export class DatabaseError extends FirebaseError {
}

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
    public constructor(
        public readonly collectionPath: string,
        public readonly id: string,
        public readonly fields: TF
    ) {
    }

    public get path(): string {
        return Utils.joinPaths(this.collectionPath, this.id);
    }
}

export class Database {
    public readonly db: Firestore;
    protected readonly dbChangeQueue: Queue<DatabaseOperation<any>>;

    public constructor() {
        this.db = fb.firestore();
        if (ONLINE) {
            this.db.enablePersistence().catch(err => console.log(err));
        }

        this.dbChangeQueue = new Queue<DatabaseOperation<any>>();
    }

    //#region Writing
    public update<T>(path: string, obj: T): void {
        this.dbChangeQueue.enqueue({type: WriteOperation.update, path: path, obj: obj});
    }

    public set<T>(path: string, obj: T): void {
        this.dbChangeQueue.enqueue({type: WriteOperation.set, path: path, obj: obj});
    }

    public delete(path: string): void {
        this.dbChangeQueue.enqueue({type: WriteOperation.delete, path: path});
    }

    public async commit(): Promise<void> {
        if (ONLINE) {
            let changeCount = 0;
            const batches: WriteBatch[] = [this.db.batch()];
            while (!this.dbChangeQueue.empty) {
                const change: DatabaseOperation<any> | undefined = this.dbChangeQueue.dequeue();
                if (typeof change !== "undefined") {
                    switch (change.type) {
                        case WriteOperation.set:
                            if (typeof change.obj !== "undefined") {
                                batches[batches.length - 1].set(this.db.doc(change.path), change.obj);
                                changeCount += 1;
                            }
                            break;
                        case WriteOperation.update:
                            if (typeof change.obj !== "undefined") {
                                batches[batches.length - 1].update(this.db.doc(change.path), change.obj);
                                changeCount += 1;
                            }
                            break;
                        case WriteOperation.delete:
                            batches[batches.length - 1].delete(this.db.doc(change.path));
                            changeCount += 1;
                            break;
                    }
                }
                if (changeCount === 500) {
                    batches.push(this.db.batch());
                }
            }

            await Promise.all(batches.map(async batch => batch.commit()));
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