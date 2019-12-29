import {Zone} from "./Zone";
import {UpperLayer} from "./UpperLayer";
import {Bay} from "./Bay";
import {Shelf} from "./Shelf";
import {Column} from "./Column";
import {Tray, TraySize} from "./Tray";
import {Category} from "./Category";
import {Utils} from "./Utils";
import {ONLINE} from "../WarehouseModel";


export class Warehouse extends UpperLayer {
    name: string;

    traySizes: TraySize[] = [];
    categories: Category[] = [];
    zones: Zone[] = [];

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
    public static create(zones: Zone[], name?: string): Warehouse {
        const warehouse: Warehouse = new Warehouse("", name ?? "");
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
    public static async loadWarehouse(path: string): Promise<Warehouse> {
        if (ONLINE) {
            const warehouse: Warehouse = await this.loadObject<Warehouse>(path);
            warehouse.categories = await Category.loadCategories(warehouse);
            warehouse.traySizes = await Tray.loadTraySizes();
            warehouse.zones = await Zone.loadZones(warehouse);
            warehouse.isDeepLoaded = true;
            return warehouse;
        } else {
            const warehouse: Warehouse = new Warehouse(Utils.generateRandomId(), `Warehouse ${Math.random()}`);
            warehouse.categories = await Category.loadCategories(warehouse);
            warehouse.traySizes = await Tray.loadTraySizes();
            warehouse.zones = await Zone.loadZones(warehouse);
            warehouse.isDeepLoaded = true;
            return warehouse;
        }
    }

    /**
     * Load a warehouse (without any zones) by ID
     * @async
     * @param path - Database path of the warehouse to load
     * @returns A promise which resolves to the flat warehouse
     */
    public static async loadFlatWarehouse(path: string): Promise<Warehouse> {
        if (ONLINE) {
            const warehouse: Warehouse = await this.loadObject<Warehouse>(path);
            warehouse.categories = await Category.loadCategories(warehouse);
            warehouse.traySizes = await Tray.loadTraySizes();
            return warehouse;
        } else {
            const warehouse: Warehouse = new Warehouse(Utils.generateRandomId(), `Warehouse ${Math.random()}`);
            warehouse.categories = await Category.loadCategories(warehouse);
            warehouse.traySizes = await Tray.loadTraySizes();
            return warehouse;
        }
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
