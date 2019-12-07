import React from "react";
import {KeyboardButtonProps, Keyboard} from "./keyboard";

export class SideBar extends React.Component {
  render() {
    let buttons: KeyboardButtonProps[] = [
      {
        name: "Settings",
        onClick: () => {
          alert("Settings");
        }
      },
      {
        name: "Back",
        onClick: () => {
          alert("Settings");
        }
      },
      {
        name: "Edit Shelf",
        onClick: () => {
          alert("Settings");
        }
      },
      {
        name: "Navigator",
        onClick: () => {
          alert("Settings");
        }
      },
      {
        name: "Next",
        onClick: () => {
          alert("Settings");
        }
      }
    ];
    return (
      <div id="sideBar">
        <Keyboard buttons={buttons} gridX={1}/>
      </div>
    );
  }
}