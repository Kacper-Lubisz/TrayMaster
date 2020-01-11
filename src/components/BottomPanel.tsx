import React from "react";

import {KeyboardName} from "../pages/ShelfViewPage";
import {Category, ExpiryRange, Tray, TrayCell} from "../core/WarehouseModel";
import {faBackspace} from "@fortawesome/free-solid-svg-icons";
import {Keyboard, KeyboardButtonProps} from "./Keyboard";


export interface BottomPanelProps {
    keyboardState: KeyboardName;
    categorySelected: (category: Category) => void;
    expirySelected: (expiry: ExpiryRange) => void;
    categories: Category[];
    selectedTrayCells: TrayCell[];
    draftWeight?: string;
    setDraftWeight: (newDraftWeight?: string) => void;
    applyDraftWeight: () => void;
}

type WeightKeyboardButton = "Enter" | "Clear" | "Backspace" | number | ".";

/**
 * This class represents the enter bottom panel component.  This component manages the various BottomPanelPages.
 * @see BottomPanelPage
 */
export class BottomPanel extends React.Component<BottomPanelProps> {
    years: KeyboardButtonProps[];
    quarters: KeyboardButtonProps[];
    months: KeyboardButtonProps[];
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

    /**
     * Currently selected year
     */
    selectedYear: number | undefined;

    constructor(props: BottomPanelProps) {
        super(props);

        // Expiry keyboard structure
        this.years = [];
        // TODO: consider applying database settings to this
        const thisYear = new Date().getFullYear();
        for (let i = thisYear; i < thisYear + 8; i++) {
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
    }

    /**
     * Handles key presses clicked in the weight keyboard, by updating draftWeight in ShelfView
     * @param key
     */
    weightKeyHandler(key: WeightKeyboardButton): void {

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

    /**
     * Called when a year button is pressed
     * Sets selectedYear and current tray expiry to that year
     * @param year - number representing the current year
     */
    selectYear(year: number): void {
        this.selectedYear = year;
        this.props.expirySelected({
            from: new Date(year, 0).getTime(),
            to: new Date(year + 1, 0).getTime(),
            label: year.toString()
        });
    }

    /**
     * Called when a quarter button is pressed
     * Sets current tray expiry to that quarter in selectedYear
     * @param quarter - number in [0-3] inclusive representing the current quarter
     */
    selectQuarter(quarter: number): void {
        if (this.selectedYear) {
            this.props.expirySelected({
                from: new Date(this.selectedYear, quarter * 3).getTime(),
                to: new Date(quarter === 3 ? this.selectedYear + 1
                                           : this.selectedYear, (quarter + 1) * 3 % 4).getTime(),
                label: `${this.quartersTranslator[quarter]} ${this.selectedYear.toString()}`
            });
        }
    }

    /**
     * Called when a month button is pressed
     * Sets current tray expiry to that month in selectedYear
     * @param month - number in [0-11] inclusive representing the current month
     */
    selectMonth(month: number): void {
        if (this.selectedYear) {
            this.props.expirySelected({
                from: new Date(this.selectedYear, month).getTime(),
                to: new Date(month === 11 ? this.selectedYear + 1 : this.selectedYear, (month + 1) % 12).getTime(),
                label: `${this.monthsTranslator[month]} ${this.selectedYear.toString()}`
            });
        }
    }

    /**
     * Return different keyboards depending on keyboardState
     * @param disabled whether the keyboard is disabled (ie no trays are selected)
     */
    chooseKeyboard(disabled: boolean): React.ReactNode {
        // We are passed all of the selected TrayCells, only want to consider the actual Trays (not TraySpaces)
        const traysOnly: Tray[] = this.props.selectedTrayCells.filter((a): a is Tray => a instanceof Tray);

        if (this.props.keyboardState === "category") {

            const firstCat = traysOnly.find(i => i !== undefined)?.category?.name;
            const commonCat = firstCat === undefined ? undefined
                                                     : traysOnly.every(item => item.category?.name === undefined || item.category.name === firstCat)
                                                       ? firstCat : null;

            const buttons: KeyboardButtonProps[] = this.props.categories.map((cat) => {
                return {
                    name: cat.shortName ?? cat.name,
                    onClick: () => this.props.categorySelected(cat),
                    selected: cat.name === commonCat
                };
            });
            return <Keyboard id="cat-keyboard" disabled={disabled} buttons={buttons} gridX={8}/>;

        } else if (this.props.keyboardState === "expiry") {

            const firstExp = traysOnly.find(i => i.expiry !== undefined)?.expiry?.from;
            const firstYear = firstExp ? new Date(firstExp).getFullYear() : undefined;
            const commonYear = firstYear === undefined ? undefined
                                                       : traysOnly.every(item => item.expiry?.from === undefined || new Date(item.expiry.from).getFullYear() === firstYear)
                                                         ? firstYear : undefined;

            // update object-level selectedYear
            this.selectedYear = commonYear;

            // set the button corresponding to selectedYear to be visibly selected
            for (const year of this.years) {
                year.selected = year.name === commonYear?.toString();
            }

            return <div className="keyboard-container">
                <Keyboard id="exp-years" disabled={disabled} buttons={this.years} gridX={2}/>
                <div className="vl"/>
                <Keyboard id="exp-quarters" disabled={!commonYear} buttons={this.quarters} gridX={1}/>
                <Keyboard id="exp-months" disabled={!commonYear} buttons={this.months} gridX={3}/>
            </div>;

        } else if (this.props.keyboardState === "weight") {

            // Create numpad for the digits and decimal point buttons
            const numpad = (Array.from(Array(10).keys()) as WeightKeyboardButton[]).reverse().concat(["."]).map((a) => ({
                name: a.toString(),
                onClick: () => {
                    this.weightKeyHandler(a);
                }
            }));

            // Create numpadSide for the side buttons
            const numpadSide = (["Backspace", "Clear", "Enter"] as WeightKeyboardButton[]).map((a) => {
                let shouldDisable = false;
                if (a === "Backspace" || a === "Clear") {
                    shouldDisable = (this.props.draftWeight ?? "").length === 0;
                } else if (a === "Enter") {
                    shouldDisable = this.props.selectedTrayCells.length === 0;
                }
                return {
                    name: a.toString(),
                    icon: a === "Backspace" ? faBackspace : undefined,
                    disabled: shouldDisable,
                    onClick: () => {
                        this.weightKeyHandler(a);
                    }
                };
            });

            return <div className="keyboard-container">
                <Keyboard id="weight-numpad" buttons={numpad} gridX={3}/>
                <div id="numpadR">
                    <div id="draftWeight">
                        {`${this.props.draftWeight === undefined ? "?" : this.props.draftWeight} kg`}
                    </div>
                    <div id="weight-numpad-side">
                        <Keyboard buttons={numpadSide} gridX={1}/>
                    </div>
                </div>
            </div>;

        } else { // edit shelf
            return <div>Add some presets in here</div>;
        }

    }

    /**
     * @inheritDoc
     */
    render(): React.ReactNode {

        // return DOM elements using button structures
        return <div id="bottom">
            {this.chooseKeyboard(!this.props.selectedTrayCells.length)}
        </div>;
    }
}
