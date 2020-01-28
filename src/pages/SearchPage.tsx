import {faArrowLeft as arrowLeft, faTimes as cross} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {LoadingSpinner} from "../components/LoadingSpinner";
import {PanelState, SearchPanel} from "../components/SearchPanel";
import {Category, Tray, Warehouse} from "../core/WarehouseModel";
import "../styles/search.scss";
import {getExpiryColor} from "../utils/getExpiryColor";
import {getTextColorForBackground} from "../utils/getTextColorForBackground";


export enum SortBy {
    expiry = "expiry",
    category = "category",
    weight = "weight",
    location = "location",
    none = "none"
}

export interface SortQueryOptions {
    orderAscending: boolean;
    type: SortBy;
}

type CategoryQueryOptions = Set<Category> | "set" | "unset" | null;

/**
 * Defines the search queries that can be run on the warehouse
 * todo fixme document this properly
 */
export interface SearchQuery {
    /** either a Set<Category>, or whether the category is 'set' or 'unset' */
    categories: CategoryQueryOptions;

    /** either a weight range, or whether the weight is 'set' or 'unset' */
    weight: ({ from: number; to: number } | "set" | "unset") | null;

    /** a substring to look for in tray comments */
    commentSubstring: string | null;

    /** whether to include the shelves designated as picking areas in results */
    excludePickingArea: boolean;

    /** the property to sort by and whether to sort ascending or descending */
    sort: SortQueryOptions;
}

export interface SearchResults {
    query: SearchQuery;
    results: null | Tray[];
}

interface SearchPageProps {
    warehouse?: Warehouse;
    search: SearchResults;
    setQuery: (query: SearchQuery) => void;
}

interface SearchPageState {
    panelState: PanelState;
}

class SearchPage extends React.Component<SearchPageProps & RouteComponentProps, SearchPageState> {

    constructor(props: SearchPageProps & RouteComponentProps) {
        super(props);

        this.state = {
            panelState: "category"
        };

    }

    /**
     * This method resets the current search query
     */
    private clearQuery(): void {
        this.props.setQuery({
            commentSubstring: null,
            excludePickingArea: true,
            categories: null,
            sort: {type: SortBy.none, orderAscending: true},
            weight: null
        });
    }

    render(): React.ReactNode {
        return <div id="searchPage">
            <div id="leftPanel">
                <div id="topPanel">
                    <div id="sentenceL">
                        <FontAwesomeIcon icon={arrowLeft} onClick={() => this.props.history.goBack()}/>
                    </div>
                    <div id="sentenceBox">
                        {this.renderSearchSentence()}
                        <FontAwesomeIcon icon={cross} onClick={this.clearQuery.bind(this)}/>
                    </div>
                    <div id="sentenceR">
                        <button onClick={() => this.props.history.push("/menu")}>Menu</button>
                    </div>
                </div>
                <div id="searchResults">{this.renderSearchResults()}</div>
            </div>
            <SearchPanel panelState={this.state.panelState} setPanelState={this.updatePanel.bind(this)}
                         search={this.props.search} warehouse={this.props.warehouse}
                         setQuery={this.props.setQuery}/>
        </div>;
    }

    private updatePanel(panelState: PanelState): void {
        this.setState(state => ({
            ...state,
            panelState: panelState
        }));
    }

    private renderSearchSentence(): React.ReactNode {

        const categories: CategoryQueryOptions = this.props.search.query?.categories ?? null;
        const weight = this.props.search.query.weight;
        const sortBy = this.props.search.query.sort;

        const catList = (() => {
            if (categories === null) {
                return [];
            } else if (categories instanceof Set) {
                return Array.from(categories.keys()).map(cat => cat.name);
            } else if (categories === "set") {
                return ["Any Set"];
            } else { // unset
                return ["Unset"];
            }
        })();

        const filterString = (() => {
            const len = catList.length;
            if (len > 1) {
                return catList.sort().map((c, i) => {
                    const append = (() => {
                        if (i === catList.length - 2) {
                            return ", and ";
                        } else if (i !== catList.length - 1) {
                            return ", ";
                        }
                        return "";
                    })();
                    return c.concat(append);
                });
            } else if (len === 1) {
                return catList[0];
            } else {
                return "Any category";
            }
        })();

        const weightString = (() => {
            if (typeof weight === "object" && weight) {
                return `between ${weight.from} and ${weight.to} kg`;
            } else if (weight === "set") {
                return "without a set weight value";
            } else if (weight === "unset") {
                return "with any set weight value";
            } else { // null
                return "with any weight value";
            }
        })();

        const expiryString = `sorted by ${SortBy[sortBy.type]} ${sortBy.orderAscending ? "ascending" : "descending"}`;

        return <span id="searchSentence">
            <span className="searchField" onClick={() => this.updatePanel("category")}>
                {filterString}
            </span>; <span className="searchField" onClick={() => this.updatePanel("weight")}>
                {weightString}
            </span>; <span id="searchSort" className="searchField">
                {expiryString}
            </span>.
        </span>;
    }

    private renderSearchResults(): React.ReactNode {
        const expiryColorMode = this.props.warehouse?.expiryColorMode ?? "warehouse";
        if (this.props.search?.results && this.props.search.results.length !== 0) {
            return <table>
                <thead>
                <tr>
                    <th>Category</th>
                    <th>Expiry</th>
                    <th>Weight</th>
                    <th>Location</th>
                    <th>Comment</th>
                </tr>
                </thead>
                <tbody>
                {this.props.search.results.map((tray, i) => {

                    const expiryStyle = (() => {
                        if (tray.expiry) {
                            const background = getExpiryColor(tray.expiry, expiryColorMode);
                            return {
                                backgroundColor: background,
                                color: getTextColorForBackground(background)
                            };
                        } else {
                            return {
                                backgroundColor: ""
                            };
                        }
                    })();

                    const zoneStyle = (() => {
                        const background = tray.parentZone.color;
                        return {
                            backgroundColor: background,
                            color: getTextColorForBackground(background)
                        };
                    })();

                    const weightString = (() => {
                        if (tray.weight) {
                            return `${tray.weight.toLocaleString(undefined, {minimumFractionDigits: 2})}kg`;
                        }
                        return "?";
                    })();

                    const locationString = `${tray.parentZone.name} ${tray.parentBay.name}${tray.parentShelf.name}`;

                    return <tr key={i}>
                        <td>{tray.category?.name ?? "?"}</td>
                        <td style={expiryStyle}>{tray.expiry?.label ?? "?"}</td>
                        <td className="weightCell">{weightString}</td>
                        <td style={zoneStyle}>{locationString}</td>
                        <td className="commentCell">{tray.comment}</td>
                    </tr>;
                })}
                </tbody>
            </table>;
        } else if (!this.props.search?.results) {
            return <LoadingSpinner/>;
        } else if (this.props.search.results.length === 0) {
            return <div>
                Couldn't find any trays which match this search
            </div>; //todo restyle
        }

    }
}

export default withRouter(SearchPage);