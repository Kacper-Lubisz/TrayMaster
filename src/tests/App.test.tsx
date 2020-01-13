/* eslint-disable @typescript-eslint/no-unused-vars,@typescript-eslint/no-unused-vars-experimental */

import React from "react";
import ReactDOM from "react-dom";
import App from "../core/App";

it("renders without crashing", () => {
    const div = document.createElement("div");
    ReactDOM.render(<App/>, div);
    ReactDOM.unmountComponentAtNode(div);
});
