import React from "react";
import ReactDOM from "react-dom";
import {LoadingPage} from "../pages/Loading";

/* eslint-disable @typescript-eslint/ban-ts-ignore */


describe("Crash tests: ", () => {
    it("renders without crashing", () => {
        const div = document.createElement("div");

        // @ts-ignore stop TS getting angry about missing Route props
        ReactDOM.render(<LoadingPage/>, div);
        ReactDOM.unmountComponentAtNode(div);
    });
});
