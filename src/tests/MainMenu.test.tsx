import React from "react";
import ReactDOM from "react-dom";
import MainMenuPage from "../pages/MainMenu";
import {mockUser, mockWarehouse, routeProps} from "./sharedTestValues";

/* eslint-disable @typescript-eslint/ban-ts-ignore */


describe("Crash tests: ", () => {
    it("renders without crashing", () => {
        const mockOpenDialog = jest.fn();
        const mockChangeWarehouse = jest.fn();
        const mockSignOut = jest.fn();
        const mockSetFind = jest.fn();

        const props = {
            openDialog: mockOpenDialog,
            changeWarehouse: mockChangeWarehouse,
            signOut: mockSignOut,
            setFind: mockSetFind,
            warehouse: mockWarehouse,
            user: mockUser,
            expiryAmount: 4
        };

        const div = document.createElement("div");

        // @ts-ignore stop TS getting angry about missing Route props
        ReactDOM.render(<MainMenuPage.WrappedComponent {...props} {...routeProps} />, div);
        ReactDOM.unmountComponentAtNode(div);
    });
});
