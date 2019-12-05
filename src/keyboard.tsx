import React from "react";
import "styles/shelfview.scss";

// TODO: stop WebStorm getting angry about me using capitalised names for React function components -
//  I think I'm in the right here

interface KeyboardButtonProps {
  name: string,
  onClick: any // TODO: check that onClick should be any and not void or something
}

function KeyboardButton(props: KeyboardButtonProps) {
  return (<button className="key-btn" onClick={props.onClick}>{props.name}</button>);
}

