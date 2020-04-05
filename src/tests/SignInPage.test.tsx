import React from "react";
import ReactDOM from "react-dom";
import {MemoryRouter} from "react-router-dom";
import SignInPage, {SignInPageProps} from "../pages/SignInPage";

describe("Crash tests: ", () => {
    it("renders without crashing", () => {
        const div = document.createElement("div");

        const props: SignInPageProps = {
            openDialog: jest.fn()
        };

        ReactDOM.render(<MemoryRouter>
            <SignInPage {...props} />
        </MemoryRouter>, div);
        ReactDOM.unmountComponentAtNode(div);
    });
});
