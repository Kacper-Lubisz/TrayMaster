import {doesNotReject} from "assert";
import React from "react";
import ReactDOM from "react-dom";
import {MemoryRouter} from "react-router-dom";
import ShelfViewPage, {ShelfViewProps} from "../pages/ShelfViewPage";
import {mockSetup} from "./sharedTestValues";

describe("Crash tests: ", () => {
    it("renders without crashing", () => {

        doesNotReject(mockSetup.then(([warehouse, user]) => {

            const props: ShelfViewProps = {
                openDialog: jest.fn(),
                setFind: jest.fn(),
                setCurrentView: jest.fn(),
                user: user,
                warehouse: warehouse,
                currentView: warehouse.shelves[0],
            };
            console.log(document);

            const div = document.createElement("div");

            ReactDOM.render(<MemoryRouter>
                <ShelfViewPage {...props} />
            </MemoryRouter>, div);
            ReactDOM.unmountComponentAtNode(div);

        }));

    });
});
