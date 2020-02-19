import {faBackspace} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import {User} from "../core/Firebase";
import {Category, ExpiryRange, Tray, TrayCell} from "../core/WarehouseModel";

import {KeyboardName} from "../pages/ShelfViewPage";
import {CustomButtonProps, Keyboard} from "./Keyboard";
import "./styles/_bottompanel.scss";


export interface BottomPanelProps {
    keyboardState: KeyboardName;
    categorySelected: (category: Category | null) => void;
    expirySelected: (expiry: ExpiryRange | null) => void;

    categories: Category[];

    selectedTrayCells: TrayCell[];
    commonRange?: ExpiryRange;

    weight?: string;
    setWeight: (weight: string | undefined, couldAdvance: boolean) => void;

    user: User;
}

interface ExpiryYear {
    year: number;
}

interface ExpiryQuarter extends ExpiryYear {
    quarter: number;
}

interface ExpiryMonth extends ExpiryYear {
    month: number;
}

type ExpiryKeyboardButtonProps = CustomButtonProps & {
    expiryFrom: number;
};

type WeightKeyboardButton = "Next Tray" | "< Clear >" | "Backspace" | number | ".";

/**
 * This class represents the enter bottom panel component.  This component manages the various BottomPanelPages.
 * @see BottomPanelPage
 */
export class BottomPanel extends React.Component<BottomPanelProps> {
    private readonly years: ExpiryKeyboardButtonProps[];
    private readonly quarters: ExpiryKeyboardButtonProps[];
    private readonly months: ExpiryKeyboardButtonProps[];
    private readonly monthsTranslator: string[] = [
        "Jan", "Feb", "Mar",
        "Apr", "May", "Jun",
        "Jul", "Aug", "Sep",
        "Oct", "Nov", "Dec"
    ];

    constructor(props: BottomPanelProps) {
        super(props);

        // Expiry keyboard structures
        this.years = [];
        // TODO: consider applying database settings to this
        const thisYear = new Date().getFullYear();
        for (let i = thisYear; i < thisYear + 8; i++) {
            this.years.push({
                name: i.toString(), onClick: () => {
                    this.selectRange({year: i});
                },
                expiryFrom: new Date(i, 0).getTime()
            });
        }

        this.months = [];
        const thisMonth = new Date().getMonth();
        for (let i = thisMonth; i < thisMonth + 12; i++) {
            const year = thisYear + Math.floor(i / 12);
            const month = i % 12;
            this.months.push({
                name: `${this.monthsTranslator[month]} ${year.toString()}`, onClick: () => {
                    this.selectRange({year: year, month: month});
                },
                expiryFrom: new Date(year, month).getTime()
            });
        }

        this.quarters = [];
        const thisQuarter = Math.floor(thisMonth / 3);
        for (let i = thisQuarter; i < thisQuarter + 8; i++) {
            const year = thisYear + Math.floor(i / 4);
            const quarter = i % 4;
            this.quarters.push({
                name: `Q${(quarter + 1).toString()} ${year.toString()}`, onClick: () => {
                    this.selectRange({year: year, quarter: quarter});
                },
                expiryFrom: new Date(year, quarter * 3).getTime()
            });
        }
    }

    /**
     * Handles key presses clicked in the weight keyboard, by updating draftWeight in ShelfView
     * @param key
     */
    private weightKeyHandler(key: WeightKeyboardButton): void {

        if (key === "Next Tray") {
            this.props.setWeight(this.props.weight, true);
        } else if (key === "< Clear >") {
            this.props.setWeight(undefined, false);
        } else {
            // Must be a number or decimal point, just append
            // Unless it's only a zero, in which case we don't want a leading zero so just replace it. This deals
            // with overwriting the default 0 value too

            const newDraftWeight: string = (() => {
                if (key === "Backspace") {
                    return this.props.weight?.slice(0, -1) ?? "";
                } else if (this.props.weight === "0" && key !== ".") {
                    return `${key}`;
                } else {
                    return `${this.props.weight ?? ""}${key}`;
                }
            })();

            if (newDraftWeight === "") {
                this.props.setWeight(undefined, false);
            } else if (!isNaN(Number(newDraftWeight)) && newDraftWeight.length <= 6) {
                this.props.setWeight(newDraftWeight, false);
            }
        }
    }

    /**
     * Passed into expiry buttons: generates & selects ExpiryRange from year (and quarter or month index if applicable)
     * @param basicRange object representing a simplified expiry range attached to the button
     */
    private selectRange(basicRange: ExpiryYear | ExpiryQuarter | ExpiryMonth): void {
        // choose range start and end points
        const [from, to]: Date[] = (() => {
            const y = basicRange.year;
            if ("month" in basicRange) {
                let toMonth = basicRange.month + 1, toYear = y;
                if (toMonth >= 12) {
                    toYear += Math.floor(toMonth / 12);
                    toMonth %= 12;
                }
                return [
                    new Date(basicRange.year, basicRange.month),
                    new Date(toYear, toMonth)
                ];
            } else if ("quarter" in basicRange) {
                const q = basicRange.quarter;
                let toQuarter = basicRange.quarter + 1, toYear = y;
                if (toQuarter >= 4) {
                    toYear += Math.floor(toQuarter / 4);
                    toQuarter %= 4;
                }
                return [
                    // Multiply by 3 to map quarter indices to the first month in that range
                    new Date(y, q * 3),
                    new Date(toYear, toQuarter * 3)
                ];
            } else {
                // Year
                return [
                    new Date(y, 0),
                    new Date(y + 1, 0)
                ];
            }
        })();

        // generate and set ExpiryRange object
        this.props.expirySelected({
            from: from.getTime(),
            to: to.getTime(),
            // "[if not year then [month or quarter name (eg Jan, Q1) plus trailing space]][year]"
            label: `${(() => {
                if ("month" in basicRange) {
                    return `${this.monthsTranslator[basicRange.month]} `;
                } else if ("quarter" in basicRange) {
                    // need to add 1 because quarters are zero-indexed and users expect Q[1..4], not Q[0..3]
                    return `Q${(basicRange.quarter + 1).toString()} `;
                }
                return "";
            })()}${basicRange.year.toString()}`
        });
    }

    /**
     * Return different keyboards depending on keyboardState
     * @param disabled whether the keyboard is disabled (ie no trays are selected)
     */
    private chooseKeyboard(disabled: boolean): React.ReactNode {
        // We are passed all of the selected TrayCells, only want to consider the actual Trays (not TraySpaces)
        const traysOnly: Tray[] = this.props.selectedTrayCells.filter((a): a is Tray => a instanceof Tray);

        if (this.props.keyboardState === "category") {

            const firstCat = traysOnly.find(i => i !== undefined)?.category?.name;
            const commonCat = firstCat === undefined ? undefined
                                                     : traysOnly.every(item => item.category?.name === undefined || item.category.name === firstCat)
                                                       ? firstCat : null;

            const buttons: CustomButtonProps[] = this.props.categories.map((cat) => {
                return {
                    name: cat.shortName ?? cat.name,
                    onClick: () => this.props.categorySelected(cat),
                    selected: cat.name === commonCat
                };
            }).concat([
                {
                    name: "< Clear >",
                    onClick: () => this.props.categorySelected(null),
                    selected: false
                }
            ]);
            return <Keyboard id="cat-keyboard" disabled={disabled} buttons={buttons} gridX={8}/>;

        } else if (this.props.keyboardState === "expiry") {
            // todo this might be worth making a setting for; it's the kind of thing someone might want to disable for
            //  performance on low-end devices
            this.highlightExpiryKey();

            const specialButtons = [
                {
                    name: "Indefinite",
                    onClick: () => this.props.expirySelected({
                        from: null,
                        to: null,
                        label: "Indefinite"
                    })

                }, {
                    name: "< Clear >",
                    onClick: () => this.props.expirySelected(null)

                }
            ];

            return <div className="keyboard-container expiry-container">
                <Keyboard id="exp-special" disabled={disabled} buttons={specialButtons} gridX={1}/>
                <Keyboard id="exp-years" disabled={disabled} buttons={this.years} gridX={2}/>
                <Keyboard id="exp-quarters" disabled={disabled} buttons={this.quarters} gridX={2}/>
                <Keyboard id="exp-months" disabled={disabled} buttons={this.months} gridX={3}/>
            </div>;

        } else if (this.props.keyboardState === "weight") {

            // Create numpad for the digits and decimal point buttons

            const numpad: WeightKeyboardButton[] = [7, 8, 9, 4, 5, 6, 1, 2, 3, 0, "."];
            const numpadButtons = numpad.map((a) => ({
                name: a.toString(),
                onClick: () => this.weightKeyHandler(a),
                disabled: this.props.selectedTrayCells.length === 0,
            }));

            // Create numpadSide for the side buttons
            const numpadSide: CustomButtonProps[] = ([
                "Backspace", "< Clear >"
            ].concat(this.props.user.autoAdvanceMode === "off" ? [] : ["Next Tray"]) as WeightKeyboardButton[])
                .map((a) => ({
                    name: a.toString(),
                    icon: a === "Backspace" ? faBackspace : undefined,
                    disabled: this.props.selectedTrayCells.length === 0,
                    onClick: () => this.weightKeyHandler(a)
                }));

            return <div className="keyboard-container weight-container">
                <Keyboard id="weight-numpad" buttons={numpadButtons} gridX={3}/>
                <div id="numpadR">
                    <Keyboard buttons={numpadSide} gridX={1}/>
                </div>
            </div>;

        } else { // edit shelf
            return <div>
                Unimplemented Panel
            </div>;
        }

    }

    /**
     * Highlight the key corresponding to the current selection
     */
    private highlightExpiryKey(): void {
        // this isn't the best way to do this but it's more performant than other options
        const isYear = this.props.commonRange?.label.length === 4;
        const isMonth = this.props.commonRange?.label.length === 8;
        const isQuarter = !isYear && !isMonth;

        for (const year of this.years) {
            year.selected = isYear && year.expiryFrom === this.props.commonRange?.from;
        }
        for (const month of this.months) {
            month.selected = isMonth && month.expiryFrom === this.props.commonRange?.from;
        }
        for (const quarter of this.quarters) {
            quarter.selected = isQuarter && quarter.expiryFrom === this.props.commonRange?.from;
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
