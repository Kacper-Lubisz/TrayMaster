import Enzyme, {render} from "enzyme";
import React16Adapter from "enzyme-adapter-react-16";
import React from "react";
import {MemoryRouter} from "react-router-dom";
import ShelfViewPage, {ShelfViewProps} from "../pages/ShelfViewPage";
import {mockSetup} from "./sharedTestValues";

Enzyme.configure({adapter: new React16Adapter()});

describe("Crash tests: ", () => {
    it("renders without crashing", async () => {

        const [warehouse, user] = await mockSetup;

        const props: ShelfViewProps = {
            openDialog: jest.fn(),
            setFind: jest.fn(),
            setCurrentView: jest.fn(),
            user: user,
            warehouse: warehouse,
            currentView: warehouse.shelves[0],
        };

        render(<MemoryRouter>
            <ShelfViewPage {...props} />
        </MemoryRouter>);

    });
});
