import * as fb from "firebase/app";
import "firebase/auth";
import {KeyboardName} from "../../pages/ShelfViewPage";
import {ONLINE} from "../Firebase";
import {WarehouseManager} from "../WarehouseModel";
import {Warehouse} from "../WarehouseModel/Layers/Warehouse";
import Utils from "../WarehouseModel/Utils";
import {DatabaseObject} from "./DatabaseObject";
import {FirebaseError} from "./FirebaseError";

type Auth = fb.auth.Auth;

export class AuthenticationError extends FirebaseError {
}

/**
 * The various auto-advance modes
 * off is off
 * a list defines a cycle
 */
export type AutoAdvanceModes = null | (KeyboardName[]);

interface UserFields {
    isAdmin: boolean;
    name: string;

    accessibleWarehouseIDs: string[];
    lastWarehouseID: string;

    autoAdvanceMode: AutoAdvanceModes;
    onlySingleAutoAdvance: boolean;

    showPreviousShelfButton: boolean;

    clearAboveSelection: boolean;
}

export class User extends DatabaseObject<UserFields> {
    private static defaultFields: UserFields = {
        isAdmin: false,
        name: "",
        accessibleWarehouseIDs: [],
        lastWarehouseID: "",
        autoAdvanceMode: null,
        onlySingleAutoAdvance: false,
        showPreviousShelfButton: false,
        clearAboveSelection: true
    };

    public constructor(id: string, fields?: UserFields) {
        super(id, fields ?? User.defaultFields);
    }

    public async load(forceLoad = false): Promise<this> {
        if (ONLINE) {
            await super.load(forceLoad);
            this.fields = {
                ...User.defaultFields,
                ...this.fields
            };
            return this;
        } else {
            this.fields = {
                ...User.defaultFields,
                name: "Offline User",
                accessibleWarehouseIDs: ["MOCK_WAREHOUSE_0", "MOCK_WAREHOUSE_1"],
                lastWarehouseID: "MOCK_WAREHOUSE_0"
            };
            return this;
        }
    }

    public get accessibleWarehouses(): Warehouse[] {
        return WarehouseManager.warehouseList.filter(warehouse => this.fields.accessibleWarehouseIDs.includes(warehouse.id));
    }

    public get lastWarehouseID(): string | null {
        return this.fields.lastWarehouseID === "" ? null : this.fields.lastWarehouseID;
    }

    public set lastWarehouseID(lastWarehouseID: string | null) {
        this.fields.lastWarehouseID = lastWarehouseID ?? "";
    }

    public get collectionPath(): string {
        return "users";
    }

    public get isAdmin(): boolean {
        return this.fields.isAdmin;
    }

    public get name(): string {
        return this.fields.name;
    }

    public set name(name: string) {
        this.fields.name = name;
    }

    public get autoAdvanceMode(): AutoAdvanceModes {
        return this.fields.autoAdvanceMode;
    }

    public set autoAdvanceMode(autoAdvanceMode: AutoAdvanceModes) {
        this.fields.autoAdvanceMode = autoAdvanceMode;
    }

    public get onlySingleAutoAdvance(): boolean {
        return this.fields.onlySingleAutoAdvance;
    }

    public set onlySingleAutoAdvance(onlySingleAutoAdvance: boolean) {
        this.fields.onlySingleAutoAdvance = onlySingleAutoAdvance;
    }

    public get showPreviousShelfButton(): boolean {
        return this.fields.showPreviousShelfButton;
    }

    public set showPreviousShelfButton(showPreviousShelfButton: boolean) {
        this.fields.showPreviousShelfButton = showPreviousShelfButton;
    }

    public get clearAboveSelection(): boolean {
        return this.fields.clearAboveSelection;
    }

    public set clearAboveSelection(clearAboveSelection: boolean) {
        this.fields.clearAboveSelection = clearAboveSelection;
    }
}

export class Authentication {
    public readonly auth: Auth;
    public currentUser?: User;

    private onSignIn?: (user: User) => void;
    private onSignOut?: () => void;

    public constructor() {
        this.auth = fb.auth();
        // if (!ONLINE) {
        //     this.auth.setPersistence(fb.auth.Auth.Persistence.NONE).catch(error => console.log(error));
        // }
    }

    public async registerListeners(onSignIn?: (user: User) => void, onSignOut?: () => void): Promise<void> {
        this.onSignIn = onSignIn;
        this.onSignOut = onSignOut;
        if (ONLINE) {
            this.auth.onAuthStateChanged(async userSnapshot => {
                if (userSnapshot) {
                    this.currentUser = await new User(userSnapshot.uid).load();
                    onSignIn?.call(this, this.currentUser);
                } else {
                    this.currentUser = undefined;
                    onSignOut?.call(this);
                }
            });
        } else {
            this.currentUser = await new User("MOCK_USER").load();
            onSignIn?.call(this, this.currentUser);
        }
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
        if (ONLINE) {
            // Call to firebase to create the user, if successful the above onAuthStateChanged will be called with a user
            await this.auth.createUserWithEmailAndPassword(email, password);
        } else {
            this.currentUser = await new User("MOCK_USER").load();
            this.onSignIn?.call(this, this.currentUser);
        }
    }

    public async signIn(email: string, password: string): Promise<void> {
        if (!Utils.isEmailValid(email)) {
            throw new AuthenticationError("Invalid email");
        }
        if (ONLINE) {
            // Call to firebase to sign in the user, if successful the above onAuthStateChanged will be called with a user
            await this.auth.signInWithEmailAndPassword(email, password);
        } else {
            this.currentUser = await new User("MOCK_USER").load();
            this.onSignIn?.call(this, this.currentUser);
        }
    }

    public async signOut(): Promise<void> {
        if (ONLINE) {
            // Once signed out, the above onAuthStateChanged will be called with a null user
            await this.auth.signOut();
        } else {
            this.onSignOut?.call(this);
        }
    }

    public get isSignedIn(): boolean {
        return this.auth.currentUser !== null;
    }
}