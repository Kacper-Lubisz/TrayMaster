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
        understockThreshold: 0,
        overstockThreshold: 100,
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
            this.props.openDialog({
                closeOnDocumentClick: true,
                dialog: (close: () => void) => {
                    return <EditCategoryDialog
                        onDiscard={close}
                        message="Please Save or Cancel your changes first"
                    />;
                }
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
                    <input type="text"
                           value={this.state.draftCat.name}
                           placeholder="Enter a name"
                           onChange={e => {
                               const newName = e.target.value;
                               this.setState(state => {
                                   if(state.draftCat){
                                       state.draftCat.name = newName;
                                   }
                                   return state;
                               });
                           }}
                    />
                    <h3>Short Name</h3>
                    <input type="text"
                           value={this.state.draftCat?.shortName ?? ""}
                        // onChange={e => this.setState({...this.state, catShortName: e.target.value})}
                    />
                    {/*<button onClick={() => this.setState(state => ({*/}
                    {/*    catShortName: state.catName*/}
                    {/*}))}>Copy From Name*/}
                    {/*</button>*/}
                    <h3>Low Stock Level</h3>
                    <input type="number"
                           min="0"
                           max={this.state.draftCat.overstockThreshold}
                           value={this.state.draftCat.understockThreshold}
                        // onChange={(e) => {
                        //     this.setState({...this.state, catLow: Number(e.target.value)});
                        // }
                        // }
                    /> trays
                    <h3>High Stock Level</h3>
                    <input type="number"
                           min={this.state.draftCat.understockThreshold}
                           value={this.state.draftCat.overstockThreshold}
                        // onChange={(e) => {
                        //     this.setState({...this.state, catHigh: Number(e.target.value)});
                        // }
                        // }
                    /> trays
                </div>
                <div id="cat-edit-bottom-btns">
                    <div>
                        <button disabled={this.state.oldCat?.type === "default"}
                                onClick={() => this.state.oldCat?.type === "default" ? null
                                                                                     : this.deleteCategory()}>Delete
                            Category
                        </button>
                        {this.state.oldCat?.type === "default" ? <div>You cannot delete a default category.</div>
                                                               : null}
                    </div>
                    <div>
                        <button onClick={() => this.cancelCategory()}>Cancel</button>
                        <button disabled={!this.unsavedChanges()}
                                onClick={() => this.unsavedChanges() ? this.saveCategory() : null}
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
            this.props.openDialog({
                closeOnDocumentClick: true,
                dialog: (close: () => void) => {
                    return <EditCategoryDialog
                        onDiscard={close}
                        message="Please Save or Cancel your changes first"
                    />;
                }
            });
        } else {
            this.setState(state => {
                return {
                    ...state,
                    oldCat: undefined,
                    draftCat: cloneDeep(this.blankCat)
                };
            });
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

    private cancelCategory(): void {
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

        if (this.state.oldCat) {
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
                    {this.props.categories.map((cat: Category) => {
                            return <div
                                className={
                                    classNames("category-list-item", {
                                        "cat-selected": isEqual(this.state.oldCat, cat)
                                    })}
                                key={cat.name}>
                                <p onClick={() => this.selectCategory(cat)}>{cat.name}</p>
                            </div>;
                        }
                    )}
                </div>
                <button id="add-cat-btn" onClick={() => this.newCategory()}>Add Category</button>

            </div>
            <div id="cat-edit-main">
                {this.renderEditPanel()}
            </div>
        </div>;
    }
}

interface EditCategoryDialogProps {
    onDiscard: () => void;
    message: string;
}

/**
 *Dialog to notify user of something
 */
class EditCategoryDialog extends React.Component<EditCategoryDialogProps, any> {

    render(): React.ReactElement {
        return <>
            <DialogTitle title={this.props.message}/>
            <div className="dialogContent">
                <DialogButtons buttons={[
                    {
                        name: "OK", buttonProps: {
                            onClick: this.props.onDiscard,
                        }
                    }
                ]}/>
            </div>
        </>;
    }
}
