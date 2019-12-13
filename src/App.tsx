import React from "react";
import {BrowserRouter, Route, Switch} from "react-router-dom";

import {ShelfView} from "./ShelfView";
import {MainMenu} from "./MainMenu";
import {Settings} from "./Settings";
import {Error} from "./Error"


class App extends React.Component<any, any> {


  render() {
    return (
      //Declare the paths for all screens
      <BrowserRouter>
        <div id="app">
          <Switch>
            <Route path="/" component={ShelfView} exact/>
            <Route path="/Menu" component={MainMenu}/>
            <Route path="/Settings" component={Settings}/>
            <Route component={Error}/>
          </Switch>
        </div>
        </BrowserRouter>
        );
        }

        }


        export default App;
