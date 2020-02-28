import {faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";
import {cloneDeep, isEqual} from "lodash";
import React from "react";
import {Dialog, DialogButtons, DialogTitle} from "../core/Dialog";
import {User} from "../core/Firebase";
import {Warehouse, Zone} from "../core/WarehouseModel";
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


interface LayoutEditorState {
    selectedZone: Zone | null;
    editedZone: Zone | null;
}

/**
 * This class displays all categories in the warehouse, lets the user
 * edit and delete existing categories, and add new ones
 */

export class LayoutEditor extends React.Component<LayoutEditorProps, LayoutEditorState> {

    constructor(props: LayoutEditorProps) {
        super(props);

        this.state = {
            editedZone: null,
            selectedZone: null
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
            this.setState((state) => ({
                ...state,
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
        if (this.state.editedZone) {
            const unsavedLabel = this.hasUnsavedChanges() ? "*" : "";

            const zoneSettings: ControlledInputComponentProps[] = [
                {
                    inputType: "textField",
                    type: "text",
                    placeholder: "Unnamed",
                    get: () => this.state.editedZone?.name ?? "",
                    set: (value: string) => {
                        this.setState(state => {
                            if (state.editedZone) {
                                state.editedZone.name = value;
                            }
                            return state;
                        });
                    },
                    label: "Name"
                }, {
                    inputType: "color",
                    get: () => this.state.editedZone?.color ?? "#ffffff00",
                    set: (value: string | null) => {
                        this.setState(state => {
                            if (state.editedZone) {
                                state.editedZone.color = value ?? "#ffffff00";
                            }
                            return state;
                        });
                    },
                    onClear: null,
                    label: "Color"
                }
            ];

            return <>
                <div id="zone-edit-controls">
                    <div id="zone-edit-header">
                        <h2>{this.state.selectedZone ? `Edit '${this.state.selectedZone.name}'${unsavedLabel}`
                                                     : "New Zone"}</h2>
                    </div>
                    <table key={undefined}>
                        <tbody>
                        {zoneSettings.map((setting, index) =>
                            <ControlledInputComponent key={index} {...setting} />
                        )}
                        </tbody>
                    </table>
                    <ZoneDisplayComponent zone={this.state.editedZone} selected={null} onSelected={null}/>
                </div>
                <div id="bottom-btns">
                    <button
                        disabled={!this.hasUnsavedChanges()}
                        onClick={this.hasUnsavedChanges() ? this.saveChanges.bind(this) : undefined}
                    >Save Changes
                    </button>
                    <button
                        onClick={this.discardChanges.bind(this)}
                    >Discard Changes
                    </button>
                </div>
            </>;
        } else {
            return <div id="empty-message-container">
                <p id="empty-message">Select or add a zone to start editing</p>
            </div>;
        }

    }

    /**
     * Is called if user clicks button to add a new category
     */
    private newZone(): void {

        if (this.hasUnsavedChanges()) {
            this.props.openDialog(this.createUnsavedDialog());
        } else {
            const newZone = Zone.create("New Zone", "#00ff00", this.props.warehouse);
            this.setState(state => ({
                ...state,
                selectedZone: newZone,
                editedZone: newZone
            }));
        }
    }

    /**
     * Checks if any of the fields in the currently displayed category has changed
     */
    private hasUnsavedChanges(): boolean {

        return !isEqual(this.state.editedZone, this.state.selectedZone);
    }

    /**
     *Saves changes to categories, doesn't let user save category with empty name
     */
    private async saveChanges(): Promise<void> {
        // if (this.state.draftCat) {
        //
        //     const newCategory = cloneDeep(this.state.draftCat); // to avoid altering the state here
        //     if (newCategory.name.length === 0) {
        //         newCategory.name = CategoryEditor.DEFAULT_NAME;
        //     }
        //
        //     if (this.state.oldCat) {
        //         this.props.editCategory(this.props.getCategoryID(this.state.oldCat), newCategory);
        //
        //         this.setState(state => ({
        //             ...state,
        //             oldCat: newCategory,
        //             draftCat: cloneDeep(newCategory)
        //         }));
        //     } else {
        //         newCategory.index = this.props.categories.length;
        //         this.setState(state => ({
        //             ...state,
        //             oldCat: newCategory,
        //             draftCat: cloneDeep(newCategory)
        //         }));
        //         this.props.addCategory(newCategory);
        //     }
        //     this.props.updatePage();
        //     await this.props.stage(true, true);
        //
        // }
    }

    private discardChanges(): void {
        this.setState(state => ({
            ...state,
            selectedZone: null,
            editedZone: null
        }));
    }

    /**
     * Deletes category, makes sure indices inside object matches actual
     * indices after removing one category
     */
    private deleteZone(): void {

        // // todo fixme Not sure who wrote this - this needs checking for correctness. Does it definitely re-sync all
        // // indices changes to DB? Surely the adjustments happen in the then, which occurs afterwards?
        //
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

        return <div id="zone-editor">
            <div id="zone-sidebar">
                <div id="title">Zones</div>
                <div id="zone-list">
                    {this.props.warehouse.zones.map((zone, index) => <div
                        className={classNames("list-item", {
                            "selected": this.state.selectedZone === zone
                        })}
                        key={index}
                        onClick={this.setSelected.bind(this, zone)}
                    >
                        {zone.name}
                    </div>)}
                </div>
                <button id="top-btn" onClick={this.newZone.bind(this)}>New Zone</button>
                <button onClick={this.deleteZone.bind(this)}>Remove Zone</button>
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