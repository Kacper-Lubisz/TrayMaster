import Enzyme, {render} from "enzyme";
import React16Adapter from "enzyme-adapter-react-16";
import React from "react";
import {MemoryRouter} from "react-router-dom";
import WarehouseSwitcher, {WarehouseSwitcherProps} from "../pages/WarehouseSwitcher";
import {mockSetup} from "./sharedTestValues";

Enzyme.configure({adapter: new React16Adapter()});

describe("Crash tests: ", () => {
    it("renders without crashing", async () => {

        const [, user] = await mockSetup;

        const props: WarehouseSwitcherProps = {
            user: user,
            setWarehouse: jest.fn(),
            signOut: jest.fn(),
        };

        render(
            <MemoryRouter initialEntries={["/warehouses"]}>
                <WarehouseSwitcher {...props} />
            </MemoryRouter>
        );

    });
});
