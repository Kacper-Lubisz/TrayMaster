import classNames from "classnames";
import React from "react";
import {Category, Warehouse} from "../core/WarehouseModel";
import {SearchQuery, SearchResults} from "../pages/SearchPage";

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
        let newCategories;
        if (this.props.search.query.categories instanceof Set) {
            newCategories = this.props.search.query.categories;
        } else {
            newCategories = new Set<Category>();
        }

        if (newCategories.has(cat)) {
            newCategories.delete(cat);
        } else {
            newCategories.add(cat);
        }
        this.props.setQuery({
            ...this.props.search.query,
            categories: newCategories.size ? newCategories : null
        });

    }

    render(): React.ReactNode {

        const allCategories = this.props.warehouse?.categories?.sort((a, b) =>
            a.name < b.name ? -1 : 1
        );

        const searchCategories = this.props.search.query.categories instanceof Set ? this.props.search.query.categories
                                                                                   : new Set<Category>();

        if (allCategories) {

            const groups = new Map<string, Category[]>();

            allCategories.forEach(cat => {
                const key = cat.name.charAt(0).toUpperCase();

                if (groups.has(key)) {
                    groups.get(key)?.push(cat);
                } else {
                    groups.set(key, [cat]);
                }
            });

            return <div id="searchPanel">
                {/*<div className="categoryGroup" key={-1}>*/}
                {/*<h1 className="categoryGroupTitle">{"~"}</h1>*/}
                {/*<div className="categoryGroupCategories">*/}
                {/*    <button*/}
                {/*        className={classNames("searchPanelButton", {*/}
                {/*            // "selected": searchCategories.has(cat)*/}
                {/*        })}*/}
                {/*        // onClick={}*/}
                {/*    >{"~"}*/}
                {/*    </button>*/}

                {/*</div>*/}
                {/*</div>*/}
                {Array.from(groups.keys()).sort((a, b) =>
                    a < b ? -1 : 1
                ).map((group, i) =>
                    <div
                        className="categoryGroup"
                        key={i}
                    >
                        <h1 className="categoryGroupTitle">{group}</h1>
                        <div className="categoryGroupCategories"
                        >{groups.get(group)?.map(cat => <button
                            key={cat.name}
                            className={classNames("searchPanelButton", {
                                "selected": searchCategories.has(cat)
                            })}
                            onClick={this.toggleCategory.bind(this, cat)}>{cat.name}</button>)
                        }</div>
                    </div>
                )}</div>;
        }
    }

}