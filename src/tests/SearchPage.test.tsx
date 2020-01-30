import React from "react";
import ReactDOM from "react-dom";
import SearchPage, {SortBy} from "../pages/SearchPage";
import {mockWarehouse, routeProps} from "./sharedTestValues";

/* eslint-disable @typescript-eslint/ban-ts-ignore */


const mockSearch = {
    query: {
        categories: "set",
        weight: "set",
        commentSubstring: null,
        excludePickingArea: false,
        sort: SortBy["expiry"]
    },
    results: mockWarehouse.trays
};

describe("Crash tests: ", () => {
    it("renders without crashing", () => {
        const mockSetQuery = jest.fn();
        const props = {
            warehouse: mockWarehouse,
            search: mockSearch,
            setQuery: mockSetQuery
        };
        const div = document.createElement("div");

        // @ts-ignore stop TS getting angry about missing Route props
        ReactDOM.render(<SearchPage.WrappedComponent {...props} {...routeProps} />, div);
        ReactDOM.unmountComponentAtNode(div);
    });
});
