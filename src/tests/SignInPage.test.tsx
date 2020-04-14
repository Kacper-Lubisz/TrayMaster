import Enzyme, {render} from "enzyme";
import React16Adapter from "enzyme-adapter-react-16";
import React from "react";
import {MemoryRouter} from "react-router-dom";
import SignInPage, {SignInPageProps} from "../pages/SignInPage";

Enzyme.configure({adapter: new React16Adapter()});

describe("Crash tests: ", () => {
    it("renders without crashing", () => {

        const props: SignInPageProps = {
            openDialog: jest.fn()
        };

        render(
            <MemoryRouter>
                <SignInPage {...props} />
            </MemoryRouter>
        );

    });
});
