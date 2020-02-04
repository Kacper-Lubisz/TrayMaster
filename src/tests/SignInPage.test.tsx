import React from "react";
import ReactDOM from "react-dom";
import SignInPage from "../pages/SignInPage";
import {routeProps} from "./sharedTestValues";

/* eslint-disable @typescript-eslint/ban-ts-ignore */


describe("Crash tests: ", () => {
    it("renders without crashing", () => {
        const div = document.createElement("div");

        // @ts-ignore stop TS getting angry about missing Route props
        ReactDOM.render(<SignInPage.WrappedComponent {...routeProps} />, div);
        ReactDOM.unmountComponentAtNode(div);
    });
});
