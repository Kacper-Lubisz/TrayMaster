import {faExclamationTriangle} from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";
import {cloneDeep, isEqual} from "lodash";
import React from "react";
import {User} from "../core/Firebase";
import {Category, WarehouseModel} from "../core/WarehouseModel";
import {NEVER_EXPIRY} from "../core/WarehouseModel/Utils";
import {SettingsTab} from "../pages/SettingsPage";
import {createConfirmationDialog, createUnsavedDialog, DANGER_COLOR} from "../utils/dialogs";
import {ControlledInputComponent, ControlledInputComponentProps} from "./ControlledInputComponent";
import {Dialog} from "./Dialog";

import "./styles/_sidelisteditor.scss";


interface CategoryEditorProps {
    openDialog: (dialog: Dialog) => void;
    categories: Category[];
    user: User;

    setLock: (lockFunction: (tab: SettingsTab) => boolean) => void;

    addCategory: (category: Category) => void;
    removeCategory: (category: Category) => void;
    editCategory: (id: string, category: Category) => void;
    getCategoryID: (category?: Category) => string;
    stage: (forceStage?: boolean, commit?: boolean, minLayer?: WarehouseModel) => Promise<void>;

    repaintSettings: () => void;
}


type EditingState = {
    state: "editing";
    selectedCategory: Category;
    editedCategory: Category;
};
type NewState = {
    state: "new";
    newCategory: Category;
};
type NothingSelectedState = {
    state: "nothingSelected";
};
type CategoryEditorState = NothingSelectedState | EditingState | NewState;

/**
 * This class displays all categories in the warehouse, lets the user
 * edit and delete existing categories, and add new ones
 */

export class CategoryEditor extends React.Component<CategoryEditorProps, CategoryEditorState> {

    private static readonly DEFAULT_NAME = "Unnamed";

    private static readonly BLANK_CATEGORY: Category = {
        index: -1,
        name: "",
        shortName: null,
        underStockThreshold: null,
        overStockThreshold: null,
        group: null,
        defaultExpiry: null
    };

    constructor(props: CategoryEditorProps) {
        super(props);

        this.state = {
            state: "nothingSelected"
        };

        this.props.setLock((_: SettingsTab) => {
            const hasUnsavedChanges = this.hasUnsavedChanges();
            if (hasUnsavedChanges) {
                this.props.openDialog(createUnsavedDialog());
            }
            return hasUnsavedChanges;
        });
    }

    /**
     * Is called when user selects a category in the list
     * Changes state values to display corresponding category
     * in editor
     * @param cat
     */
    private selectCategory(cat: Category): void {
        if (this.hasUnsavedChanges()) {
            this.props.openDialog(createUnsavedDialog());
        } else {
            this.setState(_ => ({
                state: "editing",
                selectedCategory: cat,
                editedCategory: cloneDeep(cat)
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
                <p id="empty-message">Select or create a new category to start editing</p>
            </div>;
        } else {

            const categoryToEdit = stateAtRender.state === "new" ? stateAtRender.newCategory
                                                                 : stateAtRender.editedCategory;

            const categorySettings: ControlledInputComponentProps[] = [
                {
                    inputType: "text",
                    get: () => categoryToEdit.name,
                    set: (value: string) => {
                        this.setState(state => {
                            categoryToEdit.name = value;
                            return state;
                        });
                    },
                    placeholder: CategoryEditor.DEFAULT_NAME,
                    label: "Name"
                }, {
                    inputType: "text",
                    get: () => categoryToEdit.shortName ?? "",
                    set: (value: string) => {
                        this.setState(state => {
                            categoryToEdit.shortName = value.length === 0 ? null : value;
                            return state;
                        });
                    },
                    placeholder: undefined,
                    label: "Short Name"
                }, /*{ todo reintroduce these settings when they are used
                    inputType: "number",
                    get: () => categoryToEdit.underStockThreshold ?? null,
                    set: (value: number | null) => {

                        this.setState(state => {
                            categoryToEdit.underStockThreshold = value;
                            return state;
                        });
                    },
                    min: 0,
                    max: undefined,
                    placeholder: "No threshold",
                    label: "Under-Stock Threshold (trays)"
                }, {
                    inputType: "number",
                    get: () => categoryToEdit.overStockThreshold ?? 0,
                    set: (value: number | null) => {
                        this.setState(state => {
                            categoryToEdit.overStockThreshold = value;
                            return state;
                        });
                    },
                    min: 0,
                    max: undefined,
                    placeholder: "No threshold",
                    label: "Over-Stock Threshold (trays)"
                }, */{
                    inputType: "boolean",
                    get: () => categoryToEdit?.defaultExpiry !== null,
                    set: (value: boolean) => {
                        this.setState(state => {
                            categoryToEdit.defaultExpiry = value ? NEVER_EXPIRY : null;
                            return state;
                        });

                    },
                    label: "Never Expires"
                }, {
                    inputType: "text",
                    get: () => categoryToEdit?.group ?? "",
                    set: (value: string) => {
                        this.setState(state => {
                            categoryToEdit.group = value.length === 0 ? null : value;
                            return state;
                        });
                    },
                    placeholder: "No Group",
                    label: "Group Title"
                }
            ];

            const unsavedLabel = this.hasUnsavedChanges() ? "*" : "";
            return <>
                <div id="edit-controls">
                    <div id="edit-header">
                        <h4>{
                            stateAtRender.state === "editing"
                            ? `Edit '${categoryToEdit.name}'${unsavedLabel}`
                            : `New Category '${categoryToEdit.name}'`
                        }</h4>
                        {
                            stateAtRender.state === "editing" ? <button
                                onClick={this.deleteCategory.bind(this, stateAtRender)}
                            >Delete</button> : null
                        }
                    </div>
                    <table>
                        <tbody>
                        {categorySettings.map((setting, index) =>
                            <ControlledInputComponent key={index} {...setting} />
                        )}
                        </tbody>
                    </table>
                </div>

                <div id="bottom-btns">
                    <button
                        onClick={this.resetEditor.bind(this)}
                    >Cancel
                    </button>
                    {stateAtRender.state === "editing" ? <button
                        disabled={!this.hasUnsavedChanges()}
                        onClick={this.hasUnsavedChanges() ? this.updateCategory.bind(this, stateAtRender)
                                                          : undefined}
                    >Save
                    </button> : <button
                         disabled={!this.hasUnsavedChanges()}
                         onClick={this.hasUnsavedChanges() ? this.createCategory.bind(this, stateAtRender)
                                                           : undefined}
                     >Create
                     </button>}
                </div>

            </>;

        }

    }

    /**
     * Is called if user clicks button to add a new category
     */
    private newCategory(): void {

        if (this.hasUnsavedChanges()) {
            this.props.openDialog(createUnsavedDialog());
        } else {
            this.setState(_ => ({
                state: "new",
                newCategory: cloneDeep(CategoryEditor.BLANK_CATEGORY),
            }));
        }
    }

    /**
     * Checks if there is anything to save in the current state
     */
    private hasUnsavedChanges(): boolean {
        return this.state.state === "new" || (
            this.state.state === "editing" &&
            !isEqual(this.state.editedCategory, CategoryEditor.BLANK_CATEGORY) &&
            !isEqual(this.state.selectedCategory, this.state.editedCategory)
        );
    }

    /**
     * This method saves the newly created category and moves the editor into a state which edits it
     * @param state The editor state containing the new category
     */
    private async createCategory(state: NewState): Promise<void> {

        if (state.newCategory.name.length === 0) {
            state.newCategory.name = CategoryEditor.DEFAULT_NAME;
        }
        state.newCategory.index = this.props.categories[this.props.categories.length - 1].index + 1;

        this.props.addCategory(state.newCategory);
        await this.props.stage(true, true);

        this.setState(_ => ({
            state: "editing",
            selectedCategory: state.newCategory,
            editedCategory: state.newCategory
        }), this.props.repaintSettings);

    }

    /**
     * Saves changes to the edited category in the EditingState state
     */
    private async updateCategory(state: EditingState): Promise<void> {

        if (state.editedCategory.name.length === 0) {
            state.editedCategory.name = CategoryEditor.DEFAULT_NAME;
        }

        this.props.editCategory(this.props.getCategoryID(state.selectedCategory), state.editedCategory);
        await this.props.stage(true, true);

        this.setState(_ => ({
            state: "editing",
            selectedCategory: state.editedCategory,
            editedCategory: cloneDeep(state.editedCategory)
        }), this.props.repaintSettings);

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
    private deleteCategory(state: EditingState): void {

        this.props.openDialog(createConfirmationDialog(
            "Confirm Deletion",
            {icon: faExclamationTriangle, color: DANGER_COLOR},
            "Are you sure you want to delete this category?",
            "Delete",
            () => {
                this.props.removeCategory(state.selectedCategory);
                this.props.stage(true, true).then(() => {
                    this.setState(_ => ({
                        state: "nothingSelected",
                    }), this.props.repaintSettings);
                });
            }
        ));

    }


    render(): React.ReactNode {

        const selected = this.state.state === "editing" ? this.state.selectedCategory : null;
        return <div id="editor">
            <div id="sidebar">
                <h3>Categories</h3>
                <div id="list">
                    {this.props.categories.map((cat, index) => <div
                        className={classNames("list-item", {
                            "selected": isEqual(selected, cat)
                        })}
                        key={index}
                        onClick={this.selectCategory.bind(this, cat)}
                    >
                        {cat.name}
                    </div>)}
                </div>
                <button id="list-bottom-btn" onClick={this.newCategory.bind(this)}>New Category</button>
            </div>
            <div id="edit-main">
                {this.renderEditPanel()}
            </div>
        </div>;
    }

}