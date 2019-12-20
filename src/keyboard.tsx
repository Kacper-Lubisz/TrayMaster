import React from "react";

/**
 * The properties that get passed into KeyboardButton components
 * @see KeyboardButton
 */
export interface KeyboardButtonProps {
    /**
     * Name to show on the button
     */
    name: string,

    /**
     * Function to call when button is clicked
     * @param e
     */
    onClick?: (e: React.MouseEvent) => void

    /**
     * Whether the button should be visibly selected
     */
    selected?: boolean
}

/**
 * KeyboardButton component: returns a button to go into a keyboard
 * @see KeyboardButtonProps
 */
class KeyboardButton extends React.Component<KeyboardButtonProps> {
    render() {
        return (
            <button className={`key-btn${this.props.selected ? " key-btn-selected" : ""}`} onClick={(e) => {
                // if we've been given an onClick function, run it
                if (this.props.onClick) {
                    this.props.onClick(e);
                }
            }}>{this.props.name}</button>
        );
    }
}

/**
 * The properties that get passed into Keyboard components
 * @see Keyboard
 */
interface KeyboardProps {
    /**
     * List of KeyboardButtonProps to give to child buttons
     */
    buttons: KeyboardButtonProps[],

    /**
     * Number of buttons to show in each horizontal row
     */
    gridX: number,

    /**
     * Id to give parent HTML element
     */
    id?: string
}

/**
 * Keyboard component: returns a full-width keyboard with the given buttons, grid width and height
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
                        return <KeyboardButton key={c} {...this.props.buttons[pastButtons + c]}/>;
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