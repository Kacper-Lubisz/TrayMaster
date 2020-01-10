import React from "react";
import {BrowserRouter, Route, Switch} from "react-router-dom";

import SettingsPage from "./SettingsPage";
import PageNotFoundPage from "./PageNotFoundPage";

import {Settings, SettingsManager} from "./core/Settings";
import * as WarehouseModel from "./core/WarehouseModel";
import {LoadingPage} from "./Loading";
import Popup from "reactjs-popup";
import ShelfView from "./ShelfView";
import {FontAwesomeIcon, FontAwesomeIconProps} from "@fortawesome/react-fontawesome";
import {faExclamationTriangle as warningIcon} from "@fortawesome/free-solid-svg-icons";
import MainMenu from "./MainMenu";

/**
 * This interface exists because these are never null together
 */
interface LoadedContent {
    warehouse: WarehouseModel.Warehouse;
    settings: Settings;
}

interface AppState {
    loaded?: LoadedContent;
    dialog?: StandardDialog | null;
}

class App extends React.Component<any, AppState> {

    constructor(props: any) {
        super(props);

        this.state = {};

        if (process.env.NODE_ENV !== "test") {
            const loadPromise = Promise.all([
                SettingsManager.loadSettings(),
                WarehouseModel.loadWarehouse("NXhrW34QZpo20Oc3RmZw")
            ]);

            loadPromise.then((result) => {
                const [settings, warehouse] = result;
                console.log("Settings Loaded:", settings);
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
            }).catch(() => {
                this.openDialog(App.buildErrorDialog(
                    "Failed to load the warehouse or the settings",
                    true
                ));
            });
        }
    }

    render(): React.ReactNode {
        return <>
            {this.state.loaded === undefined ? <LoadingPage/> : (
                <BrowserRouter> {((loaded: LoadedContent) => {
                    return <Switch>
                        <Route path="/" component={() =>
                            <ShelfView
                                openDialog={this.openDialog.bind(this)}
                                settings={loaded.settings}
                                warehouse={loaded.warehouse}
                            />
                        } exact/>
                        <Route path="/menu" component={() =>
                            <MainMenu
                                warehouse={loaded.warehouse}
                                openDialog={this.openDialog.bind(this)}
                                expiryAmount={5}
                            />
                        }/>
                        <Route path="/settings" component={() =>
                            <SettingsPage openDialog={this.openDialog.bind(this)}/>
                        }/>
                        <Route component={PageNotFoundPage}/>
                    </Switch>;

                })(this.state.loaded)}
                </BrowserRouter>
            )}
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
     * @param message The body of the dialog
     * @param forceReload If the dialog forces the page to be reloaded
     */
    static buildErrorDialog(message: string, forceReload: boolean): (close: () => void) => StandardDialog {
        return (close: () => void) => {
            return {
                title: "Error",
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