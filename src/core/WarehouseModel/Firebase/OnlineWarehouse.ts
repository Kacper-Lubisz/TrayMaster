import {OnlineZone} from "./OnlineZone";
import {UpperLayer} from "../UpperLayer";
import {OnlineBay} from "./OnlineBay";
import {OnlineShelf} from "./OnlineShelf";
import {OnlineColumn} from "./OnlineColumn";
import {OnlineTray} from "./OnlineTray";
import {Category} from "../Category";
import {Utils} from "../../Utils";

const cats = [
    "Baby Care", "Baby Food", "Nappies", "Beans", "Biscuits", "Cereal", "Choc/Sweet", "Coffee", "Cleaning", "Custard",
    "Feminine Hygiene", "Fish", "Fruit", "Fruit Juice", "Hot Choc", "Instant Meals", "Jam", "Meat", "Milk", "Misc",
    "Pasta", "Pasta Sauce", "Pet Food", "Potatoes", "Rice", "Rice Pud.", "Savoury Treats", "Soup", "Spaghetti",
    "Sponge Pud.", "Sugar", "Tea Bags", "Toiletries", "Tomatoes", "Vegetables", "Christmas"
];

export class OnlineWarehouse implements UpperLayer {
    isDeepLoaded: boolean = false;

    id: string;
    name: string;

    categories: Category[] = [];
    zones: OnlineZone[] = [];

    /**
     * @param id firebase - The database ID of the warehouse
     * @param name - The name of the warehouse
     */
    private constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }

    /**
     * Create a warehouse from a collection of zones
     * @param zones - The zones to put in the warehouse
     * @param name - The name of the warehouse
     * @returns The newly created warehouse
     */
    public static create(zones: OnlineZone[], name?: string): OnlineWarehouse {
        const warehouse: OnlineWarehouse = new OnlineWarehouse(Utils.generateRandomId(), name ?? "");
        warehouse.zones = zones;
        for (let i = 0; i < warehouse.zones.length; i++)
            warehouse.zones[i].placeInWarehouse(warehouse);
        return warehouse;
    }

    /**
     * Load tray categories.
     * @async
     * @returns A promise which resolves to the list of categories in the warehouse
     */
    public static async loadCategories(): Promise<Category[]> {
        const categories: Category[] = [];
        for (let i = 0; i < cats.length; i++)
            categories.push({name: cats[i]});
        return categories;
    }

    /**
     * Load a whole warehouse corresponding to a given ID
     * @async
     * @param id - Database ID of the warehouse to load
     * @returns A promise which resolves to the fully loaded warehouse
     */
    public static async loadWarehouse(id: string): Promise<OnlineWarehouse> {
        const warehouse: OnlineWarehouse = new OnlineWarehouse(id, `Warehouse ${Math.random()}`);
        warehouse.zones = await OnlineZone.loadZones(warehouse);
        warehouse.categories = await OnlineWarehouse.loadCategories();
        warehouse.isDeepLoaded = true;
        return warehouse;
    }

    /**
     * Load a warehouse (without any zones) by ID
     * @async
     * @param id
     * @returns A promise which resolves to the flat warehouse
     */
    public static async loadFlatWarehouse(id: string): Promise<OnlineWarehouse> {
        const warehouse: OnlineWarehouse = new OnlineWarehouse(id, `Warehouse ${Math.random()}`);
        warehouse.categories = await OnlineWarehouse.loadCategories();
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
