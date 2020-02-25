import React from "react";
import ReactDOM from "react-dom";
import WarehouseSwitcher from "../pages/WarehouseSwitcher";
import {mockUser, routeProps} from "./sharedTestValues";

/* eslint-disable @typescript-eslint/ban-ts-ignore */


describe("Crash tests: ", () => {
    it("renders without crashing", () => {
        const mockSetWarehouse = jest.fn();
        const props = {
            user: mockUser,
            setWarehouse: mockSetWarehouse
        };
        const div = document.createElement("div");

        // @ts-ignore stop TS getting angry about missing Route props
        ReactDOM.render(<WarehouseSwitcher.WrappedComponent {...props} {...routeProps} />, div);
        ReactDOM.unmountComponentAtNode(div);
    });
});
