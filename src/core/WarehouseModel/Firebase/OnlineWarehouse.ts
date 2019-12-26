import {OnlineZone} from "./OnlineZone";
import {UpperLayer} from "../UpperLayer";
import {OnlineBay} from "./OnlineBay";
import {OnlineShelf} from "./OnlineShelf";
import {OnlineColumn} from "./OnlineColumn";
import {OnlineTray} from "./OnlineTray";
import DatabaseObject from "./DatabaseObject";
import {OnlineLayer} from "./OnlineLayer";
import {OnlineCategory} from "./OnlineCategory";


export class OnlineWarehouse extends OnlineLayer implements UpperLayer {
    isDeepLoaded: boolean = false;

    name: string;

    categories: OnlineCategory[] = [];
    zones: OnlineZone[] = [];

    /**
     * @param location firebase - The database path of the warehouse
     * @param name - The name of the warehouse
     */
    private constructor(location: string, name: string) {
        super(location);
        this.name = name;
    }

    /**
     * Create a warehouse from a collection of zones
     * @param zones - The zones to put in the warehouse
     * @param name - The name of the warehouse
     * @returns The newly created warehouse
     */
    public static create(zones: OnlineZone[], name?: string): OnlineWarehouse {
        const warehouse: OnlineWarehouse = new OnlineWarehouse("", name ?? "");
        warehouse.zones = zones;
        for (let i = 0; i < warehouse.zones.length; i++)
            warehouse.zones[i].placeInWarehouse(warehouse);
        return warehouse;
    }

    public async saveLayer(): Promise<void> {

    }

    /**
     * Load a whole warehouse corresponding to a given ID
     * @async
     * @param path - Database path of the warehouse to load
     * @returns A promise which resolves to the fully loaded warehouse
     */
    public static async loadWarehouse(path: string): Promise<OnlineWarehouse> {
        const warehouse: OnlineWarehouse = await DatabaseObject.loadObject<OnlineWarehouse>(path);
        warehouse.categories = await OnlineCategory.loadCategories(warehouse.getChildPath("categories"));
        warehouse.zones = await OnlineZone.loadZones(warehouse);
        return warehouse;
    }

    /**
     * Load a warehouse (without any zones) by ID
     * @async
     * @param path - Database path of the warehouse to load
     * @returns A promise which resolves to the flat warehouse
     */
    public static async loadFlatWarehouse(path: string): Promise<OnlineWarehouse> {
        const warehouse: OnlineWarehouse = await DatabaseObject.loadObject<OnlineWarehouse>(path);
        warehouse.categories = await OnlineCategory.loadCategories(warehouse.getChildPath("categories"));
        return warehouse;
    }

    /**
     * Load the zones into the warehouse
     * @async
     */
    public async loadNextLayer(): Promise<void> {
        if (!this.isDeepLoaded)
            this.zones = await OnlineZone.loadFlatZones(this);
        this.isDeepLoaded = true;
    }

    //#region Children Getters
    get bays(): OnlineBay[] {
        return this.zones.flatMap(zone => zone.bays);
    }

    get shelves(): OnlineShelf[] {
        return this.bays.flatMap(bay => bay.shelves);
    }

    get columns(): OnlineColumn[] {
        return this.shelves.flatMap(shelf => shelf.columns);
    }

    get trays(): OnlineTray[] {
        return this.columns.flatMap(column => column.trays);
    }
    //#endregion
}
