import {faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";
import {cloneDeep, isEqual} from "lodash";
import React from "react";
import {Dialog, DialogButtons, DialogTitle} from "../core/Dialog";
import {User} from "../core/Firebase";
import {Bay, Shelf, Warehouse, Zone} from "../core/WarehouseModel";
import {ZoneFields} from "../core/WarehouseModel/Layers/Zone";
import {SettingsTab} from "../pages/SettingsPage";
import {ControlledInputComponent, ControlledInputComponentProps} from "./ControlledInputComponent";

import "./styles/_layouteditor.scss";
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
type NewZoneState = {
    state: "newZone";
    newZone: NewZone;
};
type NothingSelectedState = {
    state: "nothingSelected";
};
type LayoutEditorState = NothingSelectedState | EditingState | NewZoneState;

function toAlphabetBase26(number: number): string {

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
        } else if (stateAtRender.state === "editing") {
            const zoneSettings: ControlledInputComponentProps[] = [
                {
                    inputType: "textField",
                    type: "text",
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
            ];
            const unsavedLabel = this.hasUnsavedChanges() ? "*" : "";
            return <>
                <div id="zone-edit-controls">
                    <div id="zone-edit-header">
                        <h2>{`Edit '${stateAtRender.editedZone.name}'${unsavedLabel}`}</h2>
                        <button onClick={this.deleteZone.bind(this)}>Remove Zone</button>
                    </div>
                    <table key={undefined}>
                        <tbody>
                        {zoneSettings.map((setting, index) =>
                            <ControlledInputComponent key={index} {...setting} />
                        )}
                        </tbody>
                    </table>
                    <h3>An existing zone's dimensions can't be edited!</h3>
                    <ZoneDisplayComponent zone={stateAtRender.editedZone} selected={null} onSelected={null}/>
                </div>
                <div id="bottom-btns">
                    <button
                        disabled={!this.hasUnsavedChanges()}
                        onClick={this.hasUnsavedChanges() ? this.saveChanges.bind(this, stateAtRender) : undefined}
                    >Save Changes
                    </button>
                    <button
                        onClick={this.discardChanges.bind(this)}
                    >Discard Changes
                    </button>
                </div>
            </>;
        } else {
            const zoneSettings: ControlledInputComponentProps[] = [
                {
                    inputType: "textField",
                    type: "text",
                    placeholder: "Unnamed",
                    get: () => stateAtRender.newZone.name,
                    set: (value: string) => {
                        this.setState(state => {
                            if (state.state === "newZone") {
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
                            if (state.state === "newZone") {
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
                            if (state.state === "newZone") {
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
                            if (state.state === "newZone") {
                                state.newZone.shelves = value ?? 1;
                            }
                            return state;
                        });
                    },
                    label: "Number of Shelve Per Bay",
                    min: 1,
                    max: undefined,
                    placeholder: "1"
                }, {
                    inputType: "checkBox",
                    get: () => stateAtRender.newZone.mirrorBayLabels,
                    set: (value: boolean) => {
                        this.setState(state => {
                            if (state.state === "newZone") {
                                state.newZone.mirrorBayLabels = value;
                            }
                            return state;
                        });
                    },
                    label: "Mirror Bay Labels",
                }, {
                    inputType: "checkBox",
                    get: () => stateAtRender.newZone.addGroundShelves,
                    set: (value: boolean) => {
                        this.setState(state => {
                            if (state.state === "newZone") {
                                state.newZone.addGroundShelves = value;
                            }
                            return state;
                        });
                    },
                    label: "Add Ground Row of Shelves",
                }
            ];
            return <>
                <div id="zone-edit-controls">
                    <div id="zone-edit-header">
                        <h2>{`New Zone '${stateAtRender.newZone.name}'`}</h2>
                    </div>
                    <table key={undefined}>
                        <tbody>
                        {zoneSettings.map((setting, index) =>
                            <ControlledInputComponent key={index} {...setting} />
                        )}
                        </tbody>
                    </table>
                </div>
                <div id="bottom-btns">
                    <button
                        disabled={!this.hasUnsavedChanges()}
                        onClick={this.hasUnsavedChanges() ? this.createZone.bind(this, stateAtRender) : undefined}
                    >Create Zone
                    </button>
                    <button
                        onClick={this.discardChanges.bind(this)}
                    >Discard
                    </button>
                </div>
            </>;
        }
    }

    /**
     * Is called if user clicks button to add a new category
     */
    private newZone(): void {

        if (this.hasUnsavedChanges()) {
            this.props.openDialog(this.createUnsavedDialog());
        } else {

            this.setState(_ => ({
                state: "newZone",
                newZone: cloneDeep(LayoutEditor.BLANK_ZONE)
            }));
        }
    }

    /**
     * Checks if any of the fields in the currently displayed category has changed
     */
    private hasUnsavedChanges(): boolean {

        return (this.state.state === "editing" && !isEqual(this.state.editedZone, this.state.selectedZone))
            || this.state.state === "newZone";
    }

    private async createZone(state: NewZoneState): Promise<void> {

        if (state.newZone.name.length === 0) {
            state.newZone.name = LayoutEditor.DEFAULT_NAME;
        }

        const newZone = Zone.create(state.newZone.name, state.newZone.color, this.props.warehouse);

        for (let bay = 0; bay < state.newZone.bays; bay++) {
            const bayName = state.newZone.mirrorBayLabels ? toAlphabetBase26(state.newZone.bays - bay - 1)
                                                          : toAlphabetBase26(bay);

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


        await newZone.stage(true, true);
        this.props.updatePage();
        this.setState(_ => ({
            state: "editing",
            selectedZone: newZone,
            editedZone: cloneDeep(newZone)
        }));

    }

    /**
     *Saves changes to categories, doesn't let user save category with empty name
     */
    private async saveChanges(state: EditingState): Promise<void> {

        if (state.editedZone.name.length === 0) {
            state.editedZone.name = LayoutEditor.DEFAULT_NAME;
        }

        Object.assign(state.selectedZone, state.editedZone);
        await state.editedZone.stage(true, true);

        this.setState(_ => ({
            state: "editing",
            selectedZone: state.selectedZone,
            editedZone: cloneDeep(state.selectedZone)
        }));
        this.props.updatePage();

    }

    private discardChanges(): void {
        this.setState(_ => ({
            state: "nothingSelected",
        }));
    }

    /**
     * Deletes category, makes sure indices inside object matches actual
     * indices after removing one category
     */
    private deleteZone(): void {

        //todo check if this code is any good
        // if (this.state.oldCat && this.state.draftCat?.type !== "default") {
        //     this.props.removeCategory(this.state.oldCat);
        //     this.props.stage(true, true).then(() => {
        //             if (this.state.oldCat && this.state.oldCat.index !== this.props.categories.length - 1) {
        //                 this.props.updatePage();
        //                 for (let j = this.state.oldCat.index; j < this.props.categories.length - 1; j++) {
        //                     const category = this.props.categories[j];
        //                     const id = this.props.getCategoryID(category);
        //                     category.index = j;
        //                     this.props.editCategory(id, category);
        //                 }
        //             }
        //             this.setState(state => ({
        //                 ...state,
        //                 oldCat: undefined,
        //                 draftCat: undefined
        //             }));
        //             this.props.updatePage();
        //         }
        //     );
        // }
    }


    render(): React.ReactNode {

        const selectedZone = this.state.state === "editing" ? this.state.selectedZone : null;

        return <div id="zone-editor">
            <div id="zone-sidebar">
                <div id="title">Zones</div>
                <div id="zone-list">
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
            <div id="zone-edit-main">
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