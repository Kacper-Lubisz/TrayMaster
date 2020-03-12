import Enzyme from "enzyme";
import React16Adapter from "enzyme-adapter-react-16";
import React from "react";
import ReactDOM from "react-dom";
import FindPage, {SortBy} from "../pages/FindPage";
import {mockWarehouse, routeProps} from "./sharedTestValues";

/* eslint-disable @typescript-eslint/ban-ts-ignore */

Enzyme.configure({adapter: new React16Adapter()});

const mockFind = {
    query: {
        categories: "set",
        weight: "set",
        commentSubstring: null,
        excludePickingArea: false,
        sort: SortBy["expiry"]
    },
    outcome: true,
    results: mockWarehouse.trays
};

describe("Crash tests: ", () => {
    it("renders without crashing", () => {
        const mockSetQuery = jest.fn();
        const props = {
            warehouse: mockWarehouse,
            find: mockFind,
            setQuery: mockSetQuery
        };
        const div = document.createElement("div");

        // @ts-ignore stop TS getting angry about missing Route props
        ReactDOM.render(<FindPage.WrappedComponent {...props} {...routeProps} />, div);
        ReactDOM.unmountComponentAtNode(div);
    });
});

describe("Results rendering tests:", () => {
    const mockSetQuery = jest.fn();
    const props = {
        warehouse: mockWarehouse,
        find: {
            ...mockFind,
            results: []
        },
        setQuery: mockSetQuery
    };
    let page: Enzyme.ReactWrapper;

    it("takes no results without crashing", () => {
        // @ts-ignore stop TS getting angry about missing Route props
        page = Enzyme.mount(<FindPage.WrappedComponent {...props} {...routeProps} />);
    });

    it("displays a message to tell the user that there are no results", () => {
        expect(page.find("div#findResults > div").text()).toEqual("Couldn't find any trays that match this query.");
        page.unmount();
    });

    const fullProps = {
        warehouse: mockWarehouse,
        find: mockFind,
        setQuery: mockSetQuery
    };

    it("displays the right number of find results", () => {
        // @ts-ignore stop TS getting angry about missing Route props
        page = Enzyme.mount(<FindPage.WrappedComponent {...fullProps} {...routeProps} />);

        expect(page.find("div#findResults > table")).toHaveLength(mockWarehouse.trays.length);
    });
});