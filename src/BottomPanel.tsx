import React from "react";
import {Keyboard, KeyboardButtonProps} from "./keyboard";
import {KeyboardName} from "./ShelfView";

export interface BottomPanelProps {
    keyboardState: KeyboardName

    categories: KeyboardButtonProps[];
}

/**
 * This class represents the enter bottom panel component.  This component manages the various BottomPanelPages.
 * @see BottomPanelPage
 */
export class BottomPanel extends React.Component<BottomPanelProps, any> {
    years: KeyboardButtonProps[];
    quarters: KeyboardButtonProps[];
    months: KeyboardButtonProps[];
    numpad: KeyboardButtonProps[];
    numpadR: KeyboardButtonProps[];

    constructor(props: BottomPanelProps) {
        super(props);

        // GENERATE KEYBOARD BUTTON STRUCTURES
        this.years = [];
        for (let i = 2019; i < 2027; i++) {
            this.years.push({
                name: i.toString(), onClick: () => {
                    alert(i);
                }
            });
        }

        this.quarters = [];
        const quartersTranslator: string[] = [
            "Jan-Mar",
            "Apr-Jun",
            "Jul-Sep",
            "Oct-Dec"
        ];
        for (let i = 1; i <= 4; i++) {
            this.quarters.push({
                name: quartersTranslator[i - 1], onClick: () => {
                    alert(i);
                }
            });
        }

        this.months = [];
        const monthsTranslator: string[] = [
            "Jan", "Feb", "Mar",
            "Apr", "May", "Jun",
            "Jul", "Aug", "Sep",
            "Oct", "Nov", "Dec"
        ];
        for (let i = 1; i <= 12; i++) {
            this.months.push({
                name: monthsTranslator[i - 1], onClick: () => {
                    alert(i);
                }
            });
        }
        this.numpad = [];
        for (let i = 9; i >= 0; i--) {
            this.numpad.push({
                name: i.toString(), onClick: () => {
                    alert(i);
                }
            });
        }
        this.numpad.push({
            name: ".", onClick: () => {
                alert("Max is our favourite scrum master");
            }
        });
        this.numpadR = [
            {
                name: "Back",
                onClick: () => {
                    alert("Back");
                }
            },
            {
                name: "Clear",
                onClick: () => {
                    alert("Clear");
                }
            },
            {
                name: "Enter",
                onClick: () => {
                    alert("Enter");
                }
            }
        ];
    }

    chooseKeyboard() {

        if (this.props.keyboardState === "category") {

            return <Keyboard id="cat-keyboard" buttons={this.props.categories} gridX={8}/>;

        } else if (this.props.keyboardState === "expiry") {

            return <div className="keyboard-container">
                <Keyboard id="exp-1" buttons={this.years} gridX={2}/>
                <div className="vl"/>
                <Keyboard id="exp-2" buttons={this.quarters} gridX={1}/>
                <Keyboard id="exp-3" buttons={this.months} gridX={3}/>
            </div>;

        } else if (this.props.keyboardState === "weight") {

            return <div className="keyboard-container">
                <Keyboard id="weight-numpad" buttons={this.numpad} gridX={3}/>
                <Keyboard id="numpadR" buttons={this.numpadR} gridX={1}/>
            </div>;

        } else { // edit shelf
            return <div>Add some presets in here</div>;
        }

    }

    render() {
        // return DOM elements using button structures
        return (
            <div id="bottom">
                {this.chooseKeyboard()}
            </div>
        );
    }
}
