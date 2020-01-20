import React, {ReactNode} from "react";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import {Redirect} from "react-router";

import {Warehouse, WarehouseManager} from "../core/WarehouseModel";
import Popup from "reactjs-popup";
import {FontAwesomeIcon, FontAwesomeIconProps} from "@fortawesome/react-fontawesome";
import {faExclamationTriangle as warningIcon, faHome} from "@fortawesome/free-solid-svg-icons";

import MainMenu from "../pages/MainMenu";
import firebase, {User} from "./Firebase";
import {LoadingPage} from "../pages/Loading";
import SettingsPage from "../pages/SettingsPage";
import PageNotFoundPage from "../pages/PageNotFoundPage";
import ShelfViewPage from "../pages/ShelfViewPage";
import SignInPage from "../pages/LoginPage";

interface AppState {
    loading: boolean;
    user?: User | undefined;
    warehouse?: Warehouse;
    dialog?: StoredDialog | null;
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

        firebase.auth.onSignIn = (user: User) => {
            if (user.lastWarehouseID === null) {
                this.setState((state) => {
                    return {
                        ...state,
                        user: user,
                        loading: false
                    };
                });
                (async () => {
                    await WarehouseManager.loadWarehouses();
                    const warehouse = await WarehouseManager.loadWarehouseByID("MOCK 0");
                    this.setState((state) => {
                        return {
                            ...state,
                            warehouse: warehouse,
                            user: user,
                            loading: false
                        };
                    });
                })();
            } else {
                WarehouseManager.loadWarehouseByID(user.lastWarehouseID).then(warehouse => {
                    this.setState({
                        user: user,
                        warehouse: warehouse,
                        loading: false
                    });
                }).catch((reason) => {
                    this.openDialog(App.buildErrorDialog(
                        "Load Failed",
                        `Failed to load last warehouse ${reason}`,
                        false
                    ));
                });
            }
        };
        firebase.auth.onSignOut = () => {
            this.setState({
                user: undefined,
                loading: false
            });
        };
        // if (!firebase.auth.isSignedIn)


        this.state = {
            loading: true
        };

    }

    render(): React.ReactNode {
        return <>
            {this.state === null || this.state.loading ? <LoadingPage/> : <BrowserRouter><Switch>
                <Route path="/" component={() =>
                    this.state.user && this.state.warehouse ? <ShelfViewPage
                        openDialog={this.openDialog.bind(this)}
                        settings={{sampleSetting: ""}}
                        warehouse={this.state.warehouse}
                    /> : <Redirect to="/menu"/>
                } exact/>
                <Route path="/menu" component={() =>
                    this.state.user ? <MainMenu
                        changeWarehouse={(user: User) => {
                            this.openDialog({
                                closeOnDocumentClick: true,
                                dialog: (close) => <ChangeWarehouseDialog close={close} user={user}/>
                            });
                        }}
                        signIn={() => {
                            // this.props.history.push("/login");
                        }}
                        signOut={async () => {
                            await firebase.auth.signOut();
                            this.setState(state => {
                                return {
                                    dialog: state.dialog,
                                    user: undefined,
                                    warehouse: undefined
                                };
                            });
                        }}
                        user={this.state.user}
                        warehouse={this.state.warehouse}
                        openDialog={this.openDialog.bind(this)}
                        expiryAmount={5} //todo fixme
                    /> : <Redirect to={"/signin"}/>
                }/>
                <Route path="/settings" component={() =>
                    this.state.user === null ? <Redirect to="/login"/> : <SettingsPage
                        warehouse={this.state.warehouse}
                        openDialog={this.openDialog.bind(this)}
                    />
                }/>
                <Route path="/signin" component={() =>
                    this.state.user ? <Redirect to={"/menu"}/> : <SignInPage/>
                }/>
                <Route component={PageNotFoundPage}/>
            </Switch>
            </BrowserRouter>
            }
            <Popup
                open={!!this.state?.dialog} //double negate because of falsy magic
                closeOnDocumentClick={this.state?.dialog?.closeOnDocumentClick}
                onClose={this.closeDialog.bind(this)}
            ><>{this.state.dialog?.dialog}</>
            </Popup>
        </>;

    }

    /**
     * This method opens a dialog.  The dialog is passed as a function which generates the dialog given a function which
     * will close the dialog.  Only one dialog can be open at a time.
     * @param dialog The dialog to be displayed
     */
    public openDialog(dialog: Dialog): void {
        this.setState((state) => {
            return {
                ...state,
                dialog: {
                    dialog: dialog.dialog(this.closeDialog.bind(this)),
                    closeOnDocumentClick: dialog.closeOnDocumentClick
                }
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
    static buildErrorDialog(title: string, message: string, forceReload: boolean): Dialog {

        return {
            closeOnDocumentClick: !forceReload,
            dialog: (close: () => void) => <>
                <DialogTitle title={title} iconProps={{icon: warningIcon, color: "red"}}/>
                <p>{message}</p>
                <DialogButtons buttons={[
                    {
                        name: "Reload", buttonProps: {
                            onClick: () => window.location.reload(),
                            style: {borderColor: "red"}
                        }
                    }
                ].concat(forceReload ? [] : {
                    name: "Ok", buttonProps: {
                        onClick: close,
                        style: {borderColor: "red"}
                    }
                })}/>
            </>
        };
    }

}

interface ChangeWarehouseDialogProps {
    user: User;
    close: () => void;
}


class ChangeWarehouseDialog extends React.Component<ChangeWarehouseDialogProps> {
    render(): React.ReactNode {
        return <div>
            <h1>Change Warehouse</h1>

            {this.props.user.accessibleWarehouses.length === 0 ? <p>
                You don't have access to any warehouse! Contact your administrator, more info in the manual
            </p> : <div id="warehouseList">{
                this.props.user.accessibleWarehouses.map((warehouseID, index) =>
                    <div key={index} onClick={async () => {
                        const warehouse: Warehouse = await
                            WarehouseManager.loadWarehouseByID(warehouseID); // todo fixme make this show the name
                        this.setState((state) => {
                            return {...state, warehouse: warehouse};
                        });
                        this.props.close();
                    }}>
                        <FontAwesomeIcon icon={faHome}/>
                        <p>{warehouseID}</p>
                    </div>
                )
            }</div>}
        </div>;
    }
}


export type Dialog = {
    dialog: (close: () => void) => ReactNode;
    closeOnDocumentClick: boolean;
};

type StoredDialog = {
    dialog: ReactNode;
    closeOnDocumentClick: boolean;
};

export type DialogTitleProps = { title: string; iconProps?: FontAwesomeIconProps };

/**
 * The standard dialog sub component which contains the title and icon
 */
export class DialogTitle extends React.Component<DialogTitleProps> {
    render(): React.ReactNode {
        return <h1 className={"dialogTitle"}> {this.props.iconProps ?
                                               <FontAwesomeIcon {...this.props.iconProps}/> : null}
            {this.props.title}
        </h1>;
    }
}

/**
 * This is the interface to represent the buttons of a dialog
 */
export interface DialogButton {
    name: string;
    buttonProps: React.ButtonHTMLAttributes<HTMLButtonElement>;
}


export type DialogButtonsProps = { buttons: DialogButton[] };

/**
 * The standard dialog sub component which contains buttons
 */
export class DialogButtons extends React.Component<DialogButtonsProps> {
    render(): React.ReactNode {
        return <div className="dialogButtons">{this.props.buttons.map((button, index) =>
            <button key={index} {...button.buttonProps}>{button.name}</button>
        )}</div>;
    }
}

export default App;