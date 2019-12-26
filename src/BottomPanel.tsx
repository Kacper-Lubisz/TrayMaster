import React from "react";
import {Keyboard, KeyboardButtonProps} from "./keyboard";
import {KeyboardName} from "./ShelfView";
import {faBackspace} from "@fortawesome/free-solid-svg-icons";
import {Tray} from "./core/MockWarehouse";

export interface BottomPanelProps {
    keyboardState: KeyboardName

    categories: KeyboardButtonProps[];

    selectedTrays: Tray[];
    draftWeight?: string;
    setDraftWeight: (newDraftWeight?: string) => void;
    applyDraftWeight: () => void;
}

/**
 * This class represents the enter bottom panel component.  This component manages the various BottomPanelPages.
 * @see BottomPanelPage
 */
export class BottomPanel extends React.Component<BottomPanelProps, any> {
    years: KeyboardButtonProps[];
    quarters: KeyboardButtonProps[];
    months: KeyboardButtonProps[];

    constructor(props: BottomPanelProps) {
        super(props);

        // Expiry keyboard structure
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
    }

    /**
     * Handles key presses clicked in the weight keyboard, by updating draftWeight in ShelfView
     * @param key
     */
    weightKeyHandler(key: "Enter" | "Clear" | "Backspace" | number | ".") {

        if (key === "Enter") {
            this.props.applyDraftWeight();
        } else {
            let newDraftWeight: string | undefined;
            if (key === "Clear") {
                newDraftWeight = "";
            } else if (key === "Backspace") {
                newDraftWeight = this.props.draftWeight?.slice(0, -1);
            } else {
                // Must be a number or decimal point, just append
                // Unless it's only a zero, in which case we don't want a leading zero so just replace it. This deals
                // with overwriting the default 0 value too
                if (this.props.draftWeight === "0" && key !== ".") {
                    newDraftWeight = `${key}`;
                } else {
                    newDraftWeight = `${this.props.draftWeight ?? ""}${key}`;
                }
            }

            if (newDraftWeight === "") {
                this.props.setDraftWeight(undefined);
            } else if (!isNaN(Number(newDraftWeight)) && (newDraftWeight ?? "").length <= 6) {
                this.props.setDraftWeight(newDraftWeight);
            }
        }
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

        } else { // (this.props.keyboardState === "weight")

            // Weight numpad structure
            let numpad = [];
            for (let i = 9; i >= 0; i--) {
                numpad.push({
                    name: i.toString(), onClick: () => {
                        this.weightKeyHandler(i);
                    }
                });
            }
            numpad.push({
                name: ".", onClick: () => {
                    this.weightKeyHandler(".");
                }
            });

            let numpadR = [
                {
                    name: "Backspace",
                    icon: faBackspace,
                    disabled: (this.props.draftWeight ?? "").length === 0,
                    onClick: () => {
                        this.weightKeyHandler("Backspace");
                    }
                },
                {
                    name: "Clear",
                    disabled: (this.props.draftWeight ?? "").length === 0,
                    onClick: () => {
                        this.weightKeyHandler("Clear");
                    }
                },
                {
                    name: "Enter",
                    disabled: this.props.selectedTrays.length === 0,
                    onClick: () => {
                        this.weightKeyHandler("Enter");
                    }
                }
            ];

            return <div className="keyboard-container">
                <Keyboard id="weight-numpad" buttons={numpad} gridX={3}/>
                <div id="numpadR">
                    <div id="draftWeight">
                        {`${this.props.draftWeight === undefined ? "?" : this.props.draftWeight} kg`}
                    </div>
                    <div id="weight-numpad-side">
                        <Keyboard buttons={numpadR} gridX={1}/>
                    </div>
                </div>
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
