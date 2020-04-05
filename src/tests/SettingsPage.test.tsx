import {doesNotReject} from "assert";
import React from "react";
import ReactDOM from "react-dom";
import {MemoryRouter} from "react-router-dom";
import SettingsPage, {SettingsPageProps} from "../pages/SettingsPage";
import {mockSetup} from "./sharedTestValues";


describe("Crash tests: ", () => {
    it("renders without crashing", () => {

        doesNotReject(mockSetup.then(([warehouse, user]) => {

            const mockOpenDialog = jest.fn();
            const props: SettingsPageProps = {
                openDialog: mockOpenDialog,
                warehouse: warehouse,
                user: user
            };
            const div = document.createElement("div");

            ReactDOM.render(<MemoryRouter>
                <SettingsPage {...props}/>
            </MemoryRouter>, div);
            ReactDOM.unmountComponentAtNode(div);

        }));

    });
});
