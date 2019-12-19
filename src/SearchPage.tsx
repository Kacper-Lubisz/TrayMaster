import React from "react";
import {Category} from "./core/MockWarehouse";

export class SearchPage extends React.Component {
    render() {
        return <div>We are searching for some stuff</div>;
    }

    /**
     * This method opens a search a for the specified query
     */
    static openSearch(query: SearchQuery) {

    }

}

interface SearchQuery {
    categories: Category[]
    sortBy: "expiry"
}