import {Zone} from "./Zone";
import {UpperLayer} from "./UpperLayer";
import {Bay} from "./Bay";
import {Shelf} from "./Shelf";
import {Column} from "./Column";
import {Tray} from "./Tray";
import {Category} from "./Category";
import {Utils} from "../Utils";

const cats = [
    "Baby Care", "Baby Food", "Nappies", "Beans", "Biscuits", "Cereal", "Choc/Sweet", "Coffee", "Cleaning", "Custard",
    "Feminine Hygiene", "Fish", "Fruit", "Fruit Juice", "Hot Choc", "Instant Meals", "Jam", "Meat", "Milk", "Misc",
    "Pasta", "Pasta Sauce", "Pet Food", "Potatoes", "Rice", "Rice Pud.", "Savoury Treats", "Soup", "Spaghetti",
    "Sponge Pud.", "Sugar", "Tea Bags", "Toiletries", "Tomatoes", "Vegetables", "Christmas"
];


export class Warehouse implements UpperLayer {
    isDeepLoaded: boolean = false;

    id: string;
    name: string;

    categories: Category[] = [];
    zones: Zone[] = [];

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
    public static create(zones: Zone[], name?: string): Warehouse {
        const warehouse: Warehouse = new Warehouse(Utils.generateRandomId(), name ?? "");
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
    public static async loadWarehouse(id: string): Promise<Warehouse> {
        const warehouse: Warehouse = new Warehouse(id, `Warehouse ${Math.random()}`);
        warehouse.zones = await Zone.loadZones(warehouse);
        warehouse.categories = await Warehouse.loadCategories();
        warehouse.isDeepLoaded = true;
        return warehouse;
    }

    /**
     * Load a warehouse (without any zones) by ID
     * @async
     * @param id
     * @returns A promise which resolves to the flat warehouse
     */
    public static async loadFlatWarehouse(id: string): Promise<Warehouse> {
        const warehouse: Warehouse = new Warehouse(id, `Warehouse ${Math.random()}`);
        warehouse.categories = await Warehouse.loadCategories();
        return warehouse;
    }

    /**
     * Load the zones into the warehouse
     * @async
     */
    public async loadNextLayer(): Promise<void> {
        if (!this.isDeepLoaded)
            this.zones = await Zone.loadFlatZones(this);
        this.isDeepLoaded = true;
    }

    //#region Children Getters
    get bays(): Bay[] {
        return this.zones.flatMap(zone => zone.bays);
    }

    get shelves(): Shelf[] {
        return this.bays.flatMap(bay => bay.shelves);
    }

    get columns(): Column[] {
        return this.shelves.flatMap(shelf => shelf.columns);
    }

    get trays(): Tray[] {
        return this.columns.flatMap(column => column.trays);
    }

    //#endregion
}
