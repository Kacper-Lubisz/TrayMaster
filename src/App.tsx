import React from "react";
import {BrowserRouter, Route, Switch} from "react-router-dom";

import {ShelfView} from "./ShelfView";
import {MainMenu} from "./MainMenu";
import {SettingsPage} from "./SettingsPage";
import {ErrorPage} from "./ErrorPage";

import {Settings, SettingsManager} from "./core/MockSettings";
import {Warehouse} from "./core/MockWarehouse";

interface AppState {
    warehouse: Warehouse
    settings: Settings
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
            console.log(`Settings Loaded:\n    sampleSetting: ${settings.sampleSetting}`);
            console.log(`Warehouse Loaded: ${warehouse}`);

            this.setState({
                warehouse: warehouse,
                settings: settings
            });

        }).catch(() => {
            console.error("Failed to load the warehouse of the settings");
            // todo present error message
        });

    }

    render() {
        return (
            //Declare the paths for all screens
            <BrowserRouter>
                <Switch>
                    <Route path="/" component={() => {
                        if (this.state === null) {
                            return <div>Loading</div>;
                            // todo add a loading screen
                            // fixme this loading screen could surround the entire router
                        } else {
                            return <ShelfView settings={this.state.settings} warehouse={this.state.warehouse}/>;
                        }
                    }} exact/>
                    <Route path="/menu" component={() => <MainMenu expiryAmount={5}/>}/>
                    <Route path="/settings" component={() => <SettingsPage/>}/>
                    <Route component={ErrorPage}/>
                </Switch>
            </BrowserRouter>
        );
    }

}

export default App;