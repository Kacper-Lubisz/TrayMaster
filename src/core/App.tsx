import React from "react";
import {BrowserRouter, Redirect, Route, Switch} from "react-router-dom";
import Popup from "reactjs-popup";
import {LoadingPage} from "../pages/Loading";
import MainMenu from "../pages/MainMenu";
import PageNotFoundPage from "../pages/PageNotFoundPage";
import SearchPage, {SearchQuery, SearchResults} from "../pages/SearchPage";
import SettingsPage from "../pages/SettingsPage";
import ShelfViewPage from "../pages/ShelfViewPage";
import SignInPage from "../pages/SignInPage";
import WarehouseSwitcher from "../pages/WarehouseSwitcher";
import {compareVersions} from "../utils/compareVersions";
import {buildErrorDialog, Dialog, DialogButtons, DialogTitle, StoredDialog} from "./Dialog";
import ErrorHandler from "./ErrorHandler";

import firebase, {User} from "./Firebase";
import {Warehouse, WarehouseManager} from "./WarehouseModel";


interface AppState {
    search?: SearchResults;
    loading: boolean;
    user?: User | null;
    warehouse?: Warehouse | null;
    dialog?: StoredDialog | null;
}

class App extends React.Component<unknown, AppState> {

    constructor(props: unknown) {
        super(props);

        if (process.env.NODE_ENV === "test") {
            this.state = {loading: true};
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
                        this.setState(state => ({
                            ...state,
                            user: user,
                            warehouse: warehouse,
                            loading: false
                        }));
                    }).catch((reason) => {
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
                user: undefined,
                loading: false
            }));
        };

        firebase.auth.registerListeners(onSignIn, onSignOut).then();

        this.state = {
            loading: true
        };

    }

    componentDidMount(): void {

        // to force this to trigger, call
        // localStorage.clear("VERSION_NUMBER")
        // or
        // localStorage.setItem("VERSION_NUMBER", "test version");

        const oldVersion = localStorage.getItem("VERSION_NUMBER");
        if (process.env.REACT_APP_VERSION !== oldVersion && process.env.NODE_ENV === "production") {
            localStorage.setItem("VERSION_NUMBER", process.env.REACT_APP_VERSION ?? "");
            const verDiff: 1 | 0 | -1 = ((old, current) => {
                if (old === null) {
                    return 1;
                } else if (current === undefined) {
                    return 0;
                }
                return compareVersions(old, current);
            })(oldVersion, process.env.REACT_APP_VERSION);

            const message: string = (() => {
                if (verDiff === 1) {
                    return `You've been updated from ${oldVersion ?? "a previous version"} to ${process.env.REACT_APP_VERSION ?? "the latest version"}!`;
                } else if (verDiff === -1) {
                    return `We've rolled you back from ${oldVersion ?? "a newer version"} to ${process.env.REACT_APP_VERSION ?? "a previous version"}. This has probably been done so that we can work to iron out some bugs that you might have encountered!`;
                }
                return "Your version number has changed, but something seems to have gone wrong. Sorry!";
            })();

            this.openDialog({
                closeOnDocumentClick: true,
                dialog: (close: () => void) => {
                    return <>
                        <DialogTitle title="TrayMaster Update"/>
                        <div className="dialogContent">
                            <p>{message}</p>
                            <DialogButtons buttons={[{name: "Thanks!", buttonProps: {onClick: close,}}]}/>
                        </div>
                    </>;
                }
            });
        }

    }

    render(): React.ReactNode {

        return <>
            {this.state === null || this.state.loading ? <LoadingPage/> : <BrowserRouter
                forceRefresh={false}><ErrorHandler>
                <Switch>
                    <Route path="/" exact>
                        {this.state.user && this.state.warehouse ? <ShelfViewPage
                            setSearch={this.setSearch.bind(this)}
                            openDialog={this.openDialog.bind(this)}

                            warehouse={this.state.warehouse}
                            user={this.state.user}
                        /> : <Redirect to="/menu"/>}
                    </Route>
                    <Route path="/menu">{(() => {
                        if (this.state.user && this.state.warehouse) {
                            return <MainMenu
                                changeWarehouse={() => {
                                    this.setState(state => ({
                                        ...state,
                                        warehouse: undefined
                                    }));
                                }}
                                signOut={async () => {
                                    await firebase.auth.signOut();
                                    this.setState(state => ({
                                        ...state,
                                        dialog: state.dialog,
                                        user: null,
                                        warehouse: null
                                    }));
                                }}
                                user={this.state.user}
                                setSearch={this.setSearch.bind(this)}
                                warehouse={this.state.warehouse} openDialog={this.openDialog.bind(this)}
                                expiryAmount={5}//todo fixme
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
                        this.state.user ? <Redirect to={"/menu"}/> : <SignInPage/>
                    }</Route>
                    <Route path="/warehouses">{(() => {
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
                    })()}</Route>
                    <Route path="/search">{
                        this.state.user && this.state.warehouse ?
                        this.state.search ? <SearchPage
                            warehouse={this.state.warehouse}
                            search={this.state.search}
                            setQuery={this.setSearch.bind(this)}
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

    /**
     * This method sets the current warehouse
     * @param warehouse The warehouse to be set
     */
    private setWarehouse(warehouse: Warehouse): void {
        this.setState(state => {
            if (state.user) {
                state.user.lastWarehouseID = warehouse.id;
                if (!warehouse.childrenLoaded) {
                    WarehouseManager.loadWarehouse(warehouse).then(); // todo change to async await with loading screen
                }
                state.user.stage(false, true).then();
            }
            //todo decide if this needs to call any load the warehouse or anything like that
            return {
                ...state,
                warehouse: warehouse
            };
        });
    }


    /**
     * This method allows for setting the search query
     * @param query
     */
    private async setSearch(query: SearchQuery): Promise<void> {
        if (this.state.warehouse) {
            const warehouse = this.state.warehouse;

            this.setState(state => ({
                ...state,
                search: {
                    query: query,
                    results: null
                }
            }));

            const results = await warehouse.traySearch(query);
            this.setState(state => ({
                    ...state,
                    search: {
                        query: query,
                        results: results
                    }
                })
            );

        } else {
            throw new Error("Can't perform search when the warehouse is undefined");
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