import React from "react";
import {BrowserRouter, Route, Switch} from "react-router-dom";

import {ShelfView} from "./ShelfView";
import {MainMenu} from "./MainMenu";
import {SettingsPage} from "./SettingsPage";
import {ErrorPage} from "./ErrorPage";

import {Settings, SettingsManager} from "./core/MockSettings";
import {SearchQuery, Warehouse} from "./core/MockWarehouse";
import {SearchPage} from "./SearchPage";
import {LoadingPage} from "./Loading";

interface AppState {
    warehouse: Warehouse;
    settings: Settings;
    searchQuery?: SearchQuery;
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

            this.setState({
                warehouse: warehouse,
                settings: settings,
                searchQuery: {
                    categories: [warehouse.categories[Math.floor(Math.random() * warehouse.categories.length)]],
                    sortBy: "expiry"
                }
            });

        }).catch(() => {
            console.error("Failed to load the warehouse or the settings");
            // todo present error message
        });

    }

    render() {
        return this.state === null ? <LoadingPage/> : (
            <BrowserRouter>
                <Switch>
                    <Route path="/" component={() =>
                        <ShelfView settings={this.state.settings} warehouse={this.state.warehouse}/>
                    } exact/>
                    <Route path="/menu" component={() => <MainMenu expiryAmount={5}/>}/>
                    <Route path="/settings" component={() => <SettingsPage/>}/>
                    <Route path="/search" component={() =>
                        <SearchPage
                            warehouse={this.state?.warehouse}
                            settings={this.state?.settings}
                            query={this.state?.searchQuery}
                            setQuery={(query => {
                                this.setState({
                                    ...this.state,
                                    searchQuery: query
                                });
                            })}
                        />
                    }/>
                    <Route component={ErrorPage}/>
                </Switch>
            </BrowserRouter>
        );
    }

}

export default App;