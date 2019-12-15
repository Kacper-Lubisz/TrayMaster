import React from "react";
import {BrowserRouter, Route, Switch} from "react-router-dom";

import {ShelfView} from "./ShelfView";
import {MainMenu} from "./MainMenu";
import {Settings} from "./Settings";
import {ErrorPage} from "./ErrorPage";


class App extends React.Component<any, any> {

    render() {
        return (
            //Declare the paths for all screens
            <BrowserRouter>
                <div id="app">
                    <Switch>
                        <Route path="/" component={ShelfView} exact/>
                        <Route path="/menu" component={MainMenu}/>
                        <Route path="/settings" component={Settings}/>
                        <Route component={ErrorPage}/>
                    </Switch>
                </div>
            </BrowserRouter>
        );
    }

}


export default App;
