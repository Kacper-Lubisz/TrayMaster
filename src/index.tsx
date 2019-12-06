import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
//import App from './App';
import Keyboard from "./keyboard";
import * as serviceWorker from "./serviceWorker";

//ReactDOM.render(<App />, document.getElementById('root'));

let buttons = [];
for (let i = 0; i < 40; i++) {
  buttons.push(["Beans", i]);
}

ReactDOM.render(<Keyboard buttons={buttons} width={8}/>, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
