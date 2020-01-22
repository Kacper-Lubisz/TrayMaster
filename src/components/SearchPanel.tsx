import React from "react";
import {Category, Warehouse} from "../core/WarehouseModel";
import {SearchQuery, SearchResults} from "../pages/SearchPage";
import classNames from "classnames";

export type PanelState = "category" | "weight" | "expiry";

interface SearchPanelProps {
    warehouse?: Warehouse;
    panelState: PanelState;
    setPanelState: (state: PanelState) => void;
    setQuery: (query: SearchQuery) => void;
    search: SearchResults;
}

export class SearchPanel extends React.Component<SearchPanelProps> {

    private toggleCategory(cat: Category): void {
        if (this.props.search.query.categories instanceof Set) {
            const newCategories = this.props.search.query.categories;
            if (newCategories.has(cat)) {
                newCategories.delete(cat);
            } else {
                newCategories.add(cat);
            }
            this.props.setQuery({
                ...this.props.search.query,
                categories: newCategories
            });
        }
    }

    private renderCategoryOptions(): React.ReactNode {

        const allCategories = this.props.warehouse?.categories?.sort((a, b) =>
            a.name < b.name ? -1 : 1
        );

        const searchCategories = this.props.search.query.categories instanceof Set ? this.props.search.query.categories
                                                                                   : new Set<Category>();

        if (allCategories) {
            return allCategories.map(cat => {
                return <button key={cat.name}
                               style={{backgroundColor: searchCategories.has(cat) ? "red" : "transparent"}}
                               className={classNames("searchPanelButton", {
                                   "selected": searchCategories.has(cat)
                               })}
                               onClick={this.toggleCategory.bind(this, cat)}>{cat.name}</button>;
            });
        }
    }


    render(): React.ReactNode {
        // return DOM elements using button structures
        return (
            <div id="searchPanel">
                This is the side panel fellas. keyboardState is "{this.props.panelState}"
                <br/>
                <button onClick={() => this.props.setPanelState("category")}>Category</button>
                <button onClick={() => this.props.setPanelState("weight")}>Weight</button>
                <br/><br/>
                {this.renderCategoryOptions()}
            </div>
        );
    }
}