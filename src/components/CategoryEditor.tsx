import {faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";
import {cloneDeep, isEqual} from "lodash";
import React from "react";
import {Dialog, DialogButtons, DialogTitle} from "../core/Dialog";
import {User} from "../core/Firebase";
import {Category, WarehouseModel} from "../core/WarehouseModel";
import {NEVER_EXPIRY} from "../core/WarehouseModel/Layers/Warehouse";
import {SettingsTab} from "../pages/SettingsPage";
import {ControlledInputComponent, ControlledInputComponentProps} from "./ControlledInputComponent";

import "./styles/_categoryeditor.scss";


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

    updatePage: () => void;
}


interface CategoryEditorState {
    oldCat?: Category;
    draftCat?: Category;
}

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
        type: "custom",
        group: null,
        defaultExpiry: null
    };

    constructor(props: CategoryEditorProps) {
        super(props);

        this.state = {
            oldCat: undefined,
            draftCat: undefined
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
     * Is called when user selects a category in the list
     * Changes state values to display corresponding category
     * in editor
     * @param cat
     */
    private selectCategory(cat: Category): void {
        if (this.hasUnsavedChanges()) {
            this.props.openDialog(this.createUnsavedDialog());
        } else {
            this.setState((state) => ({
                ...state,
                oldCat: cat,
                draftCat: cloneDeep(cat)
            }));
        }
    }

    /**
     * Creates the right-hand side of the screen
     * Displays content of categories and allows user to edit them
     */
    private renderEditPanel(): React.ReactNode {

        const categorySettings: ControlledInputComponentProps[] = [
            {
                inputType: "textField",
                type: "text",
                get: () => this.state.draftCat?.name ?? "",
                set: (value: string) => {
                    this.setState(state => {
                        if (state.draftCat) {
                            state.draftCat.name = value;
                        }
                        return state;
                    });

                },
                placeholder: CategoryEditor.DEFAULT_NAME,
                label: "Name"
            }, {
                inputType: "textField",
                type: "text",
                get: () => this.state.draftCat?.shortName ?? "",
                set: (value: string) => {
                    this.setState(state => {
                        if (state.draftCat) {
                            state.draftCat.shortName = value.length === 0 ? null : value;
                        }
                        return state;
                    });
                },
                placeholder: undefined,
                label: "Short Name"
            }, {
                inputType: "number",
                get: () => this.state.draftCat?.underStockThreshold ?? null,
                set: (value: number | null) => {

                    this.setState(state => {
                        if (state.draftCat) {
                            state.draftCat.underStockThreshold = value;
                        }
                        return state;
                    });
                },
                placeholder: "No threshold",
                label: "Under-Stock Threshold (trays)"
            }, {
                inputType: "number",
                get: () => this.state.draftCat?.overStockThreshold ?? 0,
                set: (value: number | null) => {
                    this.setState(state => {
                        if (state.draftCat) {
                            state.draftCat.overStockThreshold = value;
                        }
                        return state;
                    });
                },
                placeholder: "No threshold",
                label: "Over-Stock Threshold (trays)"
            }, {
                inputType: "checkBox",
                get: () => this.state.draftCat?.defaultExpiry !== null,
                set: (value: boolean) => {
                    this.setState(state => {
                        if (state.draftCat) {
                            state.draftCat.defaultExpiry = value ? NEVER_EXPIRY : null;
                        }
                        return state;
                    });

                },
                label: "Never Expires"
            }, {
                inputType: "textField",
                type: "text",
                get: () => this.state.draftCat?.group ?? "",
                set: (value: string) => {
                    this.setState(state => {
                        if (state.draftCat) {
                            state.draftCat.group = value.length === 0 ? null : value;
                        }
                        return state;
                    });
                },
                placeholder: "No Group",
                label: "Group Title"
            }
        ];


        if (this.state.draftCat) {
            const defaultLabel = this.state.oldCat?.type === "default" ? " (default)"
                                                                       : "";
            const unsavedLabel = this.hasUnsavedChanges() ? "*" : "";
            return <>
                <div id="cat-edit-controls">
                    <div id="cat-edit-header">
                        <h2>{this.state.oldCat ? `Edit '${this.state.oldCat.name}'${defaultLabel}${unsavedLabel}`
                                               : "New Category"}</h2>
                        <button
                            disabled={this.state.oldCat?.type === "default"}
                            onClick={this.deleteCategory.bind(this)}
                        >Delete Category
                        </button>
                        <div>
                            {this.state.oldCat?.type === "default" ? <div id="del-msg">You cannot delete a default
                                category!</div> : null}
                        </div>
                    </div>
                    <table key={undefined}>
                        <tbody>
                        {categorySettings.map((setting, index) =>
                            <ControlledInputComponent key={index} {...setting} />
                        )}
                        </tbody>
                    </table>
                </div>
                <div id="cat-edit-bottom-btns">
                    <button
                        disabled={!this.hasUnsavedChanges()}
                        onClick={this.hasUnsavedChanges() ? this.saveCategory.bind(this) : undefined}
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
                <p id="empty-message">Select or add a category to start editing</p>
            </div>;
        }

    }

    /**
     * Is called if user clicks button to add a new category
     */
    private newCategory(): void {

        if (this.hasUnsavedChanges()) {
            this.props.openDialog(this.createUnsavedDialog());
        } else {
            this.setState(state => ({
                ...state,
                oldCat: undefined,
                draftCat: cloneDeep(CategoryEditor.BLANK_CATEGORY)
            }));
        }
    }

    /**
     * Checks if any of the fields in the currently displayed category has changed
     */
    private hasUnsavedChanges(): boolean {
        return !isEqual(this.state.draftCat, CategoryEditor.BLANK_CATEGORY) && !isEqual(this.state.oldCat, this.state.draftCat);
    }

    /**
     *Saves changes to categories, doesn't let user save category with empty name
     */
    private async saveCategory(): Promise<void> {
        if (this.state.draftCat) {

            const newCategory = cloneDeep(this.state.draftCat); // to avoid altering the state here
            if (newCategory.name.length === 0) {
                newCategory.name = CategoryEditor.DEFAULT_NAME;
            }

            if (this.state.oldCat) {
                this.props.editCategory(this.props.getCategoryID(this.state.oldCat), newCategory);

                this.setState(state => ({
                    ...state,
                    oldCat: newCategory,
                    draftCat: cloneDeep(newCategory)
                }));
            } else {
                newCategory.index = this.props.categories.length;
                this.setState(state => ({
                    ...state,
                    oldCat: newCategory,
                    draftCat: cloneDeep(newCategory)
                }));
                this.props.addCategory(newCategory);
            }
            this.props.updatePage();
            await this.props.stage(true, true);

        }
    }

    private discardChanges(): void {
        this.setState(state => ({
            ...state,
            oldCat: undefined,
            draftCat: undefined
        }));
    }

    /**
     * Deletes category, makes sure indices inside object matches actual
     * indices after removing one category
     */
    private deleteCategory(): void {

        // todo fixme Not sure who wrote this - this needs checking for correctness. Does it definitely re-sync all
        // indices changes to DB? Surely the adjustments happen in the then, which occurs afterwards?

        if (this.state.oldCat && this.state.draftCat?.type !== "default") {
            this.props.removeCategory(this.state.oldCat);
            this.props.stage(true, true).then(() => {
                    if (this.state.oldCat && this.state.oldCat.index !== this.props.categories.length - 1) {
                        this.props.updatePage();
                        for (let j = this.state.oldCat.index; j < this.props.categories.length - 1; j++) {
                            const category = this.props.categories[j];
                            const id = this.props.getCategoryID(category);
                            category.index = j;
                            this.props.editCategory(id, category);
                        }
                    }
                    this.setState(state => ({
                        ...state,
                        oldCat: undefined,
                        draftCat: undefined
                    }));
                    this.props.updatePage();
                }
            );
        }
    }


    render(): React.ReactNode {

        return <div id="category-editor">
            <div id="category-sidebar">
                <div id="title">Categories</div>
                <div id="category-list">
                    {this.props.categories.map((cat, index) => <div
                        className={classNames("category-list-item", {
                            "cat-selected": isEqual(this.state.oldCat, cat)
                        })}
                        key={index}
                        onClick={this.selectCategory.bind(this, cat)}
                    >
                        {cat.name}
                    </div>)}
                </div>
                <button id="top-btn" onClick={this.newCategory.bind(this)}>New Category</button>
            </div>
            <div id="cat-edit-main">
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