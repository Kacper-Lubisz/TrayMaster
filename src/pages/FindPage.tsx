import {
    faArrowLeft as arrowLeft,
    faDownload as downloadIcon,
    faHome as menuIcon,
    faTimes as cross
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import React from "react";
import {RouteComponentProps, withRouter} from "react-router-dom";
import {FindPanel, PanelState} from "../components/FindPanel";
import {LoadingSpinner} from "../components/LoadingSpinner";
import {Category, NULL_CATEGORY_STRING, Shelf, Warehouse} from "../core/WarehouseModel";
import {TrayFields} from "../core/WarehouseModel/Layers/Tray";
import Utils from "../core/WarehouseModel/Utils";
import {getTextColorForBackground} from "../utils/colorUtils";
import {getExpiryColor} from "../utils/getExpiryColor";
import "./styles/find.scss";

export enum SortBy {
    expiry = "expiry",
    category = "category",
    weight = "weight",
    none = "none"
}

export interface SortQueryOptions {
    orderAscending: boolean;
    type: SortBy;
}

type CategoryQueryOptions = Set<Category> | "set" | "unset" | null;

/**
 * Defines the find queries that can be run on the warehouse
 */
export interface FindQuery {
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

export interface FindResults {
    query: FindQuery;
    results: null | TrayFields[];
}

export interface FindPageProps {
    warehouse?: Warehouse;
    find: FindResults;
    setQuery: (query: FindQuery) => void;
}

interface FindPageState {
    panelState: PanelState;
}

class FindPage extends React.Component<FindPageProps & RouteComponentProps, FindPageState> {

    constructor(props: FindPageProps & RouteComponentProps) {
        super(props);

        this.state = {
            panelState: "category"
        };
    }

    /**
     * This method resets the current find query
     */
    private clearQuery(): void {
        this.props.setQuery({
            ...this.props.find.query,
            categories: null
        });
    }

    buildCSVFile(): Blob {
        const header = "Category, Expiry, Expiry From (Unix Timestamp), Expiry To (Unix Timestamp), Weight (kg), Location, Comment\n";

        const content = this.props.find.results?.map(tray => {
            const line: string[] = [
                this.props.warehouse?.getCategoryByID(tray.categoryId)?.name ?? NULL_CATEGORY_STRING,
                tray.expiry?.label ?? "",
                tray.expiry?.from?.toString() ?? "",
                tray.expiry?.to?.toString() ?? "",
                tray.weight?.toString() ?? "",
                tray.locationName,
                tray.comment ?? ""
            ];

            return `${line.map(element =>
                Utils.escapeStringToCSV(element)
            ).reduce((acc, cur) =>
                `${acc}${cur},`, "")}\n`;
        }).reduce((acc, cur) => acc + cur, "") ?? null;

        return new Blob([content ? header + content : ""], {type: "text/plain"});
    }

    downloadFile(filename: string, content: Blob): void {
        const element = document.createElement("a");
        element.href = URL.createObjectURL(content);
        element.download = filename;
        document.body.appendChild(element); // Required for this to work in FireFox
        element.click();
        document.body.removeChild(element);
    }

    render(): React.ReactNode {
        return <div id="findPage">
            <div id="leftPanel">
                <div id="topPanel">
                    <div id="sentenceL">
                        <button onClick={() => this.props.history.goBack()}>
                            <FontAwesomeIcon icon={arrowLeft}/>
                        </button>
                        <button onClick={() => this.props.history.push("/menu")}>
                            <FontAwesomeIcon icon={menuIcon}/>
                        </button>
                    </div>
                    <div id="sentenceBox">
                        {this.renderFindSentence()}
                        <FontAwesomeIcon icon={cross} onClick={this.clearQuery.bind(this)}/>
                    </div>
                    <div id="sentenceR">
                        <button
                            onClick={(e) => {
                                e.currentTarget.blur();
                                this.downloadFile(
                                    `Find ${new Date().toLocaleDateString("en-GB", {
                                        weekday: "short",
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric"
                                    })}.csv`,
                                    this.buildCSVFile()
                                );
                            }}
                            disabled={!this.props.find.results?.length}>
                            <FontAwesomeIcon icon={downloadIcon}/>
                        </button>
                    </div>
                </div>
                <div id="findResults">{this.renderFindResults()}</div>
            </div>
            <FindPanel
                panelState={this.state.panelState}
                setPanelState={this.updatePanel.bind(this)}
                find={this.props.find}
                warehouse={this.props.warehouse}
                setQuery={this.props.setQuery}/>
        </div>;
    }

    private updatePanel(panelState: PanelState): void {
        this.setState(state => ({
            ...state,
            panelState: panelState
        }));
    }

    private renderFindSentence(): React.ReactNode {

        const categories: CategoryQueryOptions = this.props.find.query?.categories ?? null;
        // const weight = this.props.find.query.weight;
        // const sortBy = this.props.find.query.sort;

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
                return "all categories";
            }
        })();

        // const weightString = (() => {
        //     if (typeof weight === "object" && weight) {
        //         return `between ${weight.from} and ${weight.to} kg`;
        //     } else if (weight === "set") {
        //         return "without a set weight value";
        //     } else if (weight === "unset") {
        //         return "with any set weight value";
        //     } else { // null
        //         return "with any weight value";
        //     }
        // })();
        //
        // const expiryString = `sorted by ${SortBy[sortBy.type]} ${sortBy.orderAscending ? "ascending" :
        // "descending"}`;

        return <span id="findSentence">
            Finding <span className="findField" onClick={() => this.updatePanel("category")}>
                {filterString}
            </span>.
            {/*; <span className="findField" onClick={() => this.updatePanel("weight")}>*/}
            {/*    {weightString}*/}
            {/*</span>; <span id="findSort" className="findField">*/}
            {/*    {expiryString}*/}
            {/*</span>.*/}
        </span>;
    }

    private renderFindResults(): React.ReactNode {
        const shelfMap: Map<string, Shelf> = new Map<string, Shelf>(
            this.props.warehouse?.shelves.map<[string, Shelf]>(shelf => [shelf.id, shelf]
            ) ?? []);
        const expiryColorMode = this.props.warehouse?.expiryColorMode ?? "warehouse";
        if (this.props.find?.results && this.props.find.results.length !== 0) {
            return <table>
                <thead>
                <tr>
                    <th>Category</th>
                    <th>Expiry</th>
                    <th className="weightCol">Weight (kg)</th>
                    <th>Location</th>
                    <th>Comment</th>
                </tr>
                </thead>
                <tbody>
                {this.props.find.results.map((tray, i) => {
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

                    const shelf: Shelf | undefined = shelfMap.get(tray.layerIdentifiers["shelves"]);
                    const locationString: string = shelf ? shelf.toString() : "<SHELF DELETED>";
                    const background: string = shelf ? shelf.parentZone.color : "#ffffff";

                    const zoneStyle = (() => {
                        return {
                            backgroundColor: background,
                            color: getTextColorForBackground(background)
                        };
                    })();

                    const weightString = tray.weight?.toLocaleString(undefined, {minimumFractionDigits: 2}) ?? "";

                    return <tr key={i}>
                        <td>{this.props.warehouse?.getCategoryByID(tray.categoryId)?.name ?? NULL_CATEGORY_STRING}</td>
                        <td style={expiryStyle}>{tray.expiry?.label ?? ""}</td>
                        <td className="weightCol"><span>{weightString}</span></td>
                        <td style={zoneStyle}>{locationString}</td>
                        <td className="commentCell">{tray.comment}</td>
                    </tr>;
                })}
                </tbody>
            </table>;
        } else if (!this.props.find?.results) {
            return <LoadingSpinner/>;
        } else if (this.props.find.query.categories instanceof Set && this.props.find.query.categories.size > 10) {
            return <div id="find-no-results">
                Cannot find more than 10 categories at a time.
            </div>;
        } else if (this.props.find.results.length === 0) {
            return <div id="find-no-results">
                Couldn't find any trays that match this query.
            </div>;
        }
    }
}

export default withRouter(FindPage);