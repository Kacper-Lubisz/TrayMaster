import * as fb from "firebase/app";
import {Authentication} from "./Firebase/Authentication";
import {Database} from "./Firebase/Database";

/**
 * If true, use firebase to load and save the warehouse model to and from the database
 * If false, generate a randomised offline mock warehouse
 *
 * NOTE:
 * To configure process.env.REACT_APP_ONLINE locally, in the project root directory create a file named ".env.local".
 * In this file place the line "REACT_APP_ONLINE=true" or "REACT_APP_ONLINE=false" (without quotes).
 * DO NOT change the value in ".env".
 * For any changes to take effect, restart the development server.
 * Further Documentation:
 * https://create-react-app.dev/docs/adding-custom-environment-variables/#adding-development-environment-variables-in-env
 */
export const ONLINE = process.env.REACT_APP_ONLINE !== "false";

export class Firebase {
    public static readonly firebase: Firebase = new Firebase();

    public readonly auth: Authentication;
    public readonly database: Database;

    public constructor() {
        const firebaseConfig = {
            apiKey: process.env.REACT_APP_FIREBASE_apiKey,
            authDomain: process.env.REACT_APP_FIREBASE_authDomain,
            databaseURL: process.env.REACT_APP_FIREBASE_databaseURL,
            projectId: process.env.REACT_APP_FIREBASE_projectId,
            storageBucket: process.env.REACT_APP_FIREBASE_storageBucket,
            messagingSenderId: process.env.REACT_APP_FIREBASE_messagingSenderId,
            appId: process.env.REACT_APP_FIREBASE_appId
        };

        fb.initializeApp(firebaseConfig);

        this.auth = new Authentication();
        this.database = new Database();
    }
}

export {User} from "./Firebase/Authentication";
export default Firebase.firebase;