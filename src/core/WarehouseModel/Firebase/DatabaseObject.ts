import * as firebase from "firebase/app";
import "firebase/firestore";
import * as path from "path";


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
    if (err !== undefined) console.log(err)
});


/**
 * Represents a document in the database as an object
 */
export default abstract class DatabaseObject {
    protected path: string;

    protected constructor(path: string) {
        this.path = path;
    }

    // protected readonly id: () => string = (): string => this.location.split("/").pop() || "";
    protected get id(): string {
        return this.path.split("/").pop() || "";
    }

    protected set id(id: string) {
        this.path = path.posix.join(this.path.split("/").slice(0, -1).join("/"), id);
    }

    protected getChildPath(childId: string): string {
        return path.posix.join(this.path, childId);
    }

    static async loadObject<T extends DatabaseObject>(documentLocation: string): Promise<T> {
        const snapshot: firebase.firestore.DocumentSnapshot = await db.doc(documentLocation).get();
        const layerInstance: T = snapshot.data() as T;
        layerInstance.path = snapshot.ref.path;
        return layerInstance;
    }

    static async loadObjects<T extends DatabaseObject>(collectionLocation: string, orderField: string): Promise<T[]> {
        return (await db.collection(collectionLocation).orderBy(orderField).get()).docs.map(snapshot => {
            const dbObj: T = snapshot.data() as T;
            dbObj.path = snapshot.ref.path;
            return dbObj;
        });
    }

    public async saveObject(): Promise<void> {
        db.batch();
    }

    public async saveObjects(): Promise<void> {
        db.batch();
    }
}
