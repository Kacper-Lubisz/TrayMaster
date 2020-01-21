import React from "react";
import {Category, Tray, Warehouse} from "../core/WarehouseModel";
import {Settings} from "../core/Settings";
import "../styles/search.scss";
import {getExpiryColor} from "../utils/getExpiryColor";
import {getTextColorForBackground} from "../utils/getTextColorForBackground";
import {faTrashAlt as trash} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {SearchPanel} from "../components/SearchPanel";

export interface SearchQuery {
    categories: (Category | null)[] | undefined;
    /**
     * The type corresponds to:
     *  within range, any weight, only undefined weight, no filter by weight
     */
    weight: { from: number; to: number } | "defined" | "undefined" | undefined;

    sortBy: "expiry" | undefined;
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

// interface SearchPageState {
// }

class SearchPage extends React.Component<SearchPageProps & RouteComponentProps> {

    constructor(props: SearchPageProps & RouteComponentProps) {
        super(props);

        this.state = {};

    }

    /**
     * This method resets the current search query
     */
    private clearQuery(): void {
        this.props.setQuery({
            categories: undefined,
            sortBy: undefined,
            weight: undefined
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
            <SearchPanel keyboardState="yeet" setQuery={this.props.setQuery}/>
        </div>;
    }

    private renderSearchSentence(): React.ReactNode {

        const categories: (Category | null)[] = this.props.search?.query?.categories ?? [];
        const weight = this.props.search?.query?.weight;
        const sortBy = this.props.search?.query?.sortBy;

        //todo  change mixed to ?
        const catList: string[] = categories.map(c => c ? c.name : "Mixed");
        // todo this is horrific and could probably afford to be split out into if statements
        const filterString = categories.length ? catList.map((c, i) => i === catList.length - 1 ? c
                                                                                                : c.concat(i === catList.length - 2
                                                                                                           ? " and "
                                                                                                           : ", "))
                                               : "All categories";
        const weightString = typeof weight === "object" ? `between ${weight.from} and ${weight.to} kg`
                                                        : typeof weight === "string" ? "with no given weight"
                                                                                     : "with any weight";

        return <span id="searchSentence">
            <span id="searchFilters"> {/* todo evaluate the usefulness of this span */}
                <span className="searchField">
                    {filterString}
                </span>, <span className="searchField">
                    {weightString}
                </span>
            </span>, <span id="searchSort" className="searchField">
                {sortBy ? `sorted by ${sortBy}` : "unsorted"}
            </span>.
        </span>;

        /*return <>

            {
                categories === undefined || categories.length === 0 ?
                <span
                    className="searchField"
                    onClick={() => {
                        alert("todo");
                    }}
                >Any</span> :
                categories.map((category, index) =>
                    <span
                        key={index}
                        className="searchField"
                    >{ //todo fixme on click remove from query
                        category?.name ?? "Mixed" //todo add comma
                    }</span>
                )
            }

            <span
                className="searchEdit"
            ><FontAwesomeIcon
                icon={plus}/> Cat.</span> {/*todo fixme move to category keyboard, highlight this button*//*}

            {(() => {
                if (weight === undefined) {
                    return <span className="searchEdit"><FontAwesomeIcon icon={plus}/> Weight</span>;
                } else if (weight === "defined") {
                    return <span className="searchField">Defined Weight</span>;
                } else if (weight === "undefined") {
                    return <span className="searchField">Undefined Weight</span>;
                } else { //range
                    return <span className="searchField">{`${weight.from}-${weight.to}kg`}</span>;
                }
            })()}

            {(() => {
                if (sortBy === undefined) {
                    return <span className="searchEdit"><FontAwesomeIcon icon={plus}/> Sort</span>;
                } else { // if (sortBy === "expiry") {
                    return <>
                        <span className="searchMessage">Sorted By</span>
                        <span className="searchField">Expiry</span>
                    </>;
                }
                // else {
                //     // todo finalise this when sort and search query are better defined
                //     return <>
                //         <span className="search">Sorted By</span>
                //         <span className="searchField">SOMETHING UNKNOWN</span>
                //     </>;
                // }
            })()}

            {/*todo fixme add custom fields and other search criteria here*//*}

        </>;*/
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
                {this.props.search.results.map(tray => {

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
                        <tr>
                            <td>{tray.category?.name ?? "?"}</td>
                            <td style={expiryStyle}>{tray.expiry?.label ?? "?"}</td>
                            <td>{tray.weight ?? "?"} kg</td>
                            <td style={zoneStyle}>{tray.parentZone.name} {tray.parentBay.name}{tray.parentShelf.name}</td>
                            <td style={{
                                backgroundColor: tray.comment ? "#ffffff" : "#eeeeee"
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