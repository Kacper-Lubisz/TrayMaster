import * as fb from "firebase/app";
import {Database} from "./Firebase/Database";
import {Authentication} from "./Firebase/Authentication";

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

export {User} from "./Firebase/Authentication";
export default Firebase.firebase;