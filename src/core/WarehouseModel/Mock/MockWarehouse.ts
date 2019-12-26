import {MockZone} from "./MockZone";
import {UpperLayer} from "../UpperLayer";
import {MockBay} from "./MockBay";
import {MockShelf} from "./MockShelf";
import {MockColumn} from "./MockColumn";
import {MockTray} from "./MockTray";
import {MockCategory} from "./MockCategory";


export class MockWarehouse implements UpperLayer {
    isDeepLoaded: boolean = false;

    name: string;

    categories: MockCategory[] = [];
    zones: MockZone[] = [];

    /**
     * @param name - The name of the warehouse
     */
    private constructor(name: string) {
        this.name = name;
    }

    /**
     * Create a warehouse from a collection of zones
     * @param zones - The zones to put in the warehouse
     * @param name - The name of the warehouse
     * @returns The newly created warehouse
     */
    public static create(zones: MockZone[], name?: string): MockWarehouse {
        const warehouse: MockWarehouse = new MockWarehouse(name ?? "");
        warehouse.zones = zones;
        for (let i = 0; i < warehouse.zones.length; i++)
            warehouse.zones[i].placeInWarehouse(warehouse);
        return warehouse;
    }

    /**
     * Load a whole warehouse corresponding to a given ID
     * @async
     * @returns A promise which resolves to the fully loaded warehouse
     */
    public static async loadWarehouse(): Promise<MockWarehouse> {
        const warehouse: MockWarehouse = new MockWarehouse(`Warehouse ${Math.random()}`);
        warehouse.categories = await MockCategory.loadCategories();
        warehouse.zones = await MockZone.loadZones(warehouse);
        warehouse.isDeepLoaded = true;
        return warehouse;
    }

    /**
     * Load a warehouse (without any zones) by ID
     * @async
     * @returns A promise which resolves to the flat warehouse
     */
    public static async loadFlatWarehouse(): Promise<MockWarehouse> {
        const warehouse: MockWarehouse = new MockWarehouse(`Warehouse ${Math.random()}`);
        warehouse.categories = await MockCategory.loadCategories();
        return warehouse;
    }

    /**
     * Load the zones into the warehouse
     * @async
     */
    public async loadNextLayer(): Promise<void> {
        if (!this.isDeepLoaded)
            this.zones = await MockZone.loadFlatZones(this);
        this.isDeepLoaded = true;
    }

    //#region Children Getters
    get bays(): MockBay[] {
        return this.zones.flatMap(zone => zone.bays);
    }

    get shelves(): MockShelf[] {
        return this.bays.flatMap(bay => bay.shelves);
    }

    get columns(): MockColumn[] {
        return this.shelves.flatMap(shelf => shelf.columns);
    }

    get trays(): MockTray[] {
        return this.columns.flatMap(column => column.trays);
    }

    //#endregion
}
