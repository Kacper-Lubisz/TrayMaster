import {IconDefinition} from "@fortawesome/fontawesome-svg-core";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React from "react";
import {KeyboardName} from "../pages/ShelfViewPage";
import {getTextColorForBackground} from "../utils/getTextColorForBackground";
import {CustomButtonProps} from "./Keyboard";
import "./styles/_sidebar.scss";


export type SideBarButtonProps = CustomButtonProps & {
    halfWidth: boolean;
};

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
    buttons: (SideBarButtonProps | null)[];
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
 * Main sidebar object
 */
export class SideBar extends React.Component<SideBarProps> {

    render(): React.ReactNode {
        return <div id="sideBar">
            <div
                id="shelfName"
                className={this.props.openNavigatorDisabled ? "disabled" : undefined}
                style={this.props.openNavigatorDisabled ? undefined : {
                    backgroundColor: this.props.zoneColor,
                    color: getTextColorForBackground(this.props.zoneColor)
                }}
                onClick={this.props.openNavigatorDisabled ? undefined : this.props.openNavigator}
            >
                <h2>{this.props.locationString}</h2>
            </div>

            <div id="sidebar-buttons-main">{
                this.props.buttons.filter((props): props is SideBarButtonProps =>
                    props !== null).map((button, index) =>
                    <button
                        key={index}
                        onClick={(e) => {
                            button?.onClick?.call(undefined, e);
                            e.currentTarget.blur();
                        }}
                        className={button.halfWidth ? "halfWidth" : ""}
                        disabled={button.disabled}
                    >{
                        button.icon ? <FontAwesomeIcon icon={button.icon} title={button.name}/>
                                    : button.name
                    }</button>
                )
            }</div>

            {this.props.showKeyboardSwitcher ? <div id="kb-switcher">{
                this.props.keyboards.map((keyboard, index) =>
                    <button
                        key={index}
                        className={classNames("btn-style-override", {
                            "active": this.props.currentKeyboard === keyboard.name
                        })} onClick={this.props.keyboardSwitcher.bind(undefined, keyboard.name)}>
                        <FontAwesomeIcon icon={keyboard.icon}/>
                    </button>
                )}
            </div> : null}
        </div>;

    }
}