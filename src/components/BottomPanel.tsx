import {faBackspace} from "@fortawesome/free-solid-svg-icons";
import React from "react";
import {User} from "../core/Firebase";
import {ExpiryRange, TrayCell, Warehouse} from "../core/WarehouseModel";
import {KeyboardName} from "../pages/ShelfViewPage";
import {
    buildDefaultUnifiedKeyboard,
    buildKeyboardButtons,
    ButtonProperties,
    CategoryAlteration,
    CommentAlteration,
    Edit,
    ExpiryAlteration,
    TrayEditingButton,
    WeightAlteration
} from "../utils/generateKeyboardButtons";
import {Dialog, DialogTitle} from "./Dialog";
import {CustomButtonProps, Keyboard} from "./Keyboard";
import "./styles/_bottompanel.scss";

export interface BottomPanelProps {
    openDialog: (dialog: Dialog) => void;

    keyboardState: KeyboardName;
    updateTrayProperties: (
        category: CategoryAlteration,
        expiry: ExpiryAlteration,
        weight: WeightAlteration,
        comment: CommentAlteration,
        couldAdvance: boolean,
    ) => void;
    removeSelection: () => void;

    warehouse: Warehouse;

    selectedTrayCells: TrayCell[];
    commonRange?: ExpiryRange;

    weight?: string;

    user: User;
}

type WeightKeyboardButton = "Next Tray" | "Clear Weight" | "Backspace" | number | ".";

export const EXPIRY_GREY_RATIO = 0.8;
export const EXPIRY_GREY = "#ffffff";

/**
 * This class represents the enter bottom panel component.  This component manages the various BottomPanelPages.
 * @see BottomPanelPage
 */
export class BottomPanel extends React.Component<BottomPanelProps> {

    /**
     * Handles key presses clicked in the weight keyboard, by updating draftWeight in ShelfView
     * @param key
     */
    private weightKeyHandler(key: WeightKeyboardButton): void {

        if (key === "Next Tray") {
            this.props.updateTrayProperties(
                {type: "nothing"},
                {type: "nothing"},
                this.props.weight ? {type: "set", weight: this.props.weight} : {type: "clear"},
                {type: "nothing"},
                true
            );
        } else if (key === "Clear Weight") {
            this.props.updateTrayProperties(
                {type: "nothing"},
                {type: "nothing"},
                {type: "set", weight: "0"},
                {type: "nothing"},
                false
            );
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
                this.props.updateTrayProperties(
                    {type: "nothing"},
                    {type: "nothing"},
                    {type: "set", weight: "0"},
                    {type: "nothing"},
                    false
                );
            } else if (!isNaN(Number(newDraftWeight)) && newDraftWeight.length <= 6) {
                this.props.updateTrayProperties(
                    {type: "nothing"},
                    {type: "nothing"},
                    {type: "set", weight: newDraftWeight},
                    {type: "nothing"},
                    false
                );
            }
        }
    }


    /**
     * Return different keyboards depending on keyboardState
     * @param disabled whether the keyboard is disabled (ie no trays are selected)
     */
    private chooseKeyboard(disabled: boolean): React.ReactNode {

        // We are passed all of the selected TrayCells, only want to consider the actual Trays (not TraySpaces)
        // const traysOnly: Tray[] = this.props.selectedTrayCells.filter((a): a is Tray => a instanceof Tray);

        // const firstCat = traysOnly.find(i => i !== undefined)?.category?.name;
        // const commonCat = firstCat !== undefined && traysOnly.every(item => item.category?.name === undefined ||
        // item.category.name === firstCat) ? firstCat : null; todo fixme highlight the things that are selected

        // TODO: consider applying database settings to this

        const {
            categories,
            specialCategoryButtons,
            specialExpiryButtons,
            years,
            quarters,
            months,
        } = buildKeyboardButtons(8, 8, true, true, this.props.warehouse);

        if (this.props.keyboardState === "category") {

            return <Keyboard
                id="cat-keyboard"
                disabled={disabled}
                buttons={this.bindButtons(categories.concat([specialCategoryButtons.removeTray]))}
                gridX={7}
            />;

        } else if (this.props.keyboardState === "expiry") {
            // todo this might be worth making a setting for; it's the kind of thing someone might want to disable for
            //  performance on low-end devices
            // this.highlightExpiryKey();


            return <div className="keyboard-container expiry-container">
                <Keyboard
                    id="exp-special"
                    disabled={disabled}
                    buttons={this.bindButtons([
                        specialExpiryButtons.never,
                        specialExpiryButtons.clearExpiry
                    ])} gridX={1}
                />
                <Keyboard id="exp-months" disabled={disabled} buttons={this.bindButtons(months)} gridX={3}/>
                <Keyboard id="exp-quarters" disabled={disabled} buttons={this.bindButtons(quarters)} gridX={2}/>
                <Keyboard id="exp-years" disabled={disabled} buttons={this.bindButtons(years)} gridX={2}/>
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
                "Backspace", "Clear Weight"
            ].concat(this.props.user.autoAdvanceMode ? ["Next Tray"] : []) as WeightKeyboardButton[])
                .map((a) => ({
                    name: a.toString(),
                    icon: a === "Backspace" ? faBackspace : undefined,
                    disabled: this.props.selectedTrayCells.length === 0 || (a === "Next Tray" && this.props.user.onlySingleAutoAdvance && this.props.selectedTrayCells.length !== 1),
                    onClick: () => this.weightKeyHandler(a),
                    background: a === "Clear Weight" ? "#ffffff" : undefined
                }));


            return <div className="keyboard-container weight-container">
                <Keyboard id="weight-numpad" buttons={numpadButtons} gridX={3}/>
                <div id="numpadR">
                    <Keyboard buttons={numpadSide} gridX={1}/>
                </div>
            </div>;

        } else if (this.props.keyboardState === "custom") {

            const unifiedKeyboard = buildDefaultUnifiedKeyboard(this.props.warehouse);

            return <div style={{
                display: "grid",
                height: "100%",
                width: "100%",
            }}>{
                unifiedKeyboard.buttons.map((button, index) => {
                    const bound = this.bindButtons([button])[0];
                    return <button
                        key={index}
                        style={{
                            fontSize: 14,
                            margin: 2,
                            gridColumnStart: button.columnStart ?? undefined,
                            gridColumnEnd: button.columnEnd ?? undefined,
                            gridRowStart: button.rowStart ?? undefined,
                            gridRowEnd: button.rowEnd ?? undefined,
                            background: button.background ?? undefined
                        }}
                        disabled={this.props.selectedTrayCells.length === 0}
                        onClick={bound.onClick}
                    > {button.label} </button>;
                })
            }</div>;

        } else { // edit shelf
            return <div/>;
        }

    }


// /** todo fixme reintroduce this within the new system
    //  * Highlight the key corresponding to the current selection
    //  */
    // private highlightExpiryKey(): void {
    //     // this isn't the best way to do this but it's more performant than other options
    //     const isYear = this.props.commonRange?.label.length === 4;
    //     const isMonth = this.props.commonRange?.label.length === 8;
    //     const isQuarter = !isYear && !isMonth;
    //
    //     for (const year of this.years) {
    //         year.selected = isYear && year.expiryFrom === this.props.commonRange?.from;
    //     }
    //     for (const month of this.months) {
    //         month.selected = isMonth && month.expiryFrom === this.props.commonRange?.from;
    //     }
    //     for (const quarter of this.quarters) {
    //         quarter.selected = isQuarter && quarter.expiryFrom === this.props.commonRange?.from;
    //     }
    // }

    /**
     * @inheritDoc
     */
    render(): React.ReactNode {
        // return DOM elements using button structures
        return <div id="bottom">
            {this.chooseKeyboard(!this.props.selectedTrayCells.length)}
        </div>;
    }

    private bindButtons(buttons: TrayEditingButton[]): CustomButtonProps[] {
        return buttons.map(button => ({
            name: button.label,

            onClick: (_: React.MouseEvent) => {
                if (button.type === "erase") {
                    this.props.removeSelection();
                } else if (button.type === "singular") {
                    this.props.updateTrayProperties(
                        button.alteration.category,
                        button.alteration.expiry,
                        button.alteration.weight,
                        button.alteration.comment,
                        true,
                    );
                } else {
                    const alteration = button;
                    this.props.openDialog({
                        dialog: (close: () => void) => <GroupedCategoriesDialog
                            groupTitle={button.label}
                            alterationGroup={alteration.alterations}
                            close={close}
                            onSelected={(selected => {
                                this.props.updateTrayProperties(
                                    selected.category,
                                    selected.expiry,
                                    selected.weight,
                                    selected.comment,
                                    true
                                );
                                close();
                            })}
                        />,
                        closeOnDocumentClick: true,
                    });
                }
            },
            // selected ? : boolean;
            // disabled ? : boolean;
            background: button.background ?? undefined,
        }));
    }
}

interface GroupedCategoriesDialogProps {
    groupTitle: string;
    alterationGroup: (Edit & ButtonProperties)[];
    onSelected: (alteration: Edit) => void;
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
                this.props.alterationGroup.map((alteration, index) =>
                    <button
                        onClick={this.props.onSelected.bind(undefined, alteration)}
                        key={index}
                    >{alteration.label}</button>
                )
            }</div>
        </>;
    }
}
