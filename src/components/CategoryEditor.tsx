import React from "react";
import {Dialog, DialogButtons, DialogTitle} from "../core/Dialog";
import {User} from "../core/Firebase";
import {Category, Warehouse} from "../core/WarehouseModel";

import "./styles/_categoryeditor.scss";


interface CategoryEditorProps {
    openDialog: (dialog: Dialog) => void;
    categories: Category[];
    user: User;
    warehouse: Warehouse;
    updatePage: () => void;
}


interface CategoryEditorState {
    catSelected: Category | null;
    catName: string;
    catShortName?: string;
    understockThreshold: number;
    overstockThreshold: number;
    catID: string;
}

type CategoryField = "name" | "shortName" | "understockThreshold" | "overstockThreshold";

/**
 * This class displays all categories in the warehouse, lets the user
 * edit and delete existing categories, and add new ones
 */

export class CategoryEditor extends React.Component<CategoryEditorProps, CategoryEditorState> {

    constructor(props: CategoryEditorProps) {
        super(props);

        this.state = {
            catSelected: this.props.categories[0],
            catName: this.props.categories[0].name,
            catShortName: this.props.categories[0].shortName ? this.props.categories[0].shortName : undefined,
            understockThreshold: this.props.categories[0].understockThreshold,
            overstockThreshold: this.props.categories[0].overstockThreshold,
            catID: this.props.warehouse.getCategoryID(this.props.categories[0]),
        };
    }

    /**
     * Is called when user selects a category in the list
     * Changes state values to display corresponding category
     * in editor
     * @param cat
     */
    private selectCategory(cat: Category): void {
        if (this.checkIfCatChanged()) {
            this.props.openDialog({
                closeOnDocumentClick: true,
                dialog: (close: () => void) => {
                    return <EditCategoryDialog
                        onDiscard={close}
                        message="Please Save or Cancel"
                    />;
                }
            });
        } else {
            this.changeCategory(cat);
        }
    }

    private changeCategory(cat: Category): void {
        this.setState(state => ({
            ...state,
            catSelected: cat,
            catName: cat.name,
            catShortName: cat.shortName ? cat.shortName : "",
            understockThreshold: cat.understockThreshold,
            overstockThreshold: cat.overstockThreshold,
            catID: this.props.warehouse.getCategoryID(cat),
        }));
    }

    /**
     * Creates the right-hand side of the screen
     * Displays content of categories and allows user to edit them
     */
    private renderEditPanel(): any {
        return <>
            <div id="cat-edit-controls">
                <h2>{this.state.catSelected ? `Edit ${this.state.catSelected.name}` : "New Category"}</h2>
                <h3>Name</h3>
                <input type="text"
                       value={this.state.catName}
                       onChange={e => this.inputChanged("name",e.target.value)}
                />
                <h3>Short Name</h3>
                <input type="text"
                       value={this.state.catShortName}
                       onChange={e => this.inputChanged("shortName",e.target.value)}
                />
                <button onClick={() => this.setState(state => ({
                    catShortName: state.catName
                }))}>Copy From Name
                </button>
                <h3>Low Stock Level</h3>
                <input type="number"
                       min="0"
                       max={this.state.overstockThreshold}
                       value={this.state.understockThreshold}
                       onChange={(e) => {
                           this.inputChanged("understockThreshold",e.target.value)
                       }
                       }
                /> trays
                <h3>High Stock Level</h3>
                <input type="number"
                       min={this.state.understockThreshold}
                       value={this.state.overstockThreshold}
                       onChange={(e) => {
                           this.inputChanged("overstockThreshold",e.target.value)
                       }
                       }
                /> trays
            </div>
            <div id="cat-edit-bottom-btns">
                <div>
                    <button disabled={this.state.catSelected?.type === "default" ||
                    this.state.catSelected === null}
                            onClick={() => this.deleteCategory()}>Delete Category
                    </button>
                </div>
                <div>
                    <button onClick={() => this.cancelCategory()}>Cancel</button>
                    <button onClick={() => {
                        if (this.checkIfCatChanged()) {
                            this.saveCategory();
                        }
                    }}>Save
                    </button>
                </div>
            </div>
        </>;
    }

    private inputChanged(categoryField: CategoryField, newValue: string): void {
        if(categoryField == "name"){
            this.setState({...this.state, catName: newValue})
        }
        if(categoryField == "shortName"){
            this.setState({...this.state, catName: newValue})

        }
        if(categoryField == "understockThreshold"){
            this.setState({...this.state, understockThreshold: Number(newValue)})

        }
        if(categoryField == "overstockThreshold"){
            this.setState({...this.state, overstockThreshold: Number(newValue)})

        }
    }

    /**
     * Is called if user clicks button to add a new category
     */
    private newCategory(): void {
        this.setState(state => ({
            ...state,
            catSelected: null,
            catName: "",
            catShortName: "",
            understockThreshold: 0,
            overstockThreshold: 100
        }));

    }

    /**
     * Checks if any of the fields in the currently displayed category has changed
     */
    checkIfCatChanged(): boolean {
        return this.state.catSelected?.name !== this.state.catName
            || this.state.catSelected.shortName !== this.state.catShortName
            || this.state.catSelected.understockThreshold !== this.state.understockThreshold
            || this.state.catSelected.overstockThreshold !== this.state.overstockThreshold;
    }

    /**
     *Saves changes to categories, doesn't let user save category with empty name
     */
    private saveCategory(): void {
        if (this.state.catName === "") {
            this.props.openDialog({
                closeOnDocumentClick: true,
                dialog: (close: () => void) => {
                    return <EditCategoryDialog
                        onDiscard={close}
                        message="Please Enter a Category Name"
                    />;
                }
            });
        } else if (this.state.catSelected) {
            const editedCat = {
                index: this.state.catSelected.index,
                name: this.state.catName,
                shortName: this.state.catShortName ? this.state.catShortName : null,
                understockThreshold: this.state.understockThreshold,
                overstockThreshold: this.state.overstockThreshold,
                type: this.state.catSelected.type
            };
            this.props.warehouse.editCategory(this.state.catID, editedCat);
            this.setState(state => ({
                ...state,
                catSelected: editedCat
            }));
            this.props.updatePage();

        } else {
            this.saveNewCategory();
        }
    }

    private saveNewCategory(): void {
        this.props.warehouse.addCategory({
            index: this.props.categories.length,
            name: this.state.catName,
            shortName: this.state.catShortName ? this.state.catShortName : null,
            understockThreshold: this.state.understockThreshold,
            overstockThreshold: this.state.overstockThreshold,
            type: "custom"
        });
        this.setState(state => ({
            ...state,
            catSelected: {
                index: this.props.categories.length,
                name: this.state.catName,
                shortName: this.state.catShortName ? this.state.catShortName : null,
                understockThreshold: this.state.understockThreshold,
                overstockThreshold: this.state.overstockThreshold,
                type: "custom"
            }
        }));
        this.props.updatePage();
    }

    private cancelCategory(): void {
        if (this.state.catSelected) {
            const catName = this.state.catSelected.name;
            const catShortName = this.state.catSelected.shortName ? this.state.catSelected.shortName : "";
            const understockThreshold = this.state.catSelected.understockThreshold;
            const catHigh = this.state.catSelected.overstockThreshold;
            this.setState(state => ({
                ...state,
                catName: catName,
                catShortName: catShortName,
                understockThreshold: understockThreshold,
                catHigh: catHigh
            }));
        } else {
            this.newCategory();
        }
    }


    /**
     * Deletes category, makes sure indices inside object matches actual
     * indices after removing one category
     */
    private deleteCategory(): void {
        if (this.state.catSelected) {
            this.props.warehouse.removeCategory(this.state.catSelected);
            this.props.warehouse.stage(true, true).then(() => {
                    if (this.state.catSelected && this.state.catSelected.index !== this.props.categories.length - 1) {
                        this.props.updatePage();
                        for (let j = this.state.catSelected.index; j < this.props.categories.length - 1; j++) {
                            const category = this.props.categories[j];
                            const id = this.props.warehouse.getCategoryID(category);
                            category.index = j;
                            this.props.warehouse.editCategory(id, category);
                        }
                    }
                    this.setState(state => ({
                        ...state,
                        catSelected: this.props.categories[0]
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
                            return <div className="category-list-item" key={cat.name}><p
                                onClick={() => this.selectCategory(cat)}>{cat.name}</p>
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
