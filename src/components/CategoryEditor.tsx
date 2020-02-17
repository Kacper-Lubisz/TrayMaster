import {faInfoCircle} from "@fortawesome/free-solid-svg-icons";
import classNames from "classnames";
import {cloneDeep, isEqual} from "lodash";
import React from "react";
import {Dialog, DialogButtons, DialogTitle} from "../core/Dialog";
import {User} from "../core/Firebase";
import {Category, WarehouseModel} from "../core/WarehouseModel";

import "./styles/_categoryeditor.scss";


interface CategoryEditorProps {
    openDialog: (dialog: Dialog) => void;
    categories: Category[];
    user: User;

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

    private blankCat: Category = {
        index: -1,
        name: "",
        shortName: null,
        underStockThreshold: 0,
        overStockThreshold: 100,
        type: "custom"
    };

    constructor(props: CategoryEditorProps) {
        super(props);

        this.state = {
            oldCat: undefined,
            draftCat: undefined
        };
    }

    /**
     * Is called when user selects a category in the list
     * Changes state values to display corresponding category
     * in editor
     * @param cat
     */
    private selectCategory(cat: Category): void {
        if (this.unsavedChanges()) {
            // this.props.openDialog(buildUnsavedChangesDialog(
            //     this.saveCategory.bind(this),
            //     this.discardChanges.bind(this),
            //     this.selectCategory.bind(this, cat)
            // ));

            this.props.openDialog({
                closeOnDocumentClick: true,
                dialog: (close: () => void) => <EditCategoryDialog onDiscard={close}/>
            });
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

        if (this.state.draftCat) {
            return <>
                <div id="cat-edit-controls">
                    <h2>{this.state.oldCat ? `Edit ${this.state.oldCat.name}` : "New Category"}</h2>
                    <h3>Name</h3>
                    <input
                        type="text"
                        value={this.state.draftCat.name}
                        placeholder="Enter a name"
                        onChange={e => {
                            const newName = e.target.value;
                            this.setState(state => {
                                if (state.draftCat) {
                                    state.draftCat.name = newName;
                                }
                                return state;
                            });
                        }}
                    />
                    <h3>Short Name</h3>
                    <input
                        type="text"
                        value={this.state.draftCat?.shortName ?? ""}
                        onChange={e => {
                            const newShortName = e.target.value;
                            this.setState(state => {
                                if (state.draftCat) {
                                    state.draftCat.shortName = newShortName;
                                }
                                return state;
                            });
                        }}
                    />
                    <button onClick={_ => {
                        this.setState(state => {
                            if (state.draftCat) {
                                state.draftCat.shortName = state.draftCat.name;
                            }
                            return state;
                        });
                    }}>Copy From Name
                    </button>
                    <h3>Under-Stock Threshold</h3>
                    <input
                        type="number"
                        min="0"
                        max={this.state.draftCat.overStockThreshold ?? undefined}
                        value={this.state.draftCat.underStockThreshold ?? undefined}
                        placeholder={"No Understock Threshold Specified"}
                        onChange={e => {
                            const newUnderStock = e.target.value.length === 0 ? null
                                                                              : Number(e.target.value);
                            this.setState(state => {
                                if (state.draftCat) {
                                    state.draftCat.underStockThreshold = newUnderStock;
                                }
                                return state;
                            });
                        }}
                    /> trays
                    <h3>Over-Stock Threshold</h3>
                    <input
                        type="number"
                        min={this.state.draftCat.underStockThreshold ?? undefined}
                        value={this.state.draftCat.overStockThreshold ?? undefined}
                        placeholder={"No Overstock Threshold Specified"}
                        onChange={e => {
                            const newOverstock = e.target.value.length === 0 ? null
                                                                             : Number(e.target.value);
                            this.setState(state => {
                                if (state.draftCat) {
                                    state.draftCat.overStockThreshold = newOverstock;
                                }
                                return state;
                            });
                        }}
                    /> trays
                </div>
                <div id="cat-edit-bottom-btns">
                    <div>
                        <button
                            disabled={this.state.oldCat?.type === "default"}
                            onClick={this.deleteCategory.bind(this)}
                        >Delete Category
                        </button>
                        {this.state.oldCat?.type === "default" ? <div>You cannot delete a default category.</div>
                                                               : null}
                    </div>
                    <div>
                        <button
                            onClick={this.discardChanges.bind(this)}
                        >Cancel
                        </button>
                        <button
                            disabled={!this.unsavedChanges()}
                            onClick={this.unsavedChanges() ? this.saveCategory.bind(this) : undefined}
                        >Save
                        </button>
                    </div>
                </div>
            </>;
        } else {
            return <div>Select a category on the left, or add a new one!</div>;
        }

    }

    /**
     * Is called if user clicks button to add a new category
     */
    private newCategory(): void {

        if (this.unsavedChanges()) {
            // this.props.openDialog(buildUnsavedChangesDialog(
            //     this.saveCategory.bind(this),
            //     this.discardChanges.bind(this),
            //     this.newCategory.bind(this)
            // ));
            this.props.openDialog({
                closeOnDocumentClick: true,
                dialog: (close: () => void) => <EditCategoryDialog onDiscard={close}/>
            });
        } else {
            this.setState(state => ({
                ...state,
                oldCat: undefined,
                draftCat: cloneDeep(this.blankCat)
            }));
        }
    }

    /**
     * Checks if any of the fields in the currently displayed category has changed
     */
    unsavedChanges(): boolean {
        return !isEqual(this.state.draftCat, this.blankCat) && !isEqual(this.state.oldCat, this.state.draftCat);
    }

    /**
     *Saves changes to categories, doesn't let user save category with empty name
     */
    private saveCategory(): void {
        if (this.state.draftCat) {

            if (this.state.oldCat) {
                this.props.editCategory(this.props.getCategoryID(this.state.oldCat), this.state.draftCat);
            } else {
                // This is pretty bad practice, but we'll re-render with updatePage() anyway
                // eslint-disable-next-line react/no-direct-mutation-state
                this.state.draftCat.index = this.props.categories.length;
                this.props.addCategory(this.state.draftCat);
            }

            this.setState(state => ({
                ...state,
                oldCat: this.state.draftCat,
                draftCat: cloneDeep(this.state.draftCat)
            }));
            this.props.updatePage();

        }
    }

    private discardChanges(): void {
        this.setState(state => ({
            ...state,
            oldCat: undefined,
            draftCat: this.state.oldCat ? cloneDeep(this.state.oldCat) : undefined
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
                <div id="category-list">
                    {this.props.categories.map(cat => <div
                        className={classNames("category-list-item", {
                            "cat-selected": isEqual(this.state.oldCat, cat)
                        })}
                        key={cat.name}>
                        <p onClick={this.selectCategory.bind(this, cat)}>{cat.name}</p>
                    </div>)}
                </div>
                <button id="add-cat-btn" onClick={this.newCategory.bind(this)}>Add Category</button>

            </div>
            <div id="cat-edit-main">
                {this.renderEditPanel()}
            </div>
        </div>;
    }
}

interface EditCategoryDialogProps {
    onDiscard: () => void;
}

/**
 *Dialog to notify user of something
 */
class EditCategoryDialog extends React.Component<EditCategoryDialogProps, any> {

    render(): React.ReactElement {
        return <>
            <DialogTitle title="Unsaved Changes" iconProps={{icon: faInfoCircle, color: "blue"}}/>
            <div className="dialogContent">
                <h2>Please save or discard your current changes before proceeding</h2>
                <DialogButtons buttons={[
                    {name: "OK", buttonProps: {onClick: this.props.onDiscard,}}
                ]}/>
            </div>
        </>;
    }
}

// export function buildUnsavedChangesDialog(
//     save: () => void,
//     discard: () => void,
//     then: () => void,
//     title = "Unsaved Changes",
//     message = "Please save or discard your current changes before proceeding",
// ): Dialog {
//     return {
//         closeOnDocumentClick: true,
//         dialog: (close: () => void) => <>
//             <DialogTitle title={title} iconProps={{icon: faInfoCircle, color: "blue"}}/>
//             <div className="dialogContent">
//                 <p className="errorDialogContent">{message}</p>
//                 <DialogButtons buttons={[
//                     {
//                         name: "Save", buttonProps: {
//                             onClick: () => {
//                                 console.log("saving")
//                                 save();
//                                 console.log("closing")
//                                 close();
//                                 console.log("continuing")
//                                 then();
//                             }
//                         }
//                     },
//                     {
//                         name: "Don't Save", buttonProps: {
//                             onClick: () => {
//                                 discard();
//                                 close();
//                                 then();
//                             }
//                         }
//                     },
//                     {name: "Cancel", buttonProps: {onClick: close}}
//                 ]}/>
//             </div>
//         </>
//     };
// }
