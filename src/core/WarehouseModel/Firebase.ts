/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import * as fb from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "path";
import Utils, {Queue} from "./Utils";
import deepEqual from "deep-equal";

/**
 * If true, use firebase to load and save the warehouse model to and from the database
 * If false, generate a randomised offline mock warehouse
 *
 * NOTE:
 * To configure process.env.REACT_APP_ONLINE, in the root project directory create a file named ".env.local",
 * in this file place the line "REACT_APP_ONLINE=true" or "REACT_APP_ONLINE=false" (without quotes).
 * DO NOT change the value in ".env" or ".env.production".
 * For any changes to take effect, restart the development server.
 * Further Documentation:
 * https://create-react-app.dev/docs/adding-custom-environment-variables/#adding-development-environment-variables-in-env
 */
export const ONLINE = process.env.REACT_APP_ONLINE === "true" && !process.env.CI;

type DocumentSnapshot = fb.firestore.DocumentSnapshot;
type Query = fb.firestore.Query;
type WriteBatch = fb.firestore.WriteBatch;
type Firestore = fb.firestore.Firestore;
type Auth = fb.auth.Auth;

export class FirebaseError extends Error {
}

export class AuthenticationError extends FirebaseError {
}

export class DatabaseError extends FirebaseError {
}

interface UserWarehouseSettings {
    a: boolean;
}

interface UserFields {
    isAdmin: boolean;
    name: string;
    lastWarehouseID: string;
}

export class User {
    private fields: UserFields;
    private warehouseSettings: DatabaseCollection<UserWarehouseSettings>;

    public constructor(path: string, fields?: UserFields) {
        this.warehouseSettings = new DatabaseCollection<UserWarehouseSettings>(Utils.joinPaths(path, "warehouses"));
        this.fields = fields ?? {isAdmin: false, name: "Bobman", lastWarehouseID: "MOCK 0"};
    }

    public async load(forceLoad = false): Promise<this> {
        await this.warehouseSettings.load(forceLoad);
        return this;
    }

    public get isAdmin(): boolean {
        return this.fields.isAdmin;
    }

    public get accessibleWarehouses(): string[] {
        return this.warehouseSettings.idList;
    }

    public get lastWarehouseID(): string | null {
        return this.fields.lastWarehouseID === "" ? null : this.fields.lastWarehouseID;
    }

    public get name(): string {
        return this.fields.name;
    }

}

class Authentication {
    public readonly auth: Auth;
    public onSignIn?: (user: User) => void;
    public onSignOut?: () => void;
    public currentUser?: User;

    public constructor() {
        this.auth = fb.auth();
        this.auth.onAuthStateChanged(async userSnapshot => {
            if (userSnapshot) {
                const userPath = Utils.joinPaths("users", userSnapshot.uid);
                this.currentUser = await new User(
                    userPath,
                    (await Firebase.firebase.database.loadDocument<UserFields>(userPath))?.fields
                ).load();
                this.onSignIn?.call(this, this.currentUser);
            } else {
                this.currentUser = undefined;
                this.onSignOut?.call(this);
            }
        });
    }

    public async signUp(email: string, password: string): Promise<void> {
        if (!Utils.isEmailValid(email)) {
            throw new AuthenticationError("Invalid email");
        }
        if (password.length < 8) {
            throw new AuthenticationError("Password length must be five characters or more.");
        }
        if (password.toLowerCase() !== password) {
            throw new AuthenticationError("Password must contain at least one lower and upper case character.");
        }
        await this.auth.createUserWithEmailAndPassword(email, password);
    }

    public async signIn(email: string, password: string): Promise<firebase.auth.UserCredential> {
        if (!Utils.isEmailValid(email)) {
            throw new AuthenticationError("Invalid email");
        }
        return await this.auth.signInWithEmailAndPassword(email, password);
    }

    public async signOut(): Promise<void> {
        await this.auth.signOut();
    }

    public get isSignedIn(): boolean {
        return this.auth.currentUser !== null;
    }
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

class Database {
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
        if (!Utils.isWhiteSpace(path)) {
            throw new DatabaseError("Invalid path");
        }
        this.dbChangeQueue.enqueue({type: WriteOperation.update, path: path, obj: obj});
    }

    public set<T>(path: string, obj: T): void {
        if (!Utils.isWhiteSpace(path)) {
            throw new DatabaseError("Invalid path");
        }
        this.dbChangeQueue.enqueue({type: WriteOperation.set, path: path, obj: obj});
    }

    public delete(path: string): void {
        if (!Utils.isWhiteSpace(path)) {
            throw new DatabaseError("Invalid path");
        }
        this.dbChangeQueue.enqueue({type: WriteOperation.set, path: path});
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

export class Firebase {
    public static readonly firebase: Firebase = new Firebase();

    public readonly auth: Authentication;
    public readonly database: Database;

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

        this.auth = new Authentication();
        this.database = new Database();
    }
}

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
            (await Firebase.firebase.database.loadCollection<TF>(this.collectionPath))
                .forEach(document => super.set(document.id, document.fields));
            this.loaded = true;
        }
    }

    public async stage(forceStage = false, commit = false): Promise<void> {
        if (this.changed || forceStage) {
            for (const id of Array.from(this.deleted)) {
                Firebase.firebase.database.delete(Utils.joinPaths(this.collectionPath, id));
            }
            this.deleted.clear();
            for (const [id, item] of Array.from(this)) {
                Firebase.firebase.database.set(Utils.joinPaths(this.collectionPath, id), item);
            }
        }
        if (commit) {
            await Firebase.firebase.database.commit();
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

export default Firebase.firebase;