import React from "react";
import {Keyboard, KeyboardButtonProps} from "./keyboard";
import {IconDefinition} from "@fortawesome/fontawesome-svg-core";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {KeyboardName} from "./ShelfView";
import classNames from "classnames";


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

    /**
     * List of buttons for the keyboard part of the side panel
     */
    buttons: KeyboardButtonProps[];

    /**
     * List of button keyboard switches
     */
    keyboards: KeyboardSwitch[]

    /**
     * The current keyboard, used for highlighting the active
     */
    currentKeyboard: KeyboardName

    /**
     * If the keyboardSwitcher should be displayed
     */
    showKeyboardSwitcher: boolean

}

/**
 * This interface represents each individual keyboard switcher button
 */
interface KeyboardSwitch {
    icon: IconDefinition,
    name: KeyboardName
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
            // by this point this.props.onClick has had bind called on it 2 times
            <button className={classNames({
                "active": this.props.active
            })} onClick={this.props.onClick}>
                <FontAwesomeIcon icon={this.props.icon}/>
            </button>
        );
    }
}

/**
 * Main sidebar object
 */
export class SideBar extends React.Component<SideBarProps> {

    render() {
        return (
            <div id="sideBar">
                <Keyboard buttons={this.props.buttons} gridX={1}/>

                {this.props.showKeyboardSwitcher && <div id="kb-switcher">
                    {this.props.keyboards.map((keyboard) =>
                        <KeyboardSwitchBtn
                            key={keyboard.name}
                            active={this.props.currentKeyboard === keyboard.name}
                            onClick={this.props.keyboardSwitcher.bind(undefined, keyboard.name)}
                            icon={keyboard.icon}
                        />
                    )}
                </div>}
            </div>
        );
    }
}