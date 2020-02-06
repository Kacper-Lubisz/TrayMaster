import classNames from "classnames";
import {type} from "os";
import React from "react";
import {User} from "../core/Firebase";
import {Category, Warehouse} from "../core/WarehouseModel";

import "../styles/settings.scss";
import "./styles/_categoryeditor.scss";


interface CategoryEditorProps {
    categories: Category[];
    user: User;
    warehouse: Warehouse;
}


interface CategoryEditorState {
    catSelected: Category | null;
    catName: string;
    catShortName?: string;
    catLow: number;
    catHigh: number;
    catID: string;
}

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
            catLow: this.props.categories[0].lowStock,
            catHigh: this.props.categories[0].highStock,
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
            /**
             *TODO popup, choose continue with, without saving or cancel
             */
        } else {
            this.setState(state => ({
                ...state,
                catSelected: cat,
                catName: cat.name,
                catShortName: cat.shortName ? cat.shortName : "",
                catLow: cat.lowStock,
                catHigh: cat.highStock,
                catID: this.props.warehouse.getCategoryID(cat),
            }));
        }
    }

    /**
     * Creates the right-hand side of the screen
     * Displays content of categories and allows user to edit them
     * TODO delete should be disables if type is not "custom"
     */
    private editCategory(): any {
        return <div className="edit-category">
            <h2>Edit {this.state.catSelected?.name}</h2>
            <h4>Name</h4>
            <input type="text"
                   value={this.state.catName}
                   onChange={e => this.setState({...this.state, catName: e.target.value})}
            />
            <h4>Short Name</h4>
            <input type="text"
                   value={this.state.catShortName}
                   onChange={e => this.setState({...this.state, catShortName: e.target.value})}/>
            <h4>Low Stock Level</h4>
            <input type="number"
                   min="0"
                   max={this.state.catHigh}
                   value={this.state.catLow}
                   onChange={(e) => {
                       this.setState({...this.state, catLow: Number(e.target.value)});
                   }
                   }
            /> trays
            <h4>High Stock Level</h4>
            <input type="number"
                   min={this.state.catLow}
                   value={this.state.catHigh}
                   onChange={(e) => {
                       this.setState({...this.state, catHigh: Number(e.target.value)});
                   }
                   }
            /> trays
            <br/>
            <button
                onClick={() => this.deleteCategory()}>Delete Category
            </button>
            <button onClick={() => this.cancelCategory()}>Cancel</button>
            <button onClick={() => {
                if (this.checkIfCatChanged()) {
                    this.saveCategory();
                }
            }}>Save
            </button>

        </div>;
    }

    /**
     * Is called if user clicks button to add a new category
     */
    private newCategory(): void {
        /**
         * Open fields to add new category
         * Create new index??
         * Type should be "custom"
         */
        this.setState(state => ({
            ...state,
            catSelected: null,
            catName: "",
            catShortName: "",
            catLow: 0,
            catHigh: 100
        }));

    }

    /**
     * Checks if any of the fields in the currently displayed category has changed
     */
    checkIfCatChanged(): boolean {
        return this.state.catSelected?.name !== this.state.catName
            || this.state.catSelected.shortName !== this.state.catShortName
            || this.state.catSelected.lowStock !== this.state.catLow
            || this.state.catSelected.highStock !== this.state.catHigh;
    }

    /**
     *Saves changes to categories
     */
    private saveCategory(): void {
        /**
         * Check if name is same as another category
         */
        if (this.state.catSelected) {
            const editedCat = {
                index: this.state.catSelected.index,
                name: this.state.catName,
                shortName: this.state.catShortName ? this.state.catShortName : null,
                lowStock: this.state.catLow,
                highStock: this.state.catHigh,
                type: this.state.catSelected.type
            };
            this.props.warehouse.editCategory(this.state.catID, editedCat);
            this.setState(state => ({
                ...state,
                catSelected: editedCat
            }));
        } else {
            this.saveNewCategory();
        }
    }

    private saveNewCategory(): void {
        this.props.warehouse.addCategory({
            index: this.props.categories.length,
            name: this.state.catName,
            shortName: this.state.catShortName ? this.state.catShortName : null,
            lowStock: this.state.catLow,
            highStock: this.state.catHigh,
            type: "custom"
        });
        this.setState(state => ({
            ...state,
            catSelected: {
                index: this.props.categories.length,
                name: this.state.catName,
                shortName: this.state.catShortName ? this.state.catShortName : null,
                lowStock: this.state.catLow,
                highStock: this.state.catHigh,
                type: "custom"
            }
        }));
    }

    private cancelCategory(): void {
        console.log(this.props.categories);
        if (this.state.catSelected) {
            const catName = this.state.catSelected.name;
            const catShortName = this.state.catSelected.shortName ? this.state.catSelected.shortName : "";
            const catLow = this.state.catSelected.lowStock;
                const catHigh= this.state.catSelected.highStock;
            this.setState(state => ({
                ...state,
                catName: catName,
                catShortName: catShortName,
                catLow: catLow,
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
                        for (let j = this.state.catSelected.index; j < this.props.categories.length - 1; j++) {
                            console.log(j);
                            const category = this.props.categories[j];
                            const id = this.props.warehouse.getCategoryID(category);
                            category.index = j;
                            this.props.warehouse.editCategory(id, category);
                        }
                    }
                }
            );
        }
    }


    render(): React.ReactNode {

        return <div className="settings-setting">
            <div className="list-categories">
                {this.props.categories.map((cat: Category) => {
                        return <div className={classNames("category", {
                            "cat-selected": this.state.catSelected === cat
                        })}
                                    key={cat.name}><p
                            onClick={() => this.selectCategory(cat)}>{cat.name}</p>
                        </div>;
                    }
                )}
            </div>
            <div className="add-cat-btn">
                <button onClick={() => this.newCategory()}>Add New Category</button>
            </div>
            {this.editCategory()}
            <div>

            </div>
        </div>;
    }
}
