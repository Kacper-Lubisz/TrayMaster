import {doesNotReject} from "assert";
import Enzyme, {render} from "enzyme";
import React16Adapter from "enzyme-adapter-react-16";

import React from "react";
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
                setQuery: mockSetQuery,
                setCurrentView: jest.fn()
            };

            render(<MemoryRouter>
                <FindPage {...props} />
            </MemoryRouter>);

        }));

    });
});

describe("Results rendering tests:", () => {

    it("loads test data", async () => {

        const [warehouse, , , results] = await newSetup;

        const mockSetQuery = jest.fn();
        const props: FindPageProps = {
            warehouse: warehouse,
            find: {
                ...results,
                results: []
            },
            setQuery: mockSetQuery,
            setCurrentView: jest.fn()
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
            warehouse: warehouse,
            find: results,
            setQuery: mockSetQuery,
            setCurrentView: jest.fn()
        };

        it("displays the right number of find results", () => {
            page = Enzyme.mount(<MemoryRouter>
                <FindPage {...fullProps}/>
            </MemoryRouter>);

            expect(page.find("div#findResults > table")).toHaveLength(warehouse.trays.length);
        });

    });

});
