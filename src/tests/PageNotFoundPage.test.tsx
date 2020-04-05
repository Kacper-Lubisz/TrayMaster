import React from "react";
import ReactDOM from "react-dom";
import {MemoryRouter} from "react-router-dom";
import PageNotFoundPage from "../pages/PageNotFoundPage";


describe("Crash tests: ", () => {
    it("renders without crashing", () => {
        const div = document.createElement("div");

        ReactDOM.render(<MemoryRouter>
            <PageNotFoundPage/>
        </MemoryRouter>, div);
        ReactDOM.unmountComponentAtNode(div);
    });
});
