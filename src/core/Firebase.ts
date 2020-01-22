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
            apiKey: "AIzaSyCYLusdThwIe0NKuKPerO-LT4NKOq88qfM",
            authDomain: "traymaster-ea059.firebaseapp.com",
            databaseURL: "https://traymaster-ea059.firebaseio.com",
            projectId: "traymaster-ea059",
            storageBucket: "traymaster-ea059.appspot.com",
            messagingSenderId: "467309929406",
            appId: "1:467309929406:web:9f94f529e0e70e16fa8fef"
        };

        fb.initializeApp(firebaseConfig);

        this.auth = new Authentication();
        this.database = new Database();
    }
}

export {User} from "./Firebase/Authentication";
export default Firebase.firebase;