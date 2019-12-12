import React from "react";
import {KeyboardButtonProps, Keyboard} from "./keyboard";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faHome, faClock, faWeightHanging} from "@fortawesome/free-solid-svg-icons";

export type KeyboardName = "category" | "expiry" | "weight";

interface SideBarProps {
  keyboardSwitcher: (name: KeyboardName) => void
}

export class SideBar extends React.Component<SideBarProps> {
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
          <button onClick={() => this.props.keyboardSwitcher("category")}>
            <FontAwesomeIcon icon={faHome}/>
          </button>
          <button onClick={() => this.props.keyboardSwitcher("expiry")}>
            <FontAwesomeIcon icon={faClock}/>
          </button>
          <button onClick={() => this.props.keyboardSwitcher("weight")}>
            <FontAwesomeIcon icon={faWeightHanging}/>
          </button>
        </div>
      </div>
    );
  }
}