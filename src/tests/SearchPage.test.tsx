import Enzyme from "enzyme";
import React16Adapter from "enzyme-adapter-react-16";
import React from "react";
import ReactDOM from "react-dom";
import SearchPage, {SortBy} from "../pages/SearchPage";
import {mockWarehouse, routeProps} from "./sharedTestValues";

/* eslint-disable @typescript-eslint/ban-ts-ignore */

Enzyme.configure({adapter: new React16Adapter()});

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

describe("Results rendering tests:", () => {
    const mockSetQuery = jest.fn();
    const props = {
        warehouse: mockWarehouse,
        search: {
            ...mockSearch,
            results: []
        },
        setQuery: mockSetQuery
    };
    let page: Enzyme.ReactWrapper;

    it("takes no results without crashing", () => {
        // @ts-ignore stop TS getting angry about missing Route props
        page = Enzyme.mount(<SearchPage.WrappedComponent {...props} {...routeProps} />);
    });

    it("displays a message to tell the user that there are no results", () => {
        expect(page.find("div#searchResults > div").text()).toEqual("Couldn't find any trays which match this search");
        page.unmount();
    });

    const fullProps = {
        warehouse: mockWarehouse,
        search: mockSearch,
        setQuery: mockSetQuery
    };

    it("displays the right number of search results", () => {
        // @ts-ignore stop TS getting angry about missing Route props
        page = Enzyme.mount(<SearchPage.WrappedComponent {...fullProps} {...routeProps} />);

        expect(page.find("div#searchResults > table")).toHaveLength(mockWarehouse.trays.length);
    });
});
