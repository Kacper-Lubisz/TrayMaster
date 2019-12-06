import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
//import App from './App';
import {KeyboardButtonProps, Keyboard} from "./keyboard";
import * as serviceWorker from "./serviceWorker";

//ReactDOM.render(<App />, document.getElementById('root'));


let buttons: KeyboardButtonProps[] = [];
for (let i = 0; i < 40; i++) {
  buttons.push({
    name: "Beans", onClick: () => {
      alert(i);
    }
  });
}

ReactDOM.render(<Keyboard buttons={buttons} gridX={8} height="40vh"/>, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
