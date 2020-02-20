import React from "react";
import ReactDOM from "react-dom";
import ShelfViewPage from "../pages/ShelfViewPage";
import {mockUser, mockWarehouse, routeProps} from "./sharedTestValues";

/* eslint-disable @typescript-eslint/ban-ts-ignore */


describe("Crash tests: ", () => {
    it("renders without crashing", () => {
        const mockOpenDialog = jest.fn();
        const mockSetSearch = jest.fn();
        const props = {
            openDialog: mockOpenDialog,
            setSearch: mockSetSearch,
            user: mockUser,
            warehouse: mockWarehouse
        };
        const div = document.createElement("div");

        // @ts-ignore stop TS getting angry about missing Route props
        ReactDOM.render(<ShelfViewPage.WrappedComponent {...props} {...routeProps} />, div);
        ReactDOM.unmountComponentAtNode(div);
    });
});
