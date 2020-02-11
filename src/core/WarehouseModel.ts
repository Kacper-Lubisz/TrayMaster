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
    index: number;
    parentColumn: Column;
}

/**
 * Represents a single tray size option
 */
export interface TraySize {
    index: number;
    label: string;
    sizeRatio: number;
}

/**
 * Represents a single tray category
 */
export interface Category {
    index: number;
    name: string;
    shortName: string | null;
}

/**
 * Mock warehouse aisle zones
 */
const aisleZones = [
    {name: "White", color: "#ffffff"},
    {name: "Yellow", color: "#f0e68c"},
    {name: "Green", color: "#4caf50"},
    {name: "Blue", color: "#2196f3"},
];

/**
 * Mock warehouse aisle end zones
 */
const endZones = [
    {name: "Red", color: "#f44336"},
    {name: "Pink", color: "#ff69b4"},
];

// Ignoring street zones

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
        to: new Date(2023 + j, 0).getTime(),
        label: (2022 + j).toString()
    };
}));

/**
 * Generate a random warehouse structure down to tray level
 * @async
 * @param id - The ID of the warehouse
 * @param name - The name of the new warehouse
 */
async function generateRandomWarehouse(id: string, name: string): Promise<Warehouse> {
    const warehouse = await Warehouse.create(id, name).load();

    for (const zoneFields of aisleZones) {
        const zone = Zone.create(zoneFields.name, zoneFields.color, warehouse);

        for (let j = 0; j < 5; j++) {
            const bay = Bay.create(String.fromCharCode(65 + j), zone);

            for (let k = 0; k < 5; k++) {
                const shelf = Shelf.create(`${k + 1}`, k === 1, bay);

                for (let l = 0; l < 4; l++) {
                    const column = Column.create(warehouse.defaultTraySize, 3, shelf);

                    for (let m = 0; m < 3; m++) {
                        makeRandomTray(column);
                    }
                }
            }
        }
    }

    for (const zoneFields of endZones) {
        const zone = Zone.create(zoneFields.name, zoneFields.color, warehouse);

        for (let j = 0; j < 2; j++) {
            const bay = Bay.create(String.fromCharCode(65 + j), zone);

            for (let k = 0; k < 4; k++) {
                const shelf = Shelf.create(`${k + 1}`, false, bay);

                for (let l = 0; l < 4; l++) {
                    const column = Column.create(warehouse.defaultTraySize, 3, shelf);

                    for (let m = 0; m < 3; m++) {
                        makeRandomTray(column);
                    }
                }
            }
        }
    }

    function makeRandomTray(parentColumn: Column): void {
        const category = Math.random() < 0.25 ? undefined : Utils.randItem(warehouse.categories);
        const expiry = Math.random() < 0.25 ? undefined : Utils.randItem(trayExpires);
        const weight = Math.random() < 0.25 ? undefined :
                       Number((15 * Math.random()).toFixed(2));

        Tray.create(parentColumn, category, expiry, weight,
            Math.random() < 0.1 ? "This is a custom comment, it might be very long" : undefined);
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
            const warehouseNames = ["Chester-le-Street", "Sunderland"];
            for (let i = 0; i < warehouseNames.length; i++) {
                const id = `MOCK_WAREHOUSE_${i}`;
                this.warehouses[id] = await generateRandomWarehouse(id, warehouseNames[i]);
                //await this.warehouses[id].stage(true, true, WarehouseModel.tray);
            }
        }
        return this.warehouseList;
    }

    public static async loadWarehouse(warehouse: Warehouse): Promise<Warehouse> {
        return await warehouse.load(false, WarehouseModel.shelf);
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
