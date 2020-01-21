import {Warehouse} from "./WarehouseModel/Layers/Warehouse";
import {Zone} from "./WarehouseModel/Layers/Zone";
import {Bay} from "./WarehouseModel/Layers/Bay";
import {Shelf} from "./WarehouseModel/Layers/Shelf";
import {Column} from "./WarehouseModel/Layers/Column";
import {Tray} from "./WarehouseModel/Layers/Tray";
import Utils from "./WarehouseModel/Utils";
import database, {DatabaseDocument, ONLINE} from "./WarehouseModel/Database";

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
    column: Column;
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
    {name: "Red", color: "#ff0000"},
    {name: "Green", color: "#00ff00"},
    {name: "Blue", color: "#0000ff"},
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
        from: new Date(2020, 1).getTime(),
        to: new Date(2020, 2).getTime(),
        label: "Jan 2020"
    },
    {
        from: new Date(2020, 2).getTime(),
        to: new Date(2020, 3).getTime(),
        label: "Feb 2020"
    },
    {
        from: new Date(2020, 1).getTime(),
        to: new Date(2020, 4).getTime(),
        label: "Jan-Mar 2020"
    },
    {
        from: new Date(2020, 4).getTime(),
        to: new Date(2020, 7).getTime(),
        label: "Apr-Jun 2020"
    },
    {
        from: new Date(2020, 1).getTime(),
        to: new Date(2021, 1).getTime(),
        label: "2020"
    },
    {
        from: new Date(2021, 1).getTime(),
        to: new Date(2022, 1).getTime(),
        label: "2021"
    },
].concat(Array(20).fill(0).map(_ => {
    const j = Math.floor(Math.random() * 10);
    return {
        from: new Date(2020 + j, 1).getTime(),
        to: new Date(2022, 1).getTime(),
        label: (2020 + j).toString()
    };
}));

/**
 * Generate a random warehouse structure down to tray level
 * @async
 * @param id - The ID of the warehouse
 */
async function generateRandomWarehouse(id: string): Promise<Warehouse> {
    const warehouse = await Warehouse.create(id, "Chester-le-Street").loadDepthFirst();

    for (const zoneColor of zoneColors) {
        const zone = Zone.create(zoneColor.name, zoneColor.color, warehouse);

        for (let j = 0; j < 3; j++) {
            const bay = Bay.create(j, String.fromCharCode(65 + j), zone);

            for (let k = 0; k < 3; k++) {
                const shelf = Shelf.create(k, `${k + 1}`, bay, k === 1);

                for (let l = 0; l < 4; l++) {
                    const maxHeight = 2 + Math.round(3 * Math.random()),
                        column = Column.create(l, Utils.randItem(warehouse.traySizes), maxHeight, shelf);

                    for (let m = 0; m < 2 + Math.round((maxHeight - 2) * Math.random()); m++) {

                        const category = Math.random() < 0.25 ? undefined : Utils.randItem(warehouse.categories);
                        const expiry = Math.random() < 0.25 ? undefined : Utils.randItem(trayExpires);
                        const weight = Math.random() < 0.25 ? undefined :
                                       Number((15 * Math.random()).toFixed(2));

                        column.trays.push(Tray.create(column, m, category, expiry, weight,
                            Math.random() < 0.1 ? "This is a custom field, it might be very long" : undefined));

                    }
                    shelf.columns.push(column);
                }
                bay.shelves.push(shelf);
            }
            zone.bays.push(bay);
        }
        warehouse.zones.push(zone);
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
    private static currentWarehouseId = "";

    public static get currentWarehouse(): Warehouse {
        return WarehouseManager.warehouses[WarehouseManager.currentWarehouseId];
    }

    public static get warehouseList(): Warehouse[] {
        return Object.values(WarehouseManager.warehouses);
    }

    /**
     * Load the warehouses
     */
    public static async loadWarehouses(): Promise<Warehouse[]> {
        if (ONLINE) {
            const warehouseDocuments: DatabaseDocument<unknown>[] = await database.loadCollection<unknown>("warehouses");
            for (const warehouseDocument of warehouseDocuments) {
                WarehouseManager.warehouses[warehouseDocument.id] =
                    Warehouse.createFromFields(warehouseDocument.id, warehouseDocument.fields);
            }
        } else {
            WarehouseManager.warehouses["MOCK-WAREHOUSE"] = await generateRandomWarehouse("MOCK-WAREHOUSE");
        }
        return WarehouseManager.warehouseList;
    }

    /**
     * Load a warehouse
     * @async
     * @param name - The name of the warehouse to load
     * @returns The loaded warehouse
     */
    public static async loadWarehouse(name: string): Promise<Warehouse | undefined> {
        for (const [id, warehouse] of Object.entries(WarehouseManager.warehouses)) {
            if (warehouse.name === name) {
                return WarehouseManager.loadWarehouseByID(id);
            }
        }
    }

    public static async loadWarehouseByID(id: string): Promise<Warehouse | undefined> {
        if (typeof WarehouseManager.warehouses[id] === "undefined") {
            return;
        }
        return WarehouseManager.warehouses[id].load(WarehouseModel.tray);
    }
}


export type TrayCell = Tray | TraySpace;
export {Warehouse} from "./WarehouseModel/Layers/Warehouse";
export {Zone} from "./WarehouseModel/Layers/Zone";
export {Bay} from "./WarehouseModel/Layers/Bay";
export {Shelf} from "./WarehouseModel/Layers/Shelf";
export {Column} from "./WarehouseModel/Layers/Column";
export {Tray} from "./WarehouseModel/Layers/Tray";
