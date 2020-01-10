import React from "react";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import {Redirect} from "react-router";

import {Warehouse, WarehouseManager} from "./core/WarehouseModel";
import Popup from "reactjs-popup";
import {FontAwesomeIcon, FontAwesomeIconProps} from "@fortawesome/react-fontawesome";
import {faExclamationTriangle as warningIcon} from "@fortawesome/free-solid-svg-icons";
import {LoadingPage} from "./Loading";
import ShelfView from "./ShelfView";
import MainMenu from "./MainMenu";
import SettingsPage from "./SettingsPage";
import LoginPage from "./LoginPage";
import PageNotFoundPage from "./PageNotFoundPage";

interface UserSettings {
    isGood: boolean;
}

interface WarehouseSettings {
    isBig: boolean;
}

type User = {
    lastWarehouseID?: string;
} & UserLoadable;

interface UserLoadable {
    userID: string;
    name: string;
    authToken: string;
    userSettings: UserSettings;
}

interface WarehouseNotChosen {
    chosen: false;
    warehouses: Warehouse[];
}

interface WarehouseChosen {
    chosen: true;
    warehouse: Warehouse;
    warehouseSettings: WarehouseSettings;
}

/**
 * This type represents the states of the login and choose warehouse process, though it is possible to go back and
 * choose a warehouse.  The states transitions are from left to right in the type definition or otherwise only back from
 * the last to the penultimate.
 */
export type LoginState = null | User | (User & WarehouseNotChosen) | (User & WarehouseChosen);

interface AppState {
    loginState: LoginState;
    dialog?: StandardDialog | null;
}

class App extends React.Component<unknown, AppState> {

    constructor(props: unknown) {
        super(props);

        if (process.env.NODE_ENV === "test") {
            return;
        }
        if (typeof (Storage) === "undefined") {
            throw Error("This browser isn't supported"); // supported in IE 11, should be fine
        }

        if (localStorage.getItem("userData") === null) {
            this.state = { // loginState = null
                loginState: null
            };
        } else {

            const isUserData = (data: any): data is User =>
                typeof data.userID === "string" &&
                typeof data.name === "string" &&
                typeof data.authToken === "string" &&
                (data.lastWarehouseID === undefined || typeof data?.lastWarehouseID === "string");

            const userData: User | any = JSON.parse(localStorage.getItem("userData") ?? "undefined");
            console.log(JSON.stringify(userData));
            if (!isUserData(userData)) {
                localStorage.removeItem("userData");
                throw Error("Invalid stored user data, it has been cleared");
            }

            // todo fixme load user from wherever
            const loadUserData = async () => {
                return {
                    userID: userData.userID,
                    name: userData.name,
                    authToken: userData.authToken,
                    userSettings: {isGood: false}
                };
            };

            if (userData.lastWarehouseID === undefined) {
                // try make loginState User & WarehouseNotChosen, e.g. fail if auth is invalid

                loadUserData().then(user => {
                    if (user === undefined) {
                        this.openDialog(App.buildErrorDialog(
                            "Login Failed",
                            "Stored login details are no longer valid",
                            false
                        ));
                    } else {
                        this.openDialog(App.buildErrorDialog(
                            "Load Failed",
                            "Couldn't open the previous warehouse",
                            false
                        ));
                        this.setState({ // User
                            loginState: {
                                userID: user.userID,
                                name: user.name,
                                authToken: user.authToken,
                                userSettings: user.userSettings,
                                lastWarehouseID: undefined,
                            }
                        });
                    }
                });

            } else {
                // try make loginState User & WarehouseChosen, e.g. fail if auth is invalid or warehouse doesn't exist

                Promise.all([
                    loadUserData(),
                    WarehouseManager.loadWarehouseByID(userData.lastWarehouseID)
                ]).then((result: [
                    User | undefined,
                    Warehouse | undefined
                ]) => {

                    const [user, warehouse] = result;
                    if (user === undefined) {
                        this.openDialog(App.buildErrorDialog(
                            "Login Failed",
                            "Stored login details are no longer valid",
                            false
                        ));
                        // props.history.replace("/login");

                    } else if (warehouse === undefined) {
                        this.openDialog(App.buildErrorDialog(
                            "Load Failed",
                            "Couldn't open the previous warehouse",
                            false
                        ));
                        this.setState({ // User
                            loginState: {
                                userID: user.userID,
                                name: user.name,
                                authToken: user.authToken,
                                userSettings: user.userSettings,
                                lastWarehouseID: undefined,
                            }
                        });
                        // props.history.replace("/login");
                    } else {
                        this.setState({ // (User & WarehouseChosen)
                            loginState: {
                                userID: user.userID,
                                name: user.name,
                                authToken: user.authToken,
                                userSettings: user.userSettings,
                                lastWarehouseID: warehouse.id,

                                chosen: true,
                                warehouse: warehouse,
                                warehouseSettings: {isBig: true}, // todo fixme this should come from the db
                            }
                        });
                    }
                });
            }

        }

    }

    render(): React.ReactNode {
        return <>
            {this.state === null ? <LoadingPage/>
                                 : <BrowserRouter>
                 <Switch>
                     <Route path="/" component={() =>
                         this.state.loginState === null || (this.state.loginState as
                             (User & WarehouseNotChosen) | (User & WarehouseChosen)).chosen
                         ? <Redirect to="/login"/> : <ShelfView
                             openDialog={this.openDialog.bind(this)}
                             settings={{sampleSetting: ""}}
                             warehouse={(this.state.loginState as User & WarehouseChosen).warehouse}
                         />
                     } exact/>
                     <Route path="/menu" component={() =>
                         this.state.loginState === null || (this.state.loginState as
                             (User & WarehouseNotChosen) | (User & WarehouseChosen)).chosen === undefined
                         ? <Redirect to="/login"/> : <MainMenu
                             warehouse={(this.state.loginState as User & WarehouseChosen).warehouse}
                             openDialog={this.openDialog.bind(this)}
                             expiryAmount={5}
                         />
                     }/>
                     <Route path="/settings" component={() =>
                         this.state.loginState === null ? <Redirect to="/login"/> : <SettingsPage
                             openDialog={this.openDialog.bind(this)}
                         />
                     }/>
                     <Route path="/login" component={() =>
                         <LoginPage
                             loginState={this.state.loginState}
                             setLoginState={(newLoginState: LoginState) => this.setState(state => {
                                 return {...state, newLoginState};
                             })}
                             openDialog={this.openDialog.bind(this)}
                         />
                     }/>
                     <Route component={PageNotFoundPage}/>
                 </Switch>
             </BrowserRouter>
            }
            <Popup
                open={!!this.state?.dialog} //double negate because of falsy magic
                closeOnDocumentClick={false}
                onClose={this.closeDialog.bind(this)}
            >
                <> {/*empty tag because for some reason Popup overrides the type of the child props.  Making it so that a
            boolean can't be a child, which is otherwise usually legal.  Boolean because the conditionals may evaluate
            to a boolean or an Element*/}
                    {this.state?.dialog?.title ? <h1>
                        <FontAwesomeIcon {...this.state.dialog.iconProps}/> {this.state.dialog.title}
                    </h1> : null}
                    {this.state?.dialog?.message ? <p>{
                        this.state.dialog.message
                    }</p> : null}

                    {this.state?.dialog?.buttons ?
                     <div style={{float: "right"}} id={"popupButtons"}>{
                         this.state.dialog.buttons.map((button, index) =>
                             <button key={index} {...button.buttonProps}>{button.name}</button>
                         )}
                     </div> : null}
                </>
            </Popup>
        </>;

    }

    /**
     * This method opens a dialog.  The dialog is passed as a function which generates the dialog given a function which
     * will close the dialog.  Only one dialog can be open at a time.
     * @param dialog The dialog to be displayed
     */
    public openDialog(dialog: ((close: () => void) => StandardDialog)): void {
        this.setState((state) => {
            return {
                ...state,
                dialog: dialog.call(undefined, this.closeDialog.bind(this))
            };
        });
    }

    /**
     * This method closes the currently open dialog, if none is open then it does nothing.
     */
    public closeDialog(): void {
        this.setState((state) => {
            return {...state, dialog: null};
        });
    }

    /**
     * This method builds a dialog function for a standard error message.
     * @param title THe title of the error dialog
     * @param message The body of the dialog
     * @param forceReload If the dialog forces the page to be reloaded
     */
    static buildErrorDialog(
        title: string, message: string, forceReload: boolean): (close: () => void) => StandardDialog {
        return (close: () => void) => {
            return {
                title: title,
                iconProps: {
                    icon: warningIcon,
                    color: "red"
                },
                message: message,
                buttons: [
                    {
                        name: "Reload", buttonProps: {
                            onClick: () => window.location.reload(),
                            style: {borderColor: "red"}
                        }
                    }
                ].concat(forceReload ? [] : {
                    name: "Ok", buttonProps: {
                        onClick: () => close(),
                        style: {borderColor: "red"}
                    }
                }),
                closeOnDocumentClick: !forceReload
            };
        };
    }

}

/**
 * This is the interface to represent the buttons of a dialog
 */
export interface DialogButton {
    name: string;
    buttonProps: React.ButtonHTMLAttributes<HTMLButtonElement>;
}

/**
 * This interface represents all possible dialogs that can be displayed
 */
export interface StandardDialog {
    title?: string;
    iconProps: FontAwesomeIconProps;
    message?: string;
    buttons?: DialogButton[];
    closeOnDocumentClick: boolean;
}

export default App;