import * as fb from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import "path";
import Utils, {Queue} from "./Utils";


type DocReference = fb.firestore.DocumentReference;
type DocSnapshot = fb.firestore.DocumentSnapshot;
type WriteBatch = fb.firestore.WriteBatch;
type Firestore = fb.firestore.Firestore;

//type Authentication = fb.auth.Auth; // todo: authentication


class Firebase {
    public readonly db: Firestore;

    public constructor() {
        const firebaseConfig = { // firebase config
            apiKey: "AIzaSyDkJAZhs_4Q9urSppZPkUTwFOhIPFhJADM",
            authDomain: "setest-83812.firebaseapp.com",
            databaseURL: "https://setest-83812.firebaseio.com",
            projectId: "setest-83812",
            storageBucket: "setest-83812.appspot.com",
            messagingSenderId: "889030605703",
            appId: "1:889030605703:web:1dd44027365adccf477122"
        };

        fb.initializeApp(firebaseConfig);

        this.db = fb.firestore();
        this.db.enablePersistence().catch(err => console.log(err));
    }
}

const firebase: Firebase = new Firebase();


class DatabaseUpdates {
    private readonly updates: Queue<[string, DatabaseObject<any> | any]> = new Queue<[string, DatabaseObject<any>]>();

    public async addChange<T>(objectDBPath: string, objectInstance: T): Promise<void> {
        this.updates.enqueue([Utils.normalisePath(objectDBPath), objectInstance]);
        if (this.updates.length === 500) {
            await this.commit();
        }
    }

    public async commit(): Promise<void> {
        console.log("Committing...");
        const batch: WriteBatch = firebase.db.batch();
        while (!this.updates.empty) {
            const change: [string, any] | undefined = this.updates.dequeue();
            if (change)
                batch.set(firebase.db.doc(change[0]), change[1]);
        }
        await batch.commit();
    }
}


export abstract class DatabaseWriter {
    protected static readonly changes: DatabaseUpdates = new DatabaseUpdates();

    public static async addChange<T>(objectDBPath: string, objectInstance: T): Promise<void> {
        await this.changes.addChange(objectDBPath, objectInstance);
    }

    public static async writeChanges(): Promise<void> {
        await this.changes.commit();
    }
}


/**
 * Represents a document in the database as an object
 */
export default abstract class DatabaseObject<TF> {
    private fieldsChanged: boolean;

    public colPath: string;
    public id: string;

    protected fields: TF;

    protected constructor(defaultFields: TF);
    protected constructor(defaultFields: TF, fullPath: string);
    protected constructor(defaultFields: TF, path: string, id: string);
    protected constructor(defaultFields: TF, path?: string, id?: string) {
        this.colPath = "";
        this.id = "";
        this.init(path, id);
        this.fields = defaultFields;
        this.fieldsChanged = false;
    }

    protected get path(): string {
        return Utils.normalisePath(Utils.joinPaths(this.colPath, this.id));
    }

    protected init(path?: string, id?: string): void {
        if (typeof path === "string") {
            this.colPath = Utils.normalisePath(id === undefined ? Utils.getPath(path) : path);
            this.id = id === undefined ? Utils.getID(path) : id;
        }
    }

    protected get docRef(): DocReference {
        return firebase.db.doc(this.path);
    }

    public childCollection(collection: string): string {
        return Utils.joinPaths(this.path, collection);
    }

    protected fieldChange(): void {
        this.fieldsChanged = true;
    }

    protected get colName(): string {
        return Utils.normalisePath(this.colPath).split("/").pop() || "";
    }

    static async loadObject<T extends DatabaseObject<TF>, TF>(documentLocation: string): Promise<T> {
        const snapshot: DocSnapshot = await firebase.db.doc(documentLocation).get();
        console.log(snapshot.ref.path);
        const dbObj = {} as T;
        dbObj.init(snapshot.ref.path);
        dbObj.fields = snapshot.data() as TF;
        return dbObj;
    }

    static async loadChildObjects<T extends DatabaseObject<TF>, TF, P extends DatabaseObject<any>>
    (parent: P, collectionName: string, orderField: string): Promise<T[]> {
        return (await firebase.db.collection(`${parent.colPath}/${collectionName}`).orderBy(orderField)
                              .get()).docs.map(snapshot => {
            const dbObj = {} as T;
            dbObj.init(snapshot.ref.path);
            dbObj.fields = snapshot.data() as TF;
            return dbObj;
        });
    }

    public async saveObj(): Promise<void> {
        if (this.fieldsChanged) {
            await this.save();
            this.fieldsChanged = false;
        }
    }

    protected abstract save(): Promise<void>;
}
