import React from "react";
import ReactDOM from "react-dom";
import PageNotFoundPage from "../pages/PageNotFoundPage";
import {routeProps} from "./sharedTestValues";

/* eslint-disable @typescript-eslint/ban-ts-ignore */


describe("Crash tests: ", () => {
    it("renders without crashing", () => {
        const div = document.createElement("div");

        // @ts-ignore stop TS getting angry about missing Route props
        ReactDOM.render(<PageNotFoundPage.WrappedComponent {...routeProps} />, div);
        ReactDOM.unmountComponentAtNode(div);
    });
});
