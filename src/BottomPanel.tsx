import React from "react";
import {Keyboard, KeyboardButtonProps} from "./keyboard";
import {KeyboardName} from "./ShelfView";
import {ExpiryRange, Tray} from "./core/MockWarehouse";

export interface BottomPanelProps {
    keyboardState: KeyboardName;
    expirySelected: (expiry: ExpiryRange) => void;
    categories: KeyboardButtonProps[];
    selected: Tray[];
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
    selectedYear: number | undefined;
    // @ts-ignore
    disabled: boolean;
    // @ts-ignore
    currentTray: Tray | undefined;

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
        this.props.expirySelected({
            from: new Date(year, 0).getTime(),
            to: new Date(year + 1, 0).getTime(),
            label: year.toString()
        });
    }

    selectQuarter(quarter: number) {
        if (this.selectedYear) {
            this.props.expirySelected({
                from: new Date(this.selectedYear, quarter * 3).getTime(),
                to: new Date(quarter === 3 ? this.selectedYear + 1
                                           : this.selectedYear, (quarter + 1) * 3 % 4).getTime(),
                label: `${this.quartersTranslator[quarter]} ${this.selectedYear.toString()}`
            });
        }
    }

    selectMonth(month: number) {
        if (this.selectedYear) {
            this.props.expirySelected({
                from: new Date(this.selectedYear, month).getTime(),
                to: new Date(month === 11 ? this.selectedYear + 1 : this.selectedYear, (month + 1) % 12).getTime(),
                label: `${this.monthsTranslator[month]} ${this.selectedYear.toString()}`
            });
        }
    }

    chooseKeyboard() {
        if (this.props.keyboardState === "category") {
            return <Keyboard id="cat-keyboard" disabled={this.disabled} buttons={this.props.categories} gridX={8}/>;

        } else if (this.props.keyboardState === "expiry") {
            this.selectedYear = this.disabled ? undefined : (this.currentTray?.expiry?.from
                                                             ? new Date(this.currentTray?.expiry?.from).getFullYear()
                                                             : undefined);
            for (let i = 0; i < this.years.length; i++) {
                this.years[i].selected = this.years[i].name === this.selectedYear?.toString();
            }

            return <div className="keyboard-container">
                <Keyboard id="exp-1" disabled={this.disabled} buttons={this.years} gridX={2}/>
                <div className="vl"/>
                <Keyboard id="exp-2" disabled={!this.selectedYear} buttons={this.quarters} gridX={1}/>
                <Keyboard id="exp-3" disabled={!this.selectedYear} buttons={this.months} gridX={3}/>
            </div>;

        } else { // (this.props.keyboardState === "weight")

            return <div className="keyboard-container">
                <Keyboard id="weight-numpad" disabled={this.disabled} buttons={this.numpad} gridX={3}/>
                <Keyboard id="numpadR" disabled={this.disabled} buttons={this.numpadR} gridX={1}/>
            </div>;

        }
    }

    render() {
        this.disabled = !this.props.selected;
        if (this.props.selected.length === 1) {
            this.currentTray = this.props.selected[0];
        }
        // return DOM elements using button structures
        return (
            <div id="bottom">
                {this.chooseKeyboard()}
            </div>
        );
    }
}
