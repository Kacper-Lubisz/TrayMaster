import {IconDefinition} from "@fortawesome/fontawesome-svg-core";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import React from "react";
import {getTextColorForBackground} from "../utils/getTextColorForBackground";
import "./styles/_keyboard.scss";

/**
 * The properties that get passed into KeyboardButton components
 * @see KeyboardButton
 */
export interface CustomButtonProps {
    /** Name to show on the button */
    name: string;

    /** Icon to use - name still appears in tooltip */
    icon?: IconDefinition;

    /** Function to call when button is clicked */
    onClick?: (e: React.MouseEvent) => void;

    /** Whether the button should be visibly selected */
    selected?: boolean;

    /**  Whether the button should be disabled */
    disabled?: boolean;

    /** Background colour to apply to the button */
    bg?: string;
}

/**
 * KeyboardButton component: returns a button to go into a keyboard
 * @see CustomButtonProps
 */
class KeyboardButton extends React.Component<CustomButtonProps> {
    render(): React.ReactNode {
        return (
            <button disabled={this.props.disabled}
                    className={classNames("key-btn btn-style-override", {
                        "key-btn-selected": this.props.selected
                    })}
                    style={this.props.bg && !this.props.disabled ? {
                        background: this.props.bg,
                        color: getTextColorForBackground(this.props.bg)
                    } : {}}
                    onClick={(e) => {
                        // if button isn't disabled, and we've been given an onClick function, run it
                        if (!this.props.disabled && this.props.onClick) {
                            this.props.onClick(e);
                            // This prevents the blue/orange outline that Chrome adds to buttons after clicking
                            // It's better to blur (de-focus) element after clicking rather than use CSS to hide the
                            // outline for accessibility reasons, because users who "tab" around the buttons need the
                            // outline
                            e.currentTarget.blur();
                        }
                    }}
            >{this.props.icon ? <FontAwesomeIcon icon={this.props.icon} title={this.props.name}/>
                              : this.props.name}</button>
        );
    }
}

/**
 * The properties that get passed into Keyboard components
 * @see Keyboard
 */
interface KeyboardProps {
    /** List of KeyboardButtonProps to give to child buttons */
    buttons: CustomButtonProps[];

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
    private generateBoard(): React.ReactNode[] {
        // calculate the number of rows we need
        const rowCount: number = Math.ceil(this.props.buttons.length / this.props.gridX);

        return Array(rowCount).fill(0).map((_, r): React.ReactNode => {

            // Work out how many buttons we've generated so far
            const pastButtons: number = r * this.props.gridX;

            return <div key={r} className="kb-row">{  // Generate the buttons in this row
                Array(Math.min(this.props.gridX, this.props.buttons.length - pastButtons))
                    .fill(0)
                    .map((_, c) =>
                        <KeyboardButton disabled={this.props.disabled}
                                        key={c}
                                        {...this.props.buttons[pastButtons + c]}
                        />
                    )
            }</div>;
        });
    }

    render(): React.ReactNode {

        return <div className="keyboard" id={this.props.id}>
            {this.generateBoard()}
        </div>;

    }
}