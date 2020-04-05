import {doesNotReject} from "assert";
import React from "react";
import ReactDOM from "react-dom";
import {MemoryRouter} from "react-router-dom";
import MainMenuPage, {MainMenuProps} from "../pages/MainMenu";
import {mockSetup} from "./sharedTestValues";

describe("Crash tests: ", () => {
    it("renders without crashing", () => {

        doesNotReject(mockSetup.then(([mockWarehouse, mockUser]) => {

            const props: MainMenuProps = {
                openDialog: jest.fn(),
                changeWarehouse: jest.fn(),
                signOut: jest.fn(),
                setFind: jest.fn(),
                warehouse: mockWarehouse,
                user: mockUser,
            };

            const div = document.createElement("div");

            ReactDOM.render(<MemoryRouter>
                <MainMenuPage {...props} />
            </MemoryRouter>, div);
            ReactDOM.unmountComponentAtNode(div);
        }));

    });
});