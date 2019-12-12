import React from "react";
import {KeyboardButtonProps, Keyboard} from "./keyboard";
import {IconDefinition} from "@fortawesome/fontawesome-svg-core";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faHome, faClock, faWeightHanging} from "@fortawesome/free-solid-svg-icons";

export type KeyboardName = "category" | "expiry" | "weight";

interface SideBarProps {
  keyboardSwitcher: (name: KeyboardName) => void
}

interface SideBarState {
  activeButton: KeyboardName
}

interface KeyboardSwitchBtnProps {
  active: boolean,
  onClick: any,
  icon: IconDefinition
}

class KeyboardSwitchBtn extends React.Component<KeyboardSwitchBtnProps> {
  render() {
    return (
      <button className={this.props.active ? "active" : ""} onClick={(e) => this.props.onClick(e)}>
        <FontAwesomeIcon icon={this.props.icon}/>
      </button>
    );
  }
}

export class SideBar extends React.Component<SideBarProps, SideBarState> {
  buttons: KeyboardButtonProps[];

  constructor(props: SideBarProps) {
    super(props);
    this.buttons = [
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
    this.state = {
      activeButton: "category"
    };
  }

  changeKeyboard(name: KeyboardName) {
    this.props.keyboardSwitcher(name);
    this.setState({
      ...this.state,
      activeButton: name
    });
  }

  render() {
    return (
      <div id="sideBar">
        <Keyboard buttons={this.buttons} gridX={1}/>

        <div id="kb-switcher">
          <KeyboardSwitchBtn active={(this.state.activeButton === "category")}
                             onClick={() => this.changeKeyboard("category")} icon={faHome}/>
          <KeyboardSwitchBtn active={(this.state.activeButton === "expiry")}
                             onClick={() => this.changeKeyboard("expiry")} icon={faClock}/>
          <KeyboardSwitchBtn active={(this.state.activeButton === "weight")}
                             onClick={() => this.changeKeyboard("weight")} icon={faWeightHanging}/>
        </div>
      </div>
    );
  }
}