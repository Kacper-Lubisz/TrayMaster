import React from "react";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import {Redirect} from "react-router";

import {Warehouse, WarehouseManager} from "../core/WarehouseModel";
import Popup from "reactjs-popup";

import MainMenu from "../pages/MainMenu";
import firebase, {User} from "./Firebase";
import {LoadingPage} from "../pages/Loading";
import SettingsPage from "../pages/SettingsPage";
import PageNotFoundPage from "../pages/PageNotFoundPage";
import ShelfViewPage from "../pages/ShelfViewPage";
import SignInPage from "../pages/SignInPage";
import WarehouseSwitcher from "../pages/WarehouseSwitcher";
import {buildErrorDialog, Dialog, StoredDialog} from "./Dialog";

interface AppState {
    loading: boolean;
    user?: User | null;
    warehouse?: Warehouse | null;
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

        const onSignIn = (user: User): void => {
            WarehouseManager.loadWarehouses().then(() => {

                if (user.lastWarehouseID === null) {
                    this.setState(state => {
                        return {
                            ...state,
                            user: user,
                            loading: false
                        };
                    });
                } else {
                    WarehouseManager.loadWarehouseByID(user.lastWarehouseID).then(warehouse => {
                        this.setState(state => {
                            return {
                                ...state,
                                user: user,
                                warehouse: warehouse,
                                loading: false
                            };
                        });
                    }).catch((reason) => {
                        this.openDialog(buildErrorDialog(
                            "Load Failed",
                            `Failed to load last warehouse ${reason}`,
                            false
                        ));
                    });
                }
            });
        };

        const onSignOut = (): void => {
            this.setState(state => {
                return {
                    ...state,
                    user: undefined,
                    loading: false
                };
            });
        };

        firebase.auth.registerListeners(onSignIn, onSignOut).then();

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
                        warehouse={this.state.warehouse}
                    /> : <Redirect to="/menu"/>
                } exact/>
                <Route path="/menu" component={() => (() => {
                    if (this.state.user && this.state.warehouse) {
                        return <MainMenu
                            changeWarehouse={() => {
                                this.setState(state => {
                                    return {
                                        ...state,
                                        warehouse: undefined
                                    };
                                });
                            }}
                            signOut={async () => {
                                await firebase.auth.signOut();
                                this.setState(state => {
                                    return {
                                        ...state,
                                        dialog: state.dialog,
                                        user: null,
                                        warehouse: null
                                    };
                                });
                            }}
                            user={this.state.user}
                            warehouse={this.state.warehouse}
                            openDialog={this.openDialog.bind(this)}
                            expiryAmount={5} //todo fixme
                        />;

                    } else if (!this.state.user) {
                        return <Redirect to={"/signin"}/>;

                    } else {
                        return <Redirect to={"/warehouses"}/>;

                    }
                })()}/>
                <Route path="/settings" component={() => (() => {
                    if (!this.state.user) {
                        return <Redirect to={"/signin"}/>;
                    } else if (!this.state.warehouse) {
                        return <Redirect to={"/warehouses"}/>;
                    } else {
                        return <SettingsPage
                            warehouse={this.state.warehouse}
                            openDialog={this.openDialog.bind(this)}
                        />;
                    }
                })()}/>
                <Route path="/signin" component={() =>
                    this.state.user ? <Redirect to={"/menu"}/> : <SignInPage/>
                }/>
                <Route path="/warehouses" component={() => (() => {
                    if (this.state.user && this.state.warehouse) {
                        return <Redirect to={"/menu"}/>;
                    } else if (!this.state.user) {
                        return <Redirect to={"/signin"}/>;
                    } else {
                        return <WarehouseSwitcher
                            user={this.state.user}
                            setWarehouse={this.setWarehouse.bind(this)}
                        />;
                    }
                })()}/>
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
     * This method sets the current warehouse
     * @param warehouse The warehouse to be set
     */
    private setWarehouse(warehouse: Warehouse): void {
        this.setState(state => {
            if (state.user) {
                state.user.lastWarehouseID = warehouse.id;
                // noinspection JSIgnoredPromiseFromCall
                // state.user.stage(false, true);
            }
            //todo decide if this needs to call any load the warehouse or anything like that
            return {
                ...state,
                warehouse: warehouse
            };
        });
    }

    /**
     * This method opens a dialog.  The dialog is passed as a function which generates the dialog given a function which
     * will close the dialog.  Only one dialog can be open at a time.
     * @param dialog The dialog to be displayed
     */
    public openDialog(dialog: Dialog): void {
        this.setState(state => {
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

}

export default App;