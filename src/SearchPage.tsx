import React from "react";
import {SearchQuery, Tray, Warehouse} from "./core/MockWarehouse";
import {Settings} from "./core/MockSettings";
import "./styles/search.scss";

interface SearchPageProps {
    warehouse: Warehouse,
    settings: Settings,
    query?: SearchQuery
    setQuery: (query: SearchQuery) => void;
}

export interface SearchPanelProps {
    keyboardState: string
    // I don't know what other information the SearchPanel needs
}

export class SearchPanel extends React.Component<SearchPanelProps> {

    render() {
        // return DOM elements using button structures
        return (
            <div id="searchPanel">
                This is the side panel fellas. keyboardState is "{this.props.keyboardState}"
            </div>
        );
    }
}

interface SearchPageState {
    results?: Tray[]
}

export class SearchPage extends React.Component<SearchPageProps, SearchPageState> {

    constructor(props: SearchPageProps) {
        super(props);

        if (this.props.query) {
            this.props.warehouse.traySearch(this.props.query).then((results) => {
                this.setState({
                    ...this.state,
                    results: results
                });
            });
        }

    }

    render() {
        return (
            <div id="searchPage">
                <div id="leftPanel">
                    <div id="searchSentence">
                        Beans and stuff expiring soon
                    </div>
                    <div id="searchResults">
                        searchQuery: {JSON.stringify(this.props.query)}
                        {this.state && (<div>
                                results: {JSON.stringify(this.state.results?.map(tray =>
                                `${tray.category?.name ?? "Mixed"} ${tray.parentZone?.name} ${tray.parentBay?.name}${tray.parentShelf?.name}`
                            ))}
                            </div>
                        )}
                    </div>
                </div>
                <SearchPanel keyboardState="yeet"/>
            </div>
        );
    }

    /**
     * This method opens a search a for the specified query
     */
    static openSearch(query: SearchQuery) {
        throw Error("Unimplemented method stub");
        // window.history.pushState(query, "", "/search");
        // todo navigate to the search page
    }

}