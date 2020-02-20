import React from "react";
import ReactDOM from "react-dom";
import {LoadingPage} from "../pages/Loading";



describe("Crash tests: ", () => {
    it("renders without crashing", () => {
        const div = document.createElement("div");

        ReactDOM.render(<LoadingPage/>, div);
        ReactDOM.unmountComponentAtNode(div);
    });
});
