import {doesNotReject} from "assert";
import React from "react";
import ReactDOM from "react-dom";
import {MemoryRouter} from "react-router-dom";
import WarehouseSwitcher, {WarehouseSwitcherProps} from "../pages/WarehouseSwitcher";
import {mockSetup} from "./sharedTestValues";


describe("Crash tests: ", () => {
    it("renders without crashing", () => {

        doesNotReject(mockSetup.then(([, user]) => {

            const props: WarehouseSwitcherProps = {
                user: user,
                setWarehouse: jest.fn(),
                signOut: jest.fn(),
            };
            const div = document.createElement("div");


            ReactDOM.render(<MemoryRouter>
                <WarehouseSwitcher {...props} />
            </MemoryRouter>, div);
            ReactDOM.unmountComponentAtNode(div);

        }));
    });
});
