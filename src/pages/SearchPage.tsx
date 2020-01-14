import React from "react";
import {Tray, Warehouse} from "../core/WarehouseModel";
import {Settings} from "../core/Settings";
import "../styles/search.scss";

interface SearchPageProps {
    warehouse?: Warehouse;
    settings?: Settings;
    query?: any; // fixme sort this out when we have a proper search interface
    setQuery: (query: any) => void;
}

export interface SearchPanelProps {
    keyboardState: string;
    // I don't know what other information the SearchPanel needs
}

export class SearchPanel extends React.Component<SearchPanelProps> {

    render(): React.ReactNode {
        // return DOM elements using button structures
        return (
            <div id="searchPanel">
                This is the side panel fellas. keyboardState is "{this.props.keyboardState}"
            </div>
        );
    }
}

interface SearchPageState {
    results?: Tray[];
}

export class SearchPage extends React.Component<SearchPageProps, SearchPageState> {

    constructor(props: SearchPageProps) {
        super(props);
        // fixme sort this out when we have a proper search interface
        if (this.props.query) {
            this.props.warehouse?.traySearch ? (this.props.query).then((results) => {
                this.setState({
                    ...this.state,
                    results: results
                });
            });
        }

    }

    render(): React.ReactNode {
        return (
            <div id="searchPage">
                <div id="leftPanel">
                    <div id="topPanel">
                        <span id="searchSentence">
                            <span id="searchCategories" className="searchField">
                                {this.props.query?.categories.map((cat, i) => {
                                    return `${i ? " and " : ""}${cat?.name} `;
                                })}
                            </span>
                            sorted by
                            <span id="sort" className="searchField">
                                {` ${this.props.query?.sortBy}`}
                            </span>
                            .
                        </span>
                    </div>
                    <div id="searchResults">
                        <table>
                            <thead>
                            <tr>
                                <th>Category</th>
                                <th>Expiry</th>
                                <th>Weight</th>
                                <th>Location</th>
                                <th>Custom</th>
                            </tr>
                            </thead>
                            <tbody>
                            {this.state?.results?.map(tray => {
                                return (
                                    <tr>
                                        <td>{tray.category?.name}</td>
                                        <td style={{backgroundColor: tray.expiry?.color}}>{tray.expiry?.label}</td>
                                        <td>{tray.weight} kg</td>
                                        <td style={{backgroundColor: tray.parentZone?.color}}>{tray.parentZone?.name} {tray.parentBay?.name}{tray.parentShelf?.name}</td>
                                        <td style={{
                                            backgroundColor: tray.customField ? "#ffffff" : "#eeeeee"
                                        }}>{tray.customField}</td>
                                    </tr>
                                );
                            })}
                            </tbody>
                        </table>
                    </div>
                </div>
                <SearchPanel keyboardState="yeet"/>
            </div>
        );
    }

    /**
     * This method opens a search a for the specified query
     */
    static openSearch(query): undefined {
        throw Error("Unimplemented method stub");
        // window.history.pushState(query, "", "/search");
        // todo navigate to the search page
    }

}