import React from "react";
import {Keyboard, KeyboardButtonProps} from "./keyboard";

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
          alert("Back");
        }
      },
      {
        name: "Edit Shelf",
        onClick: () => {
          alert("Edit Shelf");
        }
      },
      {
        name: "Navigator",
        onClick: () => {
          alert("Navigator");
        }
      },
      {
        name: "Next",
        onClick: () => {
          alert("Next");
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