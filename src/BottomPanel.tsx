import React from "react";
import {Keyboard, KeyboardButtonProps} from "./keyboard";
import {KeyboardName} from "./ShelfView";
import {ExpiryRange} from "./core/MockWarehouse";

export interface BottomPanelProps {
    keyboardState: KeyboardName;
    expirySelect: (expiry: ExpiryRange) => void;
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
    quartersTranslator: string[] = [
        "Jan-Mar",
        "Apr-Jun",
        "Jul-Sep",
        "Oct-Dec"
    ];
    monthsTranslator: string[] = [
        "Jan", "Feb", "Mar",
        "Apr", "May", "Jun",
        "Jul", "Aug", "Sep",
        "Oct", "Nov", "Dec"
    ];

    // @ts-ignore
    selectedYear: number;

    constructor(props: BottomPanelProps) {
        super(props);

        // GENERATE KEYBOARD BUTTON STRUCTURES
        this.years = [];
        for (let i = 2019; i < 2027; i++) {
            this.years.push({
                name: i.toString(), onClick: () => {
                    this.selectYear(i);
                }
            });
        }

        this.quarters = [];
        for (let i = 0; i < 4; i++) {
            this.quarters.push({
                name: this.quartersTranslator[i], onClick: () => {
                    this.selectQuarter(i);
                }
            });
        }

        this.months = [];
        for (let i = 0; i < 12; i++) {
            this.months.push({
                name: this.monthsTranslator[i], onClick: () => {
                    this.selectMonth(i);
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

    selectYear(year: number) {
        this.selectedYear = year;
        this.props.expirySelect({
            from: new Date(year, 1).getTime(),
            to: new Date(year + 1, 1).getTime(),
            label: year.toString()
        });
    }

    selectQuarter(quarter: number) {
        this.props.expirySelect({
            from: new Date(this.selectedYear, quarter * 4 + 1).getTime(),
            to: new Date(this.selectedYear, (quarter + 1) * 4 + 1).getTime(),
            label: `${this.quartersTranslator[quarter]} ${this.selectedYear.toString()}`
        });
    }

    selectMonth(month: number) {
        this.props.expirySelect({
            from: new Date(this.selectedYear, month + 1).getTime(),
            to: new Date(this.selectedYear, month + 2).getTime(),
            label: `${this.monthsTranslator[month]} ${this.selectedYear.toString()}`
        });
    }

    chooseKeyboard() {

        if (this.props.keyboardState === "category") {

            return <Keyboard id="cat-keyboard" buttons={this.props.categories} gridX={8}/>;

        } else if (this.props.keyboardState === "expiry") {

            return <div className="keyboard-container">
                <Keyboard id="exp-1" buttons={this.years} gridX={2}/>
                <div className="vl"/>
                <Keyboard id="exp-2" disabled={!this.selectedYear} buttons={this.quarters} gridX={1}/>
                <Keyboard id="exp-3" disabled={!this.selectedYear} buttons={this.months} gridX={3}/>
            </div>;

        } else { // (this.props.keyboardState === "weight")

            return <div className="keyboard-container">
                <Keyboard id="weight-numpad" buttons={this.numpad} gridX={3}/>
                <Keyboard id="numpadR" buttons={this.numpadR} gridX={1}/>
            </div>;

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
