import Enzyme, {render} from "enzyme";
import React16Adapter from "enzyme-adapter-react-16";
import React from "react";
import App from "../core/App";

Enzyme.configure({adapter: new React16Adapter()});

it("renders without crashing", () => {

    render(<App/>);

});
