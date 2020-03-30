import classNames from "classnames";
import React from "react";
import {Category, Warehouse} from "../core/WarehouseModel";
import {FindQuery, FindResults} from "../pages/FindPage";
import "./styles/_findpanel.scss";

export type PanelState = "category" | "weight" | "expiry";

interface FindPanelProps {
    warehouse?: Warehouse;
    panelState: PanelState;
    setPanelState: (state: PanelState) => void;
    setQuery: (query: FindQuery) => void;
    find: FindResults;
}

export class FindPanel extends React.Component<FindPanelProps> {

    private toggleCategory(cat: Category): void {
        let newCategories;
        if (this.props.find.query.categories instanceof Set) {
            newCategories = this.props.find.query.categories;
        } else {
            newCategories = new Set<Category>();
        }

        if (newCategories.has(cat)) {
            newCategories.delete(cat);
        } else {
            newCategories.add(cat);
        }
        this.props.setQuery({
            ...this.props.find.query,
            categories: newCategories.size ? newCategories : null
        });

    }

    render(): React.ReactNode {

        const allCategories = this.props.warehouse?.categories?.sort((a, b) =>
            a.name < b.name ? -1 : 1
        );

        const findCategories = this.props.find.query.categories instanceof Set ? this.props.find.query.categories
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

            return <div id="findPanel">
                <h2>Categories</h2>
                <div id="cat-table">
                    {Array.from(groups.keys()).sort((a, b) =>
                        a < b ? -1 : 1
                    ).map((group, i) =>
                        <div
                            className="categoryGroup"
                            key={i}
                        >
                            <div className="categoryGroupTitle"><span>{group}</span></div>
                            <div className="categoryGroupCategories"
                            >{groups.get(group)?.map((cat, index) => <button
                                key={index}
                                className={classNames({
                                    "selected": findCategories.has(cat)
                                })}
                                onClick={(e) => {
                                    this.toggleCategory(cat);
                                    e.currentTarget.blur();
                                }}>{cat.shortName ?? cat.name}</button>)
                            }</div>
                        </div>
                    )}
                </div>
            </div>;
        }
    }

}