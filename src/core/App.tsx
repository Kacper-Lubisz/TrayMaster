import React from "react";
import {BrowserRouter, Redirect, Route, Switch} from "react-router-dom";
import Popup from "reactjs-popup";
import {buildErrorDialog, Dialog, StoredDialog} from "../components/Dialog";
import ErrorHandler from "../components/ErrorHandler";
import {ViewPortLocation} from "../components/ViewPort";
import FindPage, {FindQuery, FindResults} from "../pages/FindPage";
import {LoadingPage} from "../pages/Loading";
import MainMenu from "../pages/MainMenu";
import PageNotFoundPage from "../pages/PageNotFoundPage";
import SettingsPage from "../pages/SettingsPage";
import ShelfViewPage from "../pages/ShelfViewPage";
import SignInPage from "../pages/SignInPage";
import WarehouseSwitcher from "../pages/WarehouseSwitcher";

import firebase, {User} from "./Firebase";
import {Warehouse, WarehouseManager, WarehouseModel} from "./WarehouseModel";


interface AppState {
    loading: boolean;
    find: FindResults | null;
    user: User | null;
    warehouse: Warehouse | null;
    dialog: StoredDialog | null;
    currentView: ViewPortLocation | null;
}

class App extends React.Component<unknown, AppState> {

    constructor(props: unknown) {
        super(props);

        if (process.env.NODE_ENV === "test") {
            this.state = {
                loading: true,
                find: null,
                user: null,
                warehouse: null,
                dialog: null,
                currentView: null,
            };
            return;
        }
        if (typeof (Storage) === "undefined") {
            throw Error("This browser isn't supported"); // supported in IE 11, should be fine
        }

        const onSignIn = (user: User): void => {
            WarehouseManager.loadWarehouses().then(() => {

                if (user.lastWarehouseID === null) {
                    this.setState(state => ({
                        ...state,
                        user: user,
                        loading: false
                    }));
                } else {
                    WarehouseManager.loadWarehouseByID(user.lastWarehouseID).then(warehouse => {

                        const currentView: ViewPortLocation = (() => {
                            if (warehouse.zones.length === 0) {
                                return warehouse;
                            } else if (warehouse.shelves.length === 0) {
                                return warehouse.zones[0];
                            } else {
                                warehouse.shelves[0].load(true, WarehouseModel.tray).then(() => {
                                    this.forceUpdate();
                                });
                                return warehouse.shelves[0];
                            }
                        })();

                        this.setState(state => ({
                            ...state,
                            user: user,
                            warehouse: warehouse,
                            currentView: currentView,
                            loading: false
                        }));
                    }).catch((reason) => {
                        this.setState(state => ({
                            ...state,
                            user: user,
                            loading: false
                        }));
                        this.openDialog(buildErrorDialog(
                            "Load Failed",
                            `Failed to load last warehouse, with error "${reason}"`,
                            false
                        ));
                    });
                }
            });
        };

        const onSignOut = (): void => {
            this.setState(state => ({
                ...state,
                user: null,
                loading: false
            }));
        };

        firebase.auth.registerListeners(onSignIn, onSignOut).then();

        this.state = {
            loading: true,
            find: null,
            user: null,
            warehouse: null,
            dialog: null,
            currentView: null,
        };

    }

    render(): React.ReactNode {

        return <>
            {this.state === null || this.state.loading ? <LoadingPage/> : <BrowserRouter
                forceRefresh={false}><ErrorHandler>
                <Switch>
                    <Route path="/" exact>
                        {this.state.user && this.state.warehouse && this.state.currentView ? <ShelfViewPage
                            setFind={this.setFindQuery.bind(this)}
                            openDialog={this.openDialog.bind(this)}

                            warehouse={this.state.warehouse}
                            user={this.state.user}

                            currentView={this.state.currentView}
                            setCurrentView={(newView) => {
                                this.setState((state) => ({
                                    ...state,
                                    currentView: newView
                                }));
                            }}
                        /> : <Redirect to="/menu"/>}
                    </Route>
                    <Route path="/menu">{(() => {
                        if (this.state.user && this.state.warehouse) {
                            return <MainMenu
                                changeWarehouse={() => {
                                    this.setState(state => ({
                                        ...state,
                                        warehouse: null
                                    }));
                                }}
                                signOut={this.signOut.bind(this)}
                                user={this.state.user}
                                setFind={this.setFindQuery.bind(this)}
                                warehouse={this.state.warehouse}
                                openDialog={this.openDialog.bind(this)}
                            />;

                        } else if (!this.state.user) {
                            return <Redirect to={"/signin"}/>;
                        } else {
                            return <Redirect to={"/warehouses"}/>;
                        }
                    })}</Route>
                    <Route path="/settings"> {(() => {
                        if (!this.state.user) {
                            return <Redirect to={"/signin"}/>;
                        } else if (!this.state.warehouse) {
                            return <Redirect to={"/warehouses"}/>;
                        } else {
                            return <SettingsPage
                                user={this.state.user}
                                warehouse={this.state.warehouse}
                                openDialog={this.openDialog.bind(this)}
                            />;
                        }
                    })()}</Route>
                    <Route path="/signin">{
                        this.state.user ? <Redirect to={"/menu"}/> : <SignInPage openDialog={this.openDialog.bind(this)}
                        />
                    }</Route>
                    <Route path="/warehouses">{(() => {
                        if (this.state.user && this.state.warehouse) {
                            return <Redirect to={"/menu"}/>;
                        } else if (!this.state.user) {
                            return <Redirect to={"/signin"}/>;
                        } else {
                            return <WarehouseSwitcher
                                user={this.state.user}
                                signOut={this.signOut.bind(this)}
                                setWarehouse={this.setWarehouse.bind(this)}
                            />;
                        }
                    })()}</Route>
                    <Route path="/find">{
                        this.state.user && this.state.warehouse ?
                        this.state.find ? <FindPage
                            warehouse={this.state.warehouse}
                            find={this.state.find}
                            setQuery={this.setFindQuery.bind(this)}
                            setCurrentView={async (newView) => {
                                this.setState((state) => ({
                                    ...state,
                                    currentView: newView
                                }));
                                await newView.load(true, WarehouseModel.tray);
                                this.forceUpdate();
                            }}
                        /> : <Redirect to="/"/> : <Redirect to="/menu"/>
                    }</Route>
                    <Route component={PageNotFoundPage}/>
                </Switch>
            </ErrorHandler>
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

    private async signOut(): Promise<void> {
        await firebase.auth.signOut();
        this.setState(state => ({
            ...state,
            dialog: state.dialog,
            user: null,
            warehouse: null
        }));
    }

    /**
     * This method sets the current warehouse
     * @param warehouse The warehouse to be set
     */
    private async setWarehouse(warehouse: Warehouse): Promise<void> {

        if (this.state.user) {
            this.state.user.lastWarehouseID = warehouse.id;
            if (!warehouse.childrenLoaded) {
                await WarehouseManager.loadWarehouse(warehouse);
            }
            await this.state.user.stage(false, true);
        }

        const currentView: ViewPortLocation = (() => {
            if (warehouse.zones.length === 0) {
                return warehouse;
            } else if (warehouse.shelves.length === 0) {
                return warehouse.zones[0];
            } else {
                warehouse.shelves[0].load(true, WarehouseModel.tray).then(() => {
                    this.forceUpdate();
                });
                return warehouse.shelves[0];
            }
        })();


        this.setState(state => ({
            ...state,
            warehouse: warehouse,
            currentView: currentView
        }));
    }


    /**
     * This method allows for setting the find query
     * @param query
     */
    private async setFindQuery(query: FindQuery): Promise<void> {
        if (this.state.warehouse) {
            const warehouse = this.state.warehouse;

            this.setState(state => ({
                ...state,
                find: {
                    query: query,
                    outcome: true,
                    results: null
                }
            }));

            const results = await warehouse.trayFind(query);
            this.setState(state => ({
                ...state,
                find: {
                    query: query,
                    results: results
                }
            }));

        } else {
            throw new Error("Can't perform find when the warehouse is undefined");
        }
    }


    /**
     * This method opens a dialog.  The dialog is passed as a function which generates the dialog given a function which
     * will close the dialog.  Only one dialog can be open at a time.
     * @param dialog The dialog to be displayed
     */
    private openDialog(dialog: Dialog): void {
        this.setState(state => ({
            ...state,
            dialog: {
                dialog: dialog.dialog(this.closeDialog.bind(this)),
                closeOnDocumentClick: dialog.closeOnDocumentClick
            }
        }));
    }

    /**
     * This method closes the currently open dialog, if none is open then it does nothing.
     */
    private closeDialog(): void {
        this.setState((state) => {
            return {...state, dialog: null};
        });
    }

}

export default App;