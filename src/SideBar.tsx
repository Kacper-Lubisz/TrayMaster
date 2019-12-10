import React from "react";
import {KeyboardButtonProps, Keyboard} from "./keyboard";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faHome, faClock, faWeightHanging} from "@fortawesome/free-solid-svg-icons";

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
        <div id="kb-switcher">
          <FontAwesomeIcon icon={faHome}/>
          <FontAwesomeIcon icon={faClock}/>
          <FontAwesomeIcon icon={faWeightHanging}/>
        </div>
      </div>
    );
  }
}