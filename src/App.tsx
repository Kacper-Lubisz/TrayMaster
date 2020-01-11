import React from "react";
import {BrowserRouter, Route, Switch} from "react-router-dom";
import {Redirect} from "react-router";

import {Warehouse} from "./core/WarehouseModel";
import Popup from "reactjs-popup";
import {FontAwesomeIcon, FontAwesomeIconProps} from "@fortawesome/react-fontawesome";
import {faExclamationTriangle as warningIcon} from "@fortawesome/free-solid-svg-icons";
import {LoadingPage} from "./Loading";
import ShelfView from "./ShelfView";
import MainMenu from "./MainMenu";
import SettingsPage from "./SettingsPage";
import LoginPage from "./LoginPage";
import PageNotFoundPage from "./PageNotFoundPage";

class User2 {
}

interface AppState {
    user2?: User2;
    warehouse?: Warehouse;
    warehouses?: Warehouse[];
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

    }

    render(): React.ReactNode {
        console.log(this.state);
        return <>
            {this.state === null ? <LoadingPage/>
                                 : <BrowserRouter>
                 <Switch>
                     <Route path="/" component={() =>
                         this.state.user2 && this.state.warehouse ? <ShelfView
                             openDialog={this.openDialog.bind(this)}
                             settings={{sampleSetting: ""}}
                             warehouse={this.state.warehouse}
                         /> : <Redirect to="/login"/>
                     } exact/>
                     <Route path="/menu" component={() =>
                         this.state.user2 && this.state.warehouse ? <MainMenu
                             changeWarehouse={() => {
                                 // this.setState((state) => {
                                 //     return null;
                                 // });
                                 // WarehouseManager.loadWarehouses().then(warehouses => {
                                 //     this.setState((state) => {
                                 //         return {
                                 //             ...state,
                                 //             loginState: new WarehouseNotChosen(warehouseChosen.user, warehouses)
                                 //         };
                                 //     });
                                 // }).catch(error => {
                                 //     this.openDialog(App.buildErrorDialog(
                                 //         "Load Failed",
                                 //         error.toString(),
                                 //         false
                                 //     ));
                                 // });
                             }}
                             warehouse={this.state.warehouse}
                             openDialog={this.openDialog.bind(this)}
                             expiryAmount={5}
                         /> : <Redirect to="/login"/>
                     }/>
                     <Route path="/settings" component={() =>
                         this.state.user2 === null ? <Redirect to="/login"/> : <SettingsPage
                             openDialog={this.openDialog.bind(this)}
                         />
                     }/>
                     <Route path="/login" component={() =>
                         this.state.user2 ? <Redirect to="/"/> : <LoginPage
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