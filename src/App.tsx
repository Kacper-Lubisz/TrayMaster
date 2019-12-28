import React from "react";
import {BrowserRouter, Route, Switch} from "react-router-dom";

import {ShelfView} from "./ShelfView";
import {MainMenu} from "./MainMenu";
import {SettingsPage} from "./SettingsPage";
import {PageNotFoundPage} from "./PageNotFoundPage";

import {Settings, SettingsManager} from "./core/MockSettings";
import {Warehouse} from "./core/MockWarehouse";
import {LoadingPage} from "./Loading";
import Popup from "reactjs-popup";

interface Dialog {
    title?: string;

}

interface AppState {
    warehouse: Warehouse;
    settings: Settings;
    dialog?: Dialog | null;
}

class App extends React.Component<any, AppState> {

    constructor(props: any) {
        super(props);

        const loadPromise = Promise.all([
            SettingsManager.loadSettings(),
            Warehouse.loadWarehouse("ABCD")
        ]);

        loadPromise.then((result) => {
            const [settings, warehouse] = result;
            console.log(`Settings Loaded:`, settings);
            console.log(`Warehouse Loaded:`, warehouse);

            this.setState(state => {
                return {
                    ...state,
                    warehouse: warehouse,
                    settings: settings,
                };
            });

        }).catch(() => {
            console.error("Failed to load the warehouse or the settings");
            // todo present error message
        });

    }

    render() {
        return <> {this.state === null ? <LoadingPage/> : (
            <BrowserRouter>
                <Switch>
                    <Route path="/" component={() =>
                        <ShelfView settings={this.state.settings} warehouse={this.state.warehouse}/>
                    } exact/>
                    <Route path="/menu" component={() => <MainMenu expiryAmount={5}/>}/>
                    <Route path="/settings" component={() => <SettingsPage/>}/>
                    <Route component={PageNotFoundPage}/>
                </Switch>
            </BrowserRouter>)}
            <Popup
                open={!!(this.state?.dialog ?? false)} //double negate because of falsy magic
                closeOnDocumentClick
                onClose={this.closeDialog.bind(this)}
            >
                <h1>Some shit</h1>
            </Popup>
        </>;

    }

    closeDialog() {
        this.setState((state) => {
            return {...state, dialog: null};
        });
    }

}

export default App;