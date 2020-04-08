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

    it("takes no results without crashing", async () => {
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

        Enzyme.mount(<MemoryRouter>
            <FindPage {...props}/>
        </MemoryRouter>);

    });

    it("displays correct message", async () => {
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

        const page: Enzyme.ReactWrapper = Enzyme.mount(<MemoryRouter>
            <FindPage {...props}/>
        </MemoryRouter>);

        expect(page.find("div#findResults > div").text()).toEqual("Couldn't find any trays that match this query.");
        page.unmount();

    });


    it("displays the right number of find results", async () => {

        const [warehouse, , , results] = await newSetup;

        const mockSetQuery = jest.fn();
        const fullProps: FindPageProps = {
            warehouse: warehouse,
            find: results,
            setQuery: mockSetQuery,
            setCurrentView: jest.fn()
        };

        const page: Enzyme.ReactWrapper = Enzyme.mount(<MemoryRouter>
            <FindPage {...fullProps}/>
        </MemoryRouter>);

        expect(page.find("div#findResults > table > tbody > tr")).toHaveLength(warehouse.trays.length);
    });

});
