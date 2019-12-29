import React from "react";
import classNames from "classnames";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {IconDefinition} from "@fortawesome/fontawesome-svg-core";

/**
 * The properties that get passed into KeyboardButton components
 * @see KeyboardButton
 */
export interface KeyboardButtonProps {
    /** Name to show on the button */
    name: string;

    /** Icon to use: replaces name */
    icon?: IconDefinition;

    /** Function to call when button is clicked */
    onClick?: (e: React.MouseEvent) => void;

    /** Whether the button should be visibly selected */
    selected?: boolean;

    /**  Whether the button should be disabled */
    disabled?: boolean;
}

/**
 * KeyboardButton component: returns a button to go into a keyboard
 * @see KeyboardButtonProps
 */
class KeyboardButton extends React.Component<KeyboardButtonProps> {
    render() {
        return (
            <button disabled={this.props.disabled}
                    className=className={classNames("key-btn", {
                "key-btn-selected": this.props.selected
            })} onClick={(e) => {
                // if button isn't disabled, and we've been given an onClick function, run it
                if (!this.props.disabled && this.props.onClick) {
                    this.props.onClick(e);
                    // This prevents the blue/orange outline that Chrome adds to buttons after clicking
                    // It's better to blur (defocus) element after clicking rather than use CSS to hide the outline
                    // for accessibility reasons, because users who "tab" around the buttons need the outline
                    e.currentTarget.blur();
                }
            }}>{this.props.icon ? <FontAwesomeIcon icon={this.props.icon}/> : this.props.name}</button>
        );
    }
}

/**
 * The properties that get passed into Keyboard components
 * @see Keyboard
 */
interface KeyboardProps {
    /** List of KeyboardButtonProps to give to child buttons */
    buttons: KeyboardButtonProps[];

    /** Number of buttons to show in each horizontal row */
    gridX: number;

    /** Id to give parent HTML element */
    id?: string;

    /** Whether to grey out the keyboard */
    disabled?: boolean;
}

/**
 * Keyboard component: returns a full-width keyboard with the given buttons and grid width
 * @see KeyboardProps
 */
export class Keyboard extends React.Component<KeyboardProps> {

    /**
     * Generate and return an object representing a full keyboard based on the given props
     */
    generateBoard() {
        // calculate the number of rows we need
        const rowCount: number = Math.ceil(this.props.buttons.length / this.props.gridX);

        return Array(rowCount).fill(0).map((_, r) => {

            // Work out how many buttons we've generated so far
            const pastButtons: number = r * this.props.gridX;

            return (<div key={r} className="kb-row">
                {  // Generate the buttons in this row
                    Array(Math.min(this.props.gridX, this.props.buttons.length - pastButtons)).fill(0).map((_, c) => {
                        return <KeyboardButton disabled={this.props.disabled}
                                               key={c} {...this.props.buttons[pastButtons + c]}/>;
                    })
                }
            </div>);
        });
    }

    render() {

        return (
            <div className="keyboard" id={this.props.id}>
                {this.generateBoard()}
            </div>
        );
    }
}