import classNames from "classnames";
import React from "react";
import {User} from "../core/Firebase";
import {Category} from "../core/WarehouseModel";
import "./styles/_categoryeditor.scss";


interface CategoryEditorProps {
    categories: Category[];
    user: User;
}


interface CategoryEditorState {
    catSelected?: Category;
    isCatSelected: boolean;
    showEditCat: boolean;
    addCategory: boolean;
}

export class CategoryEditor extends React.Component<CategoryEditorProps, CategoryEditorState> {

    constructor(props: CategoryEditorProps) {
        super(props);

        this.state = {
            isCatSelected: false,
            showEditCat: false,
            addCategory: false,
        };
    }

    private selectCategory(cat: Category): void {
        this.setState({catSelected: cat});
    }


    private deleteCategory(): void {
        console.log(this.state.catSelected);
        /**
         *Check if any tray is using category
         * If no:
         * Display dialog asking "Are you sure you want to delete?"
         * If yes:
         * Let user know
         *      option to cancel
         *      option to change all to other category
         *      else they are left with no category
         */
    }

    private editCategory(): any {

        /**
         * Change
         *      name of category
         *      short name??
         *      low stock warning
         * everything should be returned
         */
        return <div>
            <p>Pressed Edit</p>
        </div>;
    }

    private addCategory(): void {
        /**
         * Open fields to add new category
         */
    }

//delete and edit should only be clickable when a category is chosen
    render(): React.ReactNode {

        return <div className="categoryEditor">
            <div className="listCategories">
                {this.props.categories.map((cat: Category) => {
                        return <div className="category" key={cat.name}><p
                            onClick={() => this.selectCategory(cat)}>{cat.name}</p>
                        </div>;
                    }
                )}
            </div>
            <div className="cat-editor-btns">
                <button
                    className={classNames("cat-editor-btn", {
                        "cat-selected": this.state.catSelected
                    })} onClick={() => this.setState({...this.state, showEditCat: true})}>
                    Edit
                </button>
                <button className={classNames("cat-editor-btn", {
                    "cat-selected": this.state.catSelected
                })} onClick={() => this.deleteCategory()}>Delete
                </button>
                <button onClick={() => this.addCategory()}>Add Category</button>
            </div>
            <div className="editCategory">
                {this.state.showEditCat &&
                this.editCategory()}
            </div>
            <div>

            </div>
        </div>;
    }
}
