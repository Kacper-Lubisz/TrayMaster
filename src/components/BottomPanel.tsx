import {faBackspace} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import {Dialog, DialogTitle} from "../core/Dialog";
import {User} from "../core/Firebase";
import {Category, ExpiryRange, Tray, TrayCell} from "../core/WarehouseModel";
import {NEVER_EXPIRY} from "../core/WarehouseModel/Layers/Warehouse";
import {KeyboardName} from "../pages/ShelfViewPage";
import {getExpiryColor, interpolateTowardsGrey} from "../utils/getExpiryColor";
import {byNullSafe} from "../utils/sortsUtils";
import {CustomButtonProps, Keyboard} from "./Keyboard";
import "./styles/_bottompanel.scss";

export interface BottomPanelProps {
    openDialog: (dialog: Dialog) => void;

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

        const expiryGreyRatio = 0.8;
        const expiryGrey = "#ffffff";

        // Expiry keyboard structures
        this.years = [];
        // TODO: consider applying database settings to this
        const thisYear = new Date().getFullYear();
        const yearColors: any = {};

        for (let i = thisYear; i < thisYear + 8; i++) {
            const exp = getExpiryColor(
                {
                    from: new Date(i, 0).getTime(),
                    to: new Date(i + 1, 0).getTime(),
                    label: i.toString()
                },
                "warehouse"
            );
            yearColors[i] = interpolateTowardsGrey(exp, expiryGrey, expiryGreyRatio);
            this.years.push({
                name: i.toString(), onClick: () => {
                    this.selectRange({year: i});
                },
                expiryFrom: new Date(i, 0).getTime(),
                bg: yearColors[i]
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
                expiryFrom: new Date(year, month).getTime(),
                bg: yearColors[year]
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
                expiryFrom: new Date(year, quarter * 3).getTime(),
                bg: yearColors[year]
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
     * @param range object representing a simplified expiry range attached to the button
     */
    private selectRange(range: ExpiryYear | ExpiryQuarter | ExpiryMonth): void {
        // choose range start and end points

        if ("month" in range) {

            const fromDate = new Date(range.year, range.month);
            const toDate = new Date(fromDate);
            toDate.setMonth(fromDate.getMonth() + 1);

            this.props.expirySelected({
                from: fromDate.getTime(), to: toDate.getTime(),
                label: `${this.monthsTranslator[range.month]} ${range.year}`
            });

        } else if ("quarter" in range) {

            // Multiply by 3 to map quarter indices to the first month in that range
            const fromDate = new Date(range.year, range.quarter * 3);
            const toDate = new Date(fromDate);

            toDate.setMonth(fromDate.getMonth() + 3); // increment by 1Q or 3 months

            this.props.expirySelected({
                from: fromDate.getTime(), to: toDate.getTime(),
                label: `Q${(range.quarter + 1).toString()} ${range.year}`
            });

        } else { // Year

            this.props.expirySelected({
                from: new Date(range.year, 0).getTime(),
                to: new Date(range.year + 1, 0).getTime(),
                label: `${range.year}`
            });
        }
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
            const commonCat = firstCat !== undefined && traysOnly.every(item => item.category?.name === undefined || item.category.name === firstCat)
                              ? firstCat : null;


            const categoryGroups: Map<string, [Category]> = new Map();
            this.props.categories.forEach(cat => {

                if (cat.group === undefined) { // todo fixme remove this when this is propagated to the db
                    cat.group = null;
                }

                if (cat.group !== null) {
                    if (categoryGroups.has(cat.group)) {
                        categoryGroups.get(cat.group)?.push(cat);
                    } else {
                        categoryGroups.set(cat.group, [cat]);
                    }
                }
            });

            const buttonsWithoutGroups = this.props.categories.filter(cat =>
                cat.group === null
            ).map((cat): CustomButtonProps => ({
                name: cat.shortName ?? cat.name,
                onClick: () => this.props.categorySelected(cat),
                selected: cat.name === commonCat,
            }));

            const groupedButtons = Array.from(categoryGroups.entries()).map(([group, categories]) => ({
                name: group,
                onClick: this.props.openDialog.bind(undefined, {
                    dialog: (close: () => void) => {
                        const groupButtons = categories.map((cat) => ({
                            name: cat.shortName ?? cat.name,
                            onClick: () => {
                                this.props.categorySelected(cat);
                                close();
                            },
                            selected: cat.name === commonCat
                        }));
                        return <GroupedCategoriesDialog groupTitle={group}
                                                        categoryButtons={groupButtons}
                                                        close={close}/>;
                    },
                    closeOnDocumentClick: true,
                }),
                selected: commonCat ? categories.some(cat => cat.name === commonCat) : false
            }));

            const categoryButtons: CustomButtonProps[] = buttonsWithoutGroups
                .concat(groupedButtons)
                .sort(byNullSafe(button => button.name));

            const specialButtons: CustomButtonProps[] = [
                {
                    name: "< Clear >",
                    onClick: () => this.props.categorySelected(null),
                    selected: false,
                    bg: "#ffffff"
                }
            ];

            return <Keyboard id="cat-keyboard"
                             disabled={disabled}
                             buttons={categoryButtons.concat(specialButtons)}
                             gridX={7}
            />;

        } else if (this.props.keyboardState === "expiry") {
            // todo this might be worth making a setting for; it's the kind of thing someone might want to disable for
            //  performance on low-end devices
            this.highlightExpiryKey();

            const specialButtons = [
                {
                    name: "Never",
                    onClick: () => this.props.expirySelected(NEVER_EXPIRY),
                }, {
                    name: "< Clear >",
                    onClick: () => this.props.expirySelected(null),
                    bg: "#ffffff"
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
            ].concat(this.props.user.autoAdvanceMode ? ["Next Tray"] : []) as WeightKeyboardButton[])
                .map((a) => ({
                    name: a.toString(),
                    icon: a === "Backspace" ? faBackspace : undefined,
                    disabled: this.props.selectedTrayCells.length === 0,
                    onClick: () => this.weightKeyHandler(a),
                    bg: a === "< Clear >" ? "#ffffff" : undefined
                }));

            return <div className="keyboard-container weight-container">
                <Keyboard id="weight-numpad" buttons={numpadButtons} gridX={3}/>
                <div id="numpadR">
                    <Keyboard buttons={numpadSide} gridX={1}/>
                </div>
            </div>;

        } else { // edit shelf
            return <div/>;
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

interface GroupedCategoriesDialogProps {
    groupTitle: string;
    categoryButtons: CustomButtonProps[];
    close: () => void;
}

/**
 * This is the the content of the dialog which is shown when the comment on a tray is being edited
 */
class GroupedCategoriesDialog extends React.Component<GroupedCategoriesDialogProps> {
    render(): React.ReactElement {
        return <>
            <DialogTitle title={this.props.groupTitle.toUpperCase()}/>
            <div className="dialogContent" style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr"
            }}>{
                this.props.categoryButtons.map((cat, index) =>
                    <button onClick={cat.onClick} key={index}>{cat.name}</button>
                )
            }</div>
        </>;
    }
}
