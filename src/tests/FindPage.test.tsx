import {doesNotReject} from "assert";
import Enzyme from "enzyme";
import React16Adapter from "enzyme-adapter-react-16";

import React from "react";
import ReactDOM from "react-dom";
import {MemoryRouter} from "react-router-dom";
import {User} from "../core/Firebase/Authentication";
import {Warehouse} from "../core/WarehouseModel";

import FindPage, {FindPageProps, FindQuery, FindResults, SortBy} from "../pages/FindPage";
import {mockSetup} from "./sharedTestValues";

Enzyme.configure({adapter: new React16Adapter()});

const newSetup: Promise<[Warehouse, User, FindQuery, FindResults]> = mockSetup.then(
    ([mockWarehouse, user]) => {

        const query: FindQuery = {
            categories: "set",
            weight: "set",
            commentSubstring: null,
            excludePickingArea: false,
            sort: {
                orderAscending: true,
                type: SortBy.category,
            }
        };
        const results: FindResults = {
            query: query,
            results: mockWarehouse.trays.map(tray => ({
                locationName: tray.locationString,
                categoryId: mockWarehouse.getCategoryID(tray.category),
                expiry: tray.expiry ?? null,
                weight: tray.weight ?? null,
                comment: tray.comment ?? null,
                lastModified: 0,
                blame: "person",
                layerIdentifiers: {}
            }))
        };

        return [mockWarehouse, user, query, results];
    });

describe("Crash tests: ", () => {
    it("renders without crashing", () => {

        doesNotReject(newSetup.then(([mockWarehouse, , , results]) => {

            const mockSetQuery = jest.fn();
            const props: FindPageProps = {
                warehouse: mockWarehouse,
                find: results,
                setQuery: mockSetQuery
            };
            const div = document.createElement("div");

            ReactDOM.render(<MemoryRouter>
                <FindPage {...props} />
            </MemoryRouter>, div);
            ReactDOM.unmountComponentAtNode(div);

        }));

    });
});

describe("Results rendering tests:", () => {

    doesNotReject(newSetup.then(([mockWarehouse, , , results]) => {

        const mockSetQuery = jest.fn();
        const props: FindPageProps = {
            warehouse: mockWarehouse,
            find: {
                ...results,
                results: []
            },
            setQuery: mockSetQuery
        };
        let page: Enzyme.ReactWrapper;

        it("takes no results without crashing", () => {
            page = Enzyme.mount(<MemoryRouter>
                <FindPage {...props}/>
            </MemoryRouter>);
        });

        it("displays a message to tell the user that there are no results", () => {
            expect(page.find("div#findResults > div").text()).toEqual("Couldn't find any trays that match this query.");
            page.unmount();
        });

        const fullProps: FindPageProps = {
            warehouse: mockWarehouse,
            find: results,
            setQuery: mockSetQuery
        };

        it("displays the right number of find results", () => {
            page = Enzyme.mount(<MemoryRouter>
                <FindPage {...fullProps}/>
            </MemoryRouter>);

            expect(page.find("div#findResults > table")).toHaveLength(mockWarehouse.trays.length);
        });

    }));

});
