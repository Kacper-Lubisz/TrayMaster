import React from "react";
import {SearchQuery, Tray, Warehouse} from "./core/MockWarehouse";
import {Settings} from "./core/MockSettings";

interface SearchPageProps {
    warehouse: Warehouse,
    settings: Settings,
    query?: SearchQuery
    setQuery: (query: SearchQuery) => void;
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
        return <div>
            We are searching for some stuff<br/>
            searchQuery: {JSON.stringify(this.props.query)}
            {this.state && (<div>
                results: {JSON.stringify(this.state.results?.map(tray =>
                `${tray.category?.name ?? "Mixed"} ${tray.parentZone?.name} ${tray.parentBay?.name}${tray.parentShelf?.name}`
            ))}
            </div>)}
        </div>;
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