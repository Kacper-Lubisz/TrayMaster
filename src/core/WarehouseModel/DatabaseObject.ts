import * as firebase from "firebase/app";
import "firebase/firestore";
import "path";
import Utils, {Queue} from "./Utils";

type DocReference = firebase.firestore.DocumentReference;
type DocSnapshot = firebase.firestore.DocumentSnapshot;
type WriteBatch = firebase.firestore.WriteBatch;

const firebaseConfig = { // firebase config
    apiKey: "AIzaSyDkJAZhs_4Q9urSppZPkUTwFOhIPFhJADM",
    authDomain: "setest-83812.firebaseapp.com",
    databaseURL: "https://setest-83812.firebaseio.com",
    projectId: "setest-83812",
    storageBucket: "setest-83812.appspot.com",
    messagingSenderId: "889030605703",
    appId: "1:889030605703:web:1dd44027365adccf477122"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
db.enablePersistence().then((err) => {
    if (err !== undefined) console.log(err);
});


class DatabaseUpdates {
    private readonly updates: Queue<[string, DatabaseObject<any>]> = new Queue<[string, DatabaseObject<any>]>();

    public async addChange(objectDBPath: string, changedObject: DatabaseObject<any>): Promise<void> {
        this.updates.enqueue([Utils.normalisePath(objectDBPath), changedObject]);
        if (this.updates.length >= 250)
            await this.commit();
    }

    public async commit(): Promise<void> {
        const batch = db.batch();
        while (!this.updates.empty) {
            const change: [string, DatabaseObject<any>] | undefined = this.updates.dequeue();
            if (change)
                batch.set(db.doc(change[0]), change[1]);
        }
        await batch.commit();
    }
}


export abstract class DatabaseWriter {
    protected static readonly changes: DatabaseUpdates = new DatabaseUpdates();

    public static async addChange(objectDBPath: string, changedObject: DatabaseObject<any>): Promise<void> {
        await this.changes.addChange(objectDBPath, changedObject);
    }

    public static async forceSave() {
        await this.changes.commit();
    }
}


/**
 * Represents a document in the database as an object
 */
export default abstract class DatabaseObject<T> {
    private fieldsChanged: boolean = false;

    protected colPath: string = "";
    protected id: string = "";

    protected fields: T;

    protected constructor(defaultFields: T);
    protected constructor(defaultFields: T, fullPath: string);
    protected constructor(defaultFields: T, path: string, id: string);
    protected constructor(defaultFields: T, path?: string, id?: string) {
        this.init(path, id);
        this.fields = defaultFields;
    }

    protected get path(): string {
        return Utils.normalisePath(Utils.joinPaths(this.colPath, this.id));
    }

    protected init(path?: string, id?: string) {
        this.colPath = path ? Utils.normalisePath(id === undefined ? Utils.getPath(path) : path) : "";
        this.id = path ? id === undefined ? Utils.getID(path) : id : "";
    }

    protected fieldChange(): void {
        this.fieldsChanged = true;
    }

    protected get colName(): string {
        return Utils.normalisePath(this.colPath).split("/").pop() || "";
    }

    static async loadObject<T extends DatabaseObject<TF>, TF>(documentLocation: string): Promise<T> {
        const snapshot: DocSnapshot = await db.doc(documentLocation).get();
        console.log(snapshot.ref.path);
        const dbObj = {} as T;
        dbObj.init(snapshot.ref.path);
        dbObj.fields = snapshot.data() as TF;
        return dbObj;
    }

    static async loadChildObjects<T extends DatabaseObject<TF>, TF, P extends DatabaseObject<any>>
    (parent: P, collectionName: string, orderField: string): Promise<T[]> {
        return (await db.collection(`${parent.colPath}/${collectionName}`)/*.orderBy(orderField)*/
                        .get()).docs.map(snapshot => {
            const dbObj = {} as T;
            dbObj.init(snapshot.ref.path);
            dbObj.fields = snapshot.data() as TF;
            return dbObj;
        });
    }

    public async saveObj(): Promise<void> {
        if (this.fieldsChanged)
            this.save();
        this.fieldsChanged = false;
    }

    protected abstract save(): Promise<void>;
}
