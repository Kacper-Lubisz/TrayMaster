import React from "react";
import {Keyboard, KeyboardButtonProps} from "./keyboard";
import {IconDefinition} from "@fortawesome/fontawesome-svg-core";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClock, faHome, faWeightHanging} from "@fortawesome/free-solid-svg-icons";

/**
 * Defines possible keyboard names
 */
export type KeyboardName = "category" | "expiry" | "weight";

/**
 * Props to be passed into SideBar
 * @see SideBar
 */
interface SideBarProps {
    /**
     * Function passed in from parent to call when keyboard needs to be switched
     * @param name - name of keyboard to switch to
     */
    keyboardSwitcher: (name: KeyboardName) => void

    buttons: KeyboardButtonProps[];
}

/**
 * State of SideBar: contains the name of the currently active keyboard
 * @see SideBar
 * @see KeyboardName
 */
interface SideBarState {
    activeButton: KeyboardName
}

/**
 * Props to pass into keyboard switch buttons
 */
interface KeyboardSwitchBtnProps {
    /**
     * Whether the button is active (ie whether it should be blue)
     */
    active: boolean,

    /**
     * Function to call when the button is clicked
     */
    onClick: any,

    /**
     * Icon to show on the button
     */
    icon: IconDefinition
}

/**
 * Button to switch keyboards
 */
class KeyboardSwitchBtn extends React.Component<KeyboardSwitchBtnProps> {
    render() {
        return (
            <button className={this.props.active ? "active" : ""} onClick={(e) => this.props.onClick(e)}>
                <FontAwesomeIcon icon={this.props.icon}/>
            </button>
        );
    }
}

/**
 * Main sidebar object
 */
export class SideBar extends React.Component<SideBarProps, SideBarState> {

    constructor(props: SideBarProps) {
        super(props);

        // Set initial active button
        this.state = {
            activeButton: "category"
        };
    }

    // Function to be called when switcher buttons are clicked
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
                <Keyboard buttons={this.props.buttons} gridX={1}/>

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