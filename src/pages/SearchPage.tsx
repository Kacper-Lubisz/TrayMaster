import React from "react";
import {Category, Tray, Warehouse} from "../core/WarehouseModel";
import {Settings} from "../core/Settings";
import "../styles/search.scss";
import {getExpiryColor} from "../utils/getExpiryColor";
import {getTextColorForBackground} from "../utils/getTextColorForBackground";
import {faTrashAlt as trash} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {PanelState, SearchPanel} from "../components/SearchPanel";


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
 * todo fixme document this properly
 */
export interface SearchQuery {
    categories: CategoryQueryOptions;
    /**
     * The type corresponds to:
     *  within range, any weight, only undefined weight, no filter by weight
     */
    weight: ({ from: number; to: number } | "set" | "unset") | null;

    commentSubstring: string | null;

    excludePickingArea: boolean;

    sort: SortQueryOptions;
}

export interface SearchResults {
    query: SearchQuery;
    results: null | Tray[];
}

interface SearchPageProps {
    warehouse?: Warehouse;
    settings?: Settings;
    search?: SearchResults;
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
            <div id="topPanel">
                    <span id="searchSentence">
                        {this.renderSearchSentence()}
                    </span>
                <div id="sentenceR">
                    <FontAwesomeIcon icon={trash} onClick={this.clearQuery.bind(this)}/>
                    <button onClick={() => this.props.history.goBack()}>Go back</button>
                </div>
            </div>
            <div id="leftPanel">
                <div id="searchResults">{this.renderSearchResults()}</div>
            </div>
            <SearchPanel panelState={this.state.panelState} setPanelState={this.updatePanel.bind(this)}
                         search={this.props.search} warehouse={this.props.warehouse}
                         setQuery={this.props.setQuery}/>
        </div>;
    }

    private updatePanel(state: PanelState): void {
        this.setState({
            ...this.state,
            panelState: state
        });
    }

    private renderSearchSentence(): React.ReactNode {

        const categories: CategoryQueryOptions = this.props.search?.query?.categories ?? null;
        const weight = this.props.search?.query?.weight;
        const sortBy = this.props.search?.query?.sort;

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

        const expiryString = (() => {
            if (sortBy) {
                return `sorted by ${SortBy[sortBy.type]} ${sortBy.orderAscending ? "ascending" : "descending"}`;
            } else {
                return "unsorted";
            }
        })();

        return <span id="searchSentence">
            <span id="searchFilters"> {/* todo evaluate the usefulness of this span */}
                <span className="searchField" onClick={() => this.updatePanel("category")}>
                    {filterString}
                </span>; <span className="searchField" onClick={() => this.updatePanel("weight")}>
                    {weightString}
                </span>
            </span>, <span id="searchSort" className="searchField">
                {expiryString}
            </span>.
        </span>;
    }

    private renderSearchResults(): React.ReactNode {

        if (this.props.search?.results && this.props.search.results.length !== 0) {
            return <table>
                <thead>
                <tr>
                    <th>Category</th>
                    <th>Expiry</th>
                    <th>Weight</th>
                    <th>Location</th>
                    <th>Custom</th>
                    <th/>
                </tr>
                </thead>
                <tbody>
                {this.props.search.results.map((tray, i) => {

                    const expiryStyle = (() => {
                        if (tray.expiry) {
                            const background = getExpiryColor(tray.expiry);
                            return {
                                backgroundColor: background,
                                color: getTextColorForBackground(background)
                            };
                        } else {
                            return {
                                backgroundColor: "#ffffff",
                                color: "#000000"
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

                    return (
                        <tr key={i}>
                            <td>{tray.category?.name ?? "?"}</td>
                            <td style={expiryStyle}>{tray.expiry?.label ?? "?"}</td>
                            <td className="weightCell">{tray.weight
                                                        ? `${tray.weight.toLocaleString(undefined, {minimumFractionDigits: 2})}kg`
                                                        : "?"}</td>
                            <td style={zoneStyle}>{tray.parentZone.name} {tray.parentBay.name}{tray.parentShelf.name}</td>
                            <td className="commentCell" style={{
                                backgroundColor: tray.comment ? "#ffffff" : ""
                                // todo make this a text field that can be edited
                            }}>{tray.comment}</td>
                            <td>
                                <button>Go To</button>
                            </td>
                        </tr>
                    );
                })}
                </tbody>
            </table>;
        } else if (!this.props.search?.results) {
            return <div>
                Loading
            </div>; //todo fixme make this reuse the loading anumation inside the search area
        } else if (this.props.search.results.length === 0) {
            return <div>
                Couldn't find any trays which match this search
            </div>; //todo restyle
        }

    }
}

export default withRouter(SearchPage);