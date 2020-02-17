import React from "react";
import ReactDOM from "react-dom";
import SettingsPage from "../pages/SettingsProps";
import {mockUser, mockWarehouse, routeProps} from "./sharedTestValues";

/* eslint-disable @typescript-eslint/ban-ts-ignore */


describe("Crash tests: ", () => {
    it("renders without crashing", () => {
        const mockOpenDialog = jest.fn();
        const props = {
            openDialog: mockOpenDialog,
            warehouse: mockWarehouse,
            user: mockUser
        };
        const div = document.createElement("div");
        // @ts-ignore stop TS getting angry about missing Route props
        ReactDOM.render(<SettingsPage.WrappedComponent {...props} {...routeProps} />, div);
        ReactDOM.unmountComponentAtNode(div);
    });
});
