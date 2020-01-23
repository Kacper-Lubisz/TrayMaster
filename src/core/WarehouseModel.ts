import firebase, {ONLINE} from "./Firebase";
import {DatabaseDocument} from "./Firebase/Database";
import {Bay} from "./WarehouseModel/Layers/Bay";
import {Column} from "./WarehouseModel/Layers/Column";
import {Shelf} from "./WarehouseModel/Layers/Shelf";
import {Tray} from "./WarehouseModel/Layers/Tray";
import {Warehouse} from "./WarehouseModel/Layers/Warehouse";
import {Zone} from "./WarehouseModel/Layers/Zone";
import Utils from "./WarehouseModel/Utils";

/**
 * Represents the order of (and IDs of) each layer in the warehouse model
 */
export enum WarehouseModel {
    tray,
    column,
    shelf,
    bay,
    zone,
    warehouse
}

/**
 * Represents a tray expiry range
 */
export interface ExpiryRange {
    from: number | null;
    to: number | null;
    label: string;
}

/**
 * Represents a tray space within a column
 */
export interface TraySpace {
    parentColumn: Column;
    index: number;
}

/**
 * Represents a single tray size option
 */
export interface TraySize {
    label: string;
    sizeRatio: number;
}

/**
 * Represents a single tray category
 */
export interface Category {
    name: string;
    shortName: string | null;
}

/**
 * Mock warehouse zone colours
 */
const zoneColors = [
    {name: "Red", color: "#f44336"},
    {name: "Green", color: "#4caf50"},
    {name: "Blue", color: "#2196f3"},
    {name: "White", color: "#ffffff"},
    {name: "Black", color: "#000000"}
];

/**
 * Mock warehouse tray expiries
 */
const trayExpires: ExpiryRange[] = [
    {
        from: null,
        to: null,
        label: "Indefinite"
    },
    {
        from: new Date(2020, 0).getTime(),
        to: null,
        label: "After Jan 2020"
    },
    {
        from: null,
        to: new Date(2020, 0).getTime(),
        label: "Before Jan 2020"
    },
    {
        from: new Date(2020, 0).getTime(),
        to: new Date(2020, 1).getTime(),
        label: "Jan 2020"
    },
    {
        from: new Date(2020, 1).getTime(),
        to: new Date(2020, 2).getTime(),
        label: "Feb 2020"
    },
    {
        from: new Date(2020, 0).getTime(),
        to: new Date(2020, 3).getTime(),
        label: "Jan-Mar 2020"
    },
    {
        from: new Date(2020, 3).getTime(),
        to: new Date(2020, 6).getTime(),
        label: "Apr-Jun 2020"
    },
    {
        from: new Date(2020, 0).getTime(),
        to: new Date(2021, 0).getTime(),
        label: "2020"
    },
    {
        from: new Date(2021, 0).getTime(),
        to: new Date(2022, 0).getTime(),
        label: "2021"
    },
].concat(Array(10).fill(0).map((_, j) => {
    return {
        from: new Date(2022 + j, 0).getTime(),
        to: new Date(2022 + j, 0).getTime(),
        label: (2020 + j).toString()
    };
}));

/**
 * Generate a random warehouse structure down to tray level
 * @async
 * @param id - The ID of the warehouse
 * @param name - The name of the new warehouse
 * @param randomMaxColumnHeight - Generate random maximum column heights per column
 */
async function generateRandomWarehouse(id: string, name: string, randomMaxColumnHeight = false): Promise<Warehouse> {
    const warehouse = await Warehouse.create(id, name).loadDepthFirst();

    for (const zoneColor of zoneColors) {
        const zone = Zone.create(zoneColor.name, zoneColor.color, warehouse);

        for (let j = 0; j < 3; j++) {
            const bay = Bay.create(j, String.fromCharCode(65 + j), zone);

            for (let k = 0; k < 3; k++) {
                const shelf = Shelf.create(k, `${k + 1}`, k === 1, bay);

                for (let l = 0; l < 4; l++) {
                    const maxHeight = randomMaxColumnHeight ? 2 + Math.round(3 * Math.random()) : 3,
                        column = Column.create(l, warehouse.defaultTraySize, maxHeight, shelf);

                    for (let m = 0; m < 2 + Math.round((maxHeight - 2) * Math.random()); m++) {
                        const category = Math.random() < 0.25 ? undefined : Utils.randItem(warehouse.categories);
                        const expiry = Math.random() < 0.25 ? undefined : Utils.randItem(trayExpires);
                        const weight = Math.random() < 0.25 ? undefined :
                                       Number((15 * Math.random()).toFixed(2));

                        Tray.create(column, m, category, expiry, weight,
                            Math.random() < 0.1 ? "This is a custom comment, it might be very long" : undefined);

                    }
                }
            }
        }
    }
    return warehouse;
}

/**
 * The active instances of the warehouses
 */
interface Warehouses {
    [id: string]: Warehouse;
}

export class WarehouseManager {
    private static readonly warehouses: Warehouses = {};

    public static get warehouseList(): Warehouse[] {
        return Object.values(this.warehouses);
    }

    /**
     * Load the warehouses
     */
    public static async loadWarehouses(): Promise<Warehouse[]> {
        if (ONLINE) {
            const warehouseDocuments: DatabaseDocument<unknown>[] = await firebase.database.loadCollection<unknown>("warehouses");
            for (const warehouseDocument of warehouseDocuments) {
                this.warehouses[warehouseDocument.id] =
                    Warehouse.createFromFields(warehouseDocument.id, warehouseDocument.fields);
            }
        } else {
            const warehouseNames = ["Chester-le-Street", "Durham", "Newcastle"];
            for (let i = 0; i < warehouseNames.length; i++) {
                const id = `MOCK_WAREHOUSE_${i}`;
                this.warehouses[id] = await generateRandomWarehouse(id, warehouseNames[i]);
                //await this.warehouses[id].stage(true, true, WarehouseModel.tray);
            }
        }
        return this.warehouseList;
    }

    public static async loadWarehouse(warehouse: Warehouse): Promise<Warehouse> {
        return await warehouse.load(WarehouseModel.tray);
    }

    /**
     * Load a warehouse by its database ID
     * @async
     * @param id - The database ID of the warehouse to load
     * @returns The loaded warehouse
     */
    public static async loadWarehouseByID(id: string): Promise<Warehouse | undefined> {
        return typeof WarehouseManager.warehouses[id] === "undefined" ? undefined
                                                                      : await this.loadWarehouse(this.warehouses[id]);
    }
}


export type TrayCell = Tray | TraySpace;
export {Warehouse} from "./WarehouseModel/Layers/Warehouse";
export {Zone} from "./WarehouseModel/Layers/Zone";
export {Bay} from "./WarehouseModel/Layers/Bay";
export {Shelf} from "./WarehouseModel/Layers/Shelf";
export {Column} from "./WarehouseModel/Layers/Column";
export {Tray} from "./WarehouseModel/Layers/Tray";
