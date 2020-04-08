import Enzyme, {render} from "enzyme";
import React16Adapter from "enzyme-adapter-react-16";
import React from "react";
import {MemoryRouter} from "react-router-dom";
import SettingsPage, {SettingsPageProps} from "../pages/SettingsPage";
import {mockSetup} from "./sharedTestValues";

Enzyme.configure({adapter: new React16Adapter()});

describe("Crash tests: ", () => {
    it("renders without crashing", async () => {

        const [warehouse, user] = await mockSetup;

        const props: SettingsPageProps = {
            openDialog: jest.fn(),
            warehouse: warehouse,
            user: user
        };

        render(<MemoryRouter>
            <SettingsPage {...props}/>
        </MemoryRouter>);

    });
});
