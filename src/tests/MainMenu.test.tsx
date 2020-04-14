import Enzyme, {render} from "enzyme";
import React16Adapter from "enzyme-adapter-react-16";
import React from "react";
import {MemoryRouter} from "react-router-dom";
import MainMenuPage, {MainMenuProps} from "../pages/MainMenu";
import {mockSetup} from "./sharedTestValues";

Enzyme.configure({adapter: new React16Adapter()});

describe("Crash tests: ", () => {
    it("renders without crashing", async () => {

        const [warehouse, user] = await mockSetup;

        const props: MainMenuProps = {
            openDialog: jest.fn(),
            changeWarehouse: jest.fn(),
            signOut: jest.fn(),
            setFind: jest.fn(),
            warehouse: warehouse,
            user: user,
        };

        render(<MemoryRouter>
            <MainMenuPage {...props} />
        </MemoryRouter>);

    });
});