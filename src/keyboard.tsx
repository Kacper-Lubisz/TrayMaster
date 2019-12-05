import React from "react";
import "styles/shelfview.scss";

// TODO: stop WebStorm getting angry about me using capitalised names for React function components -
//  I think I'm in the right here

function KeyboardButton(props: any) {
  return (<button className="key-btn" onClick={props.onClick}>{props.name}</button>);
}

