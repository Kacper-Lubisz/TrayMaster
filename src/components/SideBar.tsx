import {IconDefinition} from "@fortawesome/fontawesome-svg-core";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React from "react";
import {KeyboardName} from "../pages/ShelfViewPage";
import {getTextColorForBackground} from "../utils/getTextColorForBackground";
import {Keyboard, KeyboardButtonProps} from "./Keyboard";
import "./styles/_sidebar.scss";


/**
 * Props to be passed into SideBar
 * @see SideBar
 */
interface SideBarProps {
    /**
     * Function passed in from parent to call when keyboard needs to be switched
     * @param name - name of keyboard to switch to
     */
    keyboardSwitcher: (name: KeyboardName) => void;

    /** List of buttons for the keyboard part of the side panel, null is just ignored */
    buttons: (KeyboardButtonProps | null)[];
    /** List of button keyboard switches */
    keyboards: KeyboardSwitch[];
    /** The current keyboard, used for highlighting the active */
    currentKeyboard: KeyboardName;
    /** If the keyboardSwitcher should be displayed */
    showKeyboardSwitcher: boolean;

    /** This string is to describe the current location */
    locationString: string;
    /** This color is the color of the current zone */
    zoneColor: string;

    /** Opens the navigator */
    openNavigator?: () => void;
    openNavigatorDisabled: boolean;
}

/**
 * This interface represents each individual keyboard switcher button
 */
interface KeyboardSwitch {
    icon: IconDefinition;
    name: KeyboardName;
}

/**
 * Props to pass into keyboard switch buttons
 */
interface KeyboardSwitchBtnProps {
    /** Whether the button is active (ie whether it should be blue) */
    active: boolean;

    /** Function to call when the button is clicked */
    onClick: any;

    /** Icon to show on the button */
    icon: IconDefinition;
}

/**
 * Button to switch keyboards
 */
class KeyboardSwitchBtn extends React.Component<KeyboardSwitchBtnProps> {
    render(): React.ReactNode {
        return (
            // by this point this.props.onClick has had bind called on it 2 times
            <button className={classNames("btn-style-override", {
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

    render(): React.ReactNode {
        return <div id="sideBar">

            <div
                id="navigatorButton"
                className={this.props.openNavigatorDisabled ? "disabled" : undefined}
                style={this.props.openNavigatorDisabled ? undefined : {
                    backgroundColor: this.props.zoneColor,
                    color: getTextColorForBackground(this.props.zoneColor)
                }}
                onClick={this.props.openNavigatorDisabled ? undefined : this.props.openNavigator}
            >
                <h2>{this.props.locationString}</h2>
            </div>

            <div id="side-keyboard-container"> {/* Constrains sidebar keyboard(s) vertically when necessary*/}
                <Keyboard
                    buttons={this.props.buttons.filter((button): button is KeyboardButtonProps =>
                        button !== null
                    )}
                    gridX={1}
                />
            </div>

            {this.props.showKeyboardSwitcher ? <div id="kb-switcher">
                {this.props.keyboards.map((keyboard) =>
                    <KeyboardSwitchBtn
                        key={keyboard.name}
                        active={this.props.currentKeyboard === keyboard.name}
                        onClick={this.props.keyboardSwitcher.bind(undefined, keyboard.name)}
                        icon={keyboard.icon}
                    />
                )}
            </div> : null}
        </div>;

    }
}