import classNames from "classnames";
import React from "react";
import {User} from "../core/Firebase";
import {Category} from "../core/WarehouseModel";

import "../styles/settings.scss";
import "./styles/_categoryeditor.scss";


interface CategoryEditorProps {
    categories: Category[];
    user: User;
}


interface CategoryEditorState {
    catSelected: Category;
    showEditCat: boolean;
    addCategory: boolean;
    catName: string;
    catShortName?: string;
    catLow: number;
    catHigh: number;
    newCat: boolean;
}

/**
 * This class displays all categories in the warehouse, lets the user
 * edit and delete existing categories, and add new ones
 */

export class CategoryEditor extends React.Component<CategoryEditorProps, CategoryEditorState> {

    constructor(props: CategoryEditorProps) {
        super(props);

        this.state = {
            showEditCat: true,
            addCategory: false,
            catSelected: this.props.categories[0],
            catName: this.props.categories[0].name,
            catShortName: this.props.categories[0].shortName ? this.props.categories[0].shortName : undefined,
            catLow: 0,
            catHigh: 20,
            newCat: false
        };
    }

    /**
     * Is called when user selects a category in the list
     * Changes state values to display corresponding category
     * in editor
     * @param cat
     */
    private selectCategory(cat: Category): void {
        /**
         * TODO change low/high stock to db when added there
         */
        if (this.checkIfCatChanged()) {
            //popup, choose continue with, without saving or cancel
        } else {
            this.setState(state => ({
                ...state,
                catSelected: cat,
                showEditCat: true,
                catName: cat.name,
                catShortName: cat.shortName ? cat.shortName : "",
                catLow: 4,
                catHigh: 20
            }));
        }
    }

    /**
     * Creates the right-hand side of the screen
     * Displays content of categories and allows user to edit them
     */
    private editCategory(): any {
        return <div className="edit-category">
            <h2>Edit {this.state.catSelected.name}</h2>
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

            <button className="plus-minus-btns"
                    onClick={() => {
                        if (this.state.catLow < this.state.catHigh) {
                            this.setState(state => ({
                                ...state, catLow: (state.catLow + 1)
                            }));
                        }
                    }}>
                +
            </button>
            <p>{this.state.catLow} trays</p>
            <button className="plus-minus-btns"
                    onClick={() => {
                        if (this.state.catLow > 0) {
                            this.setState(state => ({
                                ...state,
                                catLow: (state.catLow - 1)
                            }));
                        }
                    }}>
                -
            </button>

            <h4>High Stock Level</h4>
            <button className="plus-minus-btns"
                    onClick={() => this.setState(state => ({
                        ...state, catHigh: (state.catHigh + 1)
                    }))}>
                +
            </button>
            <p>{this.state.catHigh} trays</p>
            <button className="plus-minus-btns"
                    onClick={() => {
                        if (this.state.catHigh > this.state.catLow) {
                            this.setState(state => ({
                                ...state,
                                catHigh: (state.catHigh - 1)
                            }));
                        }
                    }}>
                -
            </button>
            <br/>
            <button>Delete Category</button>
            <button>Cancel</button>
            <button onClick={() => this.saveCategory.bind(this)}>Save</button>

        </div>;
    }

    /**
     * Is called if user clicks button to add a new category
     */
    private addCategory(): void {
        /**
         * Open fields to add new category
         * Create new index??
         */
        this.setState(state => ({
            ...state,
            newCat: true,
            catName: "",
            catShortName: "",
            catLow: 0,
            catHigh: 3
        }));
    }

    /**
     * Checks if any of the fields in the currently displayed category has changed
     */
    checkIfCatChanged(): boolean {
        /**
         * change low and high to db
         */
        if (this.state.catSelected.name !== this.state.catName
            || this.state.catSelected.shortName !== this.state.catShortName
            || this.state.catLow !== this.state.catLow
            || this.state.catHigh !== this.state.catHigh) {
            return true;
        } else {
            return false;
        }

    }

    /**
     *Saves changes to categories
     */
    private saveCategory(): void {
        if (this.checkIfCatChanged()) {
            //save values to db
        }
    }


    render(): React.ReactNode {

        return <div className="settings-setting">
            <div className="list-categories">
                {this.props.categories.map((cat: Category) => {
                        return <div className="category" key={cat.name}><p
                            onClick={() => this.selectCategory(cat)}>{cat.name}</p>
                        </div>;
                    }
                )}
            </div>
            <div className="cat-editor-btns">
                <button className="add-cat-btn" onClick={() => this.addCategory.bind(this)}>Add Category</button>
            </div>
            {this.editCategory()}
            <div>

            </div>
        </div>;
    }
}
