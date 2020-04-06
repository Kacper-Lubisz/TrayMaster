import Enzyme, {render} from "enzyme";
import React16Adapter from "enzyme-adapter-react-16";
import React from "react";
import {LoadingPage} from "../pages/Loading";

Enzyme.configure({adapter: new React16Adapter()});

describe("Crash tests: ", () => {
    it("renders without crashing", () => {

        render(<LoadingPage/>);

    });
});
