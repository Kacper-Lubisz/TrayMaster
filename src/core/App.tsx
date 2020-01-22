import React, {ReactNode} from "react";
import {BrowserRouter, Redirect, Route, Switch} from "react-router-dom";

import SettingsPage from "../pages/SettingsPage";
import PageNotFoundPage from "../pages/PageNotFoundPage";

import {Settings, SettingsManager} from "./Settings";
import {Warehouse, WarehouseManager} from "../core/WarehouseModel";
import SearchPage, {SearchQuery, SearchResults} from "../pages/SearchPage";
import {LoadingPage} from "../pages/Loading";
import Popup from "reactjs-popup";
import ShelfView from "../pages/ShelfViewPage";
import {FontAwesomeIcon, FontAwesomeIconProps} from "@fortawesome/react-fontawesome";
import {faExclamationTriangle as warningIcon} from "@fortawesome/free-solid-svg-icons";
import MainMenu from "../pages/MainMenu";


/**
 * This interface exists because these are never null together
 */
interface LoadedContent {
    warehouse: Warehouse;
    settings: Settings;
}

interface AppState {
    search?: SearchResults;
    loaded?: LoadedContent;
    dialog?: Dialog | null;
}

class App extends React.Component<any, AppState> {

    constructor(props: any) {
        super(props);

        this.state = {};

        if (process.env.NODE_ENV !== "test") {
            const loadPromise = Promise.all([
                SettingsManager.loadSettings(),
                WarehouseManager.loadWarehouses()
            ]);

            loadPromise.then(async (result) => {
                const [settings, warehouses] = result;
                console.log("Settings Loaded:", settings);
                console.log("Warehouse List Loaded: ", warehouses);

                const warehouse: Warehouse | undefined = await WarehouseManager.loadWarehouse("Chester-le-Street");
                if (warehouse === undefined) {
                    throw new Error("Warehouse is undefined (the desired warehouse could not be found)");
                } else {
                    console.log("Warehouse Loaded:", warehouse);

                    this.setState(state => {
                        return {
                            ...state,
                            loaded: {
                                warehouse: warehouse,
                                settings: settings,
                            }
                        };
                    });
                }
            }).catch(e => {
                this.openDialog(App.buildErrorDialog(
                    `Failed to load the warehouse or the settings (${e}).`,
                    true
                ));
            });
        }
    }

    render(): React.ReactNode {
        return <>
            {this.state.loaded === undefined ? <LoadingPage/> : (
                <BrowserRouter>
                    <Switch>
                        <Route path="/" component={((loaded: LoadedContent) => {
                            return <ShelfView
                                setSearch={this.setSearch.bind(this)}
                                openDialog={this.openDialog.bind(this)}
                                settings={loaded.settings}
                                warehouse={loaded.warehouse}
                            />;
                        }).bind(this, this.state.loaded)} exact/>
                        <Route path="/menu"
                               component={() =>
                                   <MainMenu
                                       setSearch={this.setSearch.bind(this)}
                                       openDialog={this.openDialog.bind(this)}
                                       expiryAmount={5}
                                   />
                               }/>
                        <Route path="/settings"
                               component={() => <SettingsPage openDialog={this.openDialog.bind(this)}/>}/>
                        <Route path="/search" component={() => {// todo fixme ensure that this is rerouted if there is no search
                            return this.state.search ? <SearchPage
                                warehouse={this.state.loaded?.warehouse}
                                settings={this.state.loaded?.settings}
                                search={this.state.search}
                                setQuery={this.setSearch.bind(this)}
                            /> : <Redirect to="/"/>;
                        }}/>
                        <Route component={PageNotFoundPage}/>
                    </Switch>
                </BrowserRouter>)}
            <Popup
                open={!!this.state?.dialog} //double negate because of falsy magic
                closeOnDocumentClick={this.state?.dialog?.closeOnDocumentClick}
                onClose={this.closeDialog.bind(this)}
            ><>{this.state.dialog?.dialog(this.closeDialog.bind(this))}</>
            </Popup>
        </>;

    }

    /**
     * This method allows for setting the search query
     * @param query
     */
    private setSearch(query: SearchQuery): void {
        if (this.state.loaded) {
            const loaded = this.state.loaded;
            this.setState(state => {
                return {
                    ...state,
                    search: {
                        query: query,
                        results: loaded.warehouse.traySearch(query)
                        //todo fixme finalise how and where this search is going to be performed
                        // an alternative is to keep results null until this promise resolves.
                    }
                };
            });
        } else {
            throw new Error("Can't perform search when the warehouse is undefined");
        }
    }

    /**
     * This method opens a dialog.  The dialog is passed as a function which generates the dialog given a function which
     * will close the dialog.  Only one dialog can be open at a time.
     * @param dialog The dialog to be displayed
     */
    public openDialog(dialog: Dialog): void {
        this.setState((state) => {
            return {...state, dialog: dialog};
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
     * @param message The body of the dialog
     * @param forceReload If the dialog forces the page to be reloaded
     */
    static buildErrorDialog(message: string, forceReload: boolean): Dialog {

        return {
            closeOnDocumentClick: !forceReload,
            dialog: (close: () => void) => <>
                <DialogTitle title="Error" iconProps={{icon: warningIcon, color: "red"}}/>
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

export type Dialog = {
    dialog: (close: () => void) => ReactNode;
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