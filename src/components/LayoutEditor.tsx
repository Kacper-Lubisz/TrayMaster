import {faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";
import {cloneDeep, isEqual} from "lodash";
import React from "react";
import {Dialog, DialogButtons, DialogTitle} from "../core/Dialog";
import {User} from "../core/Firebase";
import {Bay, Shelf, Warehouse, WarehouseModel, Zone} from "../core/WarehouseModel";
import {ZoneFields} from "../core/WarehouseModel/Layers/Zone";
import {SettingsTab} from "../pages/SettingsPage";
import {ControlledInputComponent, ControlledInputComponentProps} from "./ControlledInputComponent";

import "./styles/_sidelisteditor.scss";
import {ZoneDisplayComponent} from "./ZoneDisplayComponent";


interface LayoutEditorProps {
    openDialog: (dialog: Dialog) => void;

    user: User;
    warehouse: Warehouse;

    setLock: (lockFunction: (tab: SettingsTab) => boolean) => void;

    updatePage: () => void;
}

type NewZone = ZoneFields & {
    bays: number;
    shelves: number;
    mirrorBayLabels: boolean;
    addGroundShelves: boolean;
};
type EditingState = {
    state: "editing";
    selectedZone: Zone;
    editedZone: Zone;
};
type NewState = {
    state: "new";
    newZone: NewZone;
};
type NothingSelectedState = {
    state: "nothingSelected";
};
type LayoutEditorState = NothingSelectedState | EditingState | NewState;

/**
 * Converts to base 26 using the upper case latin alphabet
 * @param number The number to convert
 * @returns The result
 */
function toAlphabetBase(number: number): string {

    return number.toString(26).split("").map(char => {
        return (parseInt(char, 26) + 10).toString(36).toUpperCase();
    }).reduce((acc, cur) => acc + cur, "");
}

/**
 * This class controls the GUI which allows for editing and building new zones
 */
export class LayoutEditor extends React.Component<LayoutEditorProps, LayoutEditorState> {

    private static readonly DEFAULT_NAME = "Unnamed";

    private static readonly BLANK_ZONE: NewZone = {
        name: "",
        color: "#ff0000",
        bays: 5,
        shelves: 5,
        mirrorBayLabels: false,
        addGroundShelves: true,
    };

    private static readonly GROUND_ROW_NAME = "G";

    constructor(props: LayoutEditorProps) {
        super(props);

        this.state = {
            state: "nothingSelected"
        };

        this.props.setLock((_: SettingsTab) => {
            const hasUnsavedChanges = this.hasUnsavedChanges();
            if (hasUnsavedChanges) {
                this.props.openDialog(this.createUnsavedDialog());
            }
            return hasUnsavedChanges;
        });
    }

    /**
     * Selects a zone for editing, otherwise displays an error
     * @param zone The zone to select
     */
    private setSelected(zone: Zone): void {
        if (this.hasUnsavedChanges()) {
            this.props.openDialog(this.createUnsavedDialog());
        } else {
            this.setState(_ => ({
                state: "editing",
                selectedZone: zone,
                editedZone: cloneDeep(zone)
            }));
        }
    }

    /**
     * Creates the right-hand side of the screen
     * Displays content of categories and allows user to edit them
     */
    private renderEditPanel(): React.ReactNode {

        const stateAtRender = this.state;

        if (stateAtRender.state === "nothingSelected") {
            return <div id="empty-message-container">
                <p id="empty-message">Select or add a zone to start editing</p>
            </div>;
        } else {
            const unsavedLabel = this.hasUnsavedChanges() ? "*" : "";
            const zoneSettings: ControlledInputComponentProps[] = stateAtRender.state === "editing" ? [
                {
                    inputType: "text",
                    placeholder: LayoutEditor.DEFAULT_NAME,
                    get: () => stateAtRender.editedZone.name,
                    set: (value: string) => {
                        this.setState(state => {
                            if (state.state === "editing") {
                                state.editedZone.name = value;
                            }
                            return state;
                        });
                    },
                    label: "Name"
                }, {
                    inputType: "color",
                    get: () => stateAtRender.editedZone.color,
                    set: (value: string | null) => {
                        this.setState(state => {
                            if (state.state === "editing") {
                                state.editedZone.color = value ?? "#ffffff00";
                            }
                            return state;
                        });
                    },
                    onClear: null,
                    label: "Color"
                }
            ] : [
                {
                    inputType: "text",
                    placeholder: "Unnamed",
                    get: () => stateAtRender.newZone.name,
                    set: (value: string) => {
                        this.setState(state => {
                            if (state.state === "new") {
                                state.newZone.name = value;
                            }
                            return state;
                        });
                    },
                    label: "Name"
                }, {
                    inputType: "color",
                    get: () => stateAtRender.newZone.color,
                    set: (value: string | null) => {
                        this.setState(state => {
                            if (state.state === "new") {
                                state.newZone.color = value ?? "#ffffff00";
                            }
                            return state;
                        });
                    },
                    onClear: null,
                    label: "Color"
                }, {
                    inputType: "number",
                    get: () => stateAtRender.newZone.bays,
                    set: (value: number | null) => {
                        this.setState(state => {
                            if (state.state === "new") {
                                state.newZone.bays = value ?? 1;
                            }
                            return state;
                        });
                    },
                    min: 1,
                    max: undefined,
                    label: "Number of Bays",
                    placeholder: "1"
                }, {
                    inputType: "number",
                    get: () => stateAtRender.newZone.shelves,
                    set: (value: number | null) => {
                        this.setState(state => {
                            if (state.state === "new") {
                                state.newZone.shelves = value ?? 1;
                            }
                            return state;
                        });
                    },
                    label: "Number of Shelves Per Bay",
                    min: 1,
                    max: undefined,
                    placeholder: "1"
                }, {
                    inputType: "boolean",
                    get: () => stateAtRender.newZone.mirrorBayLabels,
                    set: (value: boolean) => {
                        this.setState(state => {
                            if (state.state === "new") {
                                state.newZone.mirrorBayLabels = value;
                            }
                            return state;
                        });
                    },
                    label: "Mirror Bay Labels",
                }, {
                    inputType: "boolean",
                    get: () => stateAtRender.newZone.addGroundShelves,
                    set: (value: boolean) => {
                        this.setState(state => {
                            if (state.state === "new") {
                                state.newZone.addGroundShelves = value;
                            }
                            return state;
                        });
                    },
                    label: "Add Ground Row of Shelves",
                }
            ];

            return <>
                <div id="edit-controls">
                    <div id="edit-header">
                        <h2>{stateAtRender.state === "editing"
                             ? `Edit '${stateAtRender.editedZone.name}'${unsavedLabel}`
                             : `New Zone '${stateAtRender.newZone.name}'`}</h2>

                        {stateAtRender.state === "editing" ? <button
                            onClick={this.deleteZone.bind(this, stateAtRender)}
                        >Delete Zone</button> : null}

                    </div>
                    <table>
                        <tbody>
                        {zoneSettings.map((setting, index) =>
                            <ControlledInputComponent key={index} {...setting} />
                        )}
                        </tbody>
                    </table>

                    {stateAtRender.state === "editing" ? <>
                        <h3>An existing zone's dimensions can't be edited!</h3>
                        <ZoneDisplayComponent
                            zone={stateAtRender.editedZone}
                            selected={null} onSelected={null}
                        />
                    </> : null}
                </div>

                <div id="bottom-btns">
                    {stateAtRender.state === "editing" ? <button
                        disabled={!this.hasUnsavedChanges()}
                        onClick={this.hasUnsavedChanges() ? this.updateZone.bind(this, stateAtRender) : undefined}
                    >Save Changes
                    </button> : <button
                         disabled={!this.hasUnsavedChanges()}
                         onClick={this.hasUnsavedChanges() ? this.createZone.bind(this, stateAtRender) : undefined}
                     >Create Zone
                     </button>}
                    <button
                        onClick={this.resetEditor.bind(this)}
                    >Discard {stateAtRender.state === "editing" ? "Changes" : ""}
                    </button>
                </div>
            </>;

        }
    }

    /**
     * Changes the edit panel to editing a new zone
     */
    private newZone(): void {

        if (this.hasUnsavedChanges()) {
            this.props.openDialog(this.createUnsavedDialog());

        } else {
            this.setState(_ => ({
                state: "new",
                newZone: cloneDeep(LayoutEditor.BLANK_ZONE)
            }));
        }
    }

    /**
     * Checks if any of the fields in the currently displayed category has changed
     */
    private hasUnsavedChanges(): boolean {

        return (this.state.state === "editing" && !isEqual(this.state.editedZone, this.state.selectedZone))
            || this.state.state === "new";
    }

    /**
     * This method saves the newly created zone and moves the editor into a state which edits it
     * @param state The editor state containing the new zone
     */
    private async createZone(state: NewState): Promise<void> {

        if (state.newZone.name.length === 0) {
            state.newZone.name = LayoutEditor.DEFAULT_NAME;
        }

        const newZone = Zone.create(state.newZone.name, state.newZone.color, this.props.warehouse);

        for (let bay = 0; bay < state.newZone.bays; bay++) {
            const bayName = state.newZone.mirrorBayLabels ? toAlphabetBase(state.newZone.bays - bay - 1)
                                                          : toAlphabetBase(bay);

            const newBay = Bay.create(bayName, newZone);

            for (let shelf = 0; shelf < state.newZone.shelves; shelf++) {

                const shelfName = (() => {
                    if (state.newZone.addGroundShelves) {
                        if (shelf === 0) {
                            return LayoutEditor.GROUND_ROW_NAME;
                        } else {
                            return shelf.toString();
                        }
                    } else {
                        return (shelf + 1).toString();
                    }
                })();

                Shelf.create(shelfName, false, newBay);
            }
        }


        await newZone.stage(true, true, WarehouseModel.shelf);
        this.setState(_ => ({
            state: "editing",
            selectedZone: newZone,
            editedZone: cloneDeep(newZone)
        }), this.props.updatePage);

    }

    /**
     *Saves changes to categories, doesn't let user save category with empty name
     */
    private async updateZone(state: EditingState): Promise<void> {

        if (state.editedZone.name.length === 0) {
            state.editedZone.name = LayoutEditor.DEFAULT_NAME;
        }

        Object.assign(state.selectedZone, state.editedZone);
        await state.editedZone.stage(true, true);

        this.setState(_ => ({
            state: "editing",
            selectedZone: state.selectedZone,
            editedZone: cloneDeep(state.selectedZone)
        }), this.props.updatePage);

    }

    /**
     * Resets the editor to deselect everything (discards any changes)
     */
    private resetEditor(): void {
        this.setState(_ => ({
            state: "nothingSelected"
        }));
    }

    /**
     * Deletes category, makes sure indices inside object matches actual
     * indices after removing one category
     */
    private async deleteZone(state: EditingState): Promise<void> {

        await state.selectedZone.delete(true);
        this.setState(_ => ({
            state: "nothingSelected"
        }), this.props.updatePage);

    }


    render(): React.ReactNode {

        const selectedZone = this.state.state === "editing" ? this.state.selectedZone : null;

        return <div id="editor">
            <div id="sidebar">
                <div id="title">Zones</div>
                <div id="list">
                    {this.props.warehouse.zones.map((zone, index) => <div
                        className={classNames("list-item", {
                            "selected": selectedZone === zone
                        })}
                        key={index}
                        onClick={this.setSelected.bind(this, zone)}
                    >
                        {zone.name}
                    </div>)}
                </div>
                <button id="top-btn" onClick={this.newZone.bind(this)}>New Zone</button>

            </div>
            <div id="edit-main">
                {this.renderEditPanel()}
            </div>
        </div>;


    }

    /**
     * Returns the unsaved changes dialog
     */
    private createUnsavedDialog(): Dialog {
        return {
            closeOnDocumentClick: true,
            dialog: (close: () => void) => <>
                <DialogTitle title="Unsaved Changes" iconProps={{icon: faInfoCircle, color: "blue"}}/>
                <div className="dialogContent">
                    <h2>Please save or discard your current changes before proceeding</h2>
                    <DialogButtons buttons={[
                        {name: "OK", buttonProps: {onClick: close}}
                    ]}/>
                </div>
            </>
        };
    }

}