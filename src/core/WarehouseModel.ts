import {Warehouse} from "./WarehouseModel/Layers/Warehouse";
import {Zone} from "./WarehouseModel/Layers/Zone";
import {Bay} from "./WarehouseModel/Layers/Bay";
import {Shelf} from "./WarehouseModel/Layers/Shelf";
import {Column} from "./WarehouseModel/Layers/Column";
import {Tray} from "./WarehouseModel/Layers/Tray";
import Utils from "./WarehouseModel/Utils";

export const ONLINE = false;


export enum Layers {
    tray,
    column,
    shelf,
    bay,
    zone,
    warehouse
}

export const getRecursionCount = (currentLayer: Layers, targetLayer: Layers): number => currentLayer - targetLayer;

export interface ExpiryRange {
    from: number;
    to: number;
    label: string;
}

export interface TraySpace {
    column: Column;
    index: number;
}

export interface TraySize {
    label: string;
    sizeRatio: number;
}

export interface Category {
    name: string;
    shortName: string;
}


const zoneColors = [
    {name: "Red", color: "#ff0000"},
    {name: "Green", color: "#00ff00"},
    {name: "Blue", color: "#0000ff"},
    {name: "White", color: "#ffffff"},
    {name: "Black", color: "#000000"}
];

const trayExpiries: ExpiryRange[] = [
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
];


async function generateRandomWarehouse(id: string): Promise<void> {
    warehouse = await Warehouse.create(id, "Chester-le-Street").dfsLoad();
    for (let i = 0; i < zoneColors.length; i++) {
        const zone = Zone.create(zoneColors[i].name, zoneColors[i].color, warehouse);
        for (let j = 0; j < 3; j++) {
            const bay = Bay.create(j, String.fromCharCode(65 + i), zone);
            for (let k = 0; k < 3; k++) {
                const shelf = Shelf.create(k, `${k + 1}`, bay);
                for (let l = 0; l < 4; l++) {
                    const maxHeight = 2 + Math.round(3 * Math.random()),
                        column = Column.create(l, Utils.randItem(warehouse.traySizes), maxHeight, shelf);
                    for (let m = 0; m < 2 + Math.round((maxHeight - 2) * Math.random()); m++) {
                        column.trays.push(Tray.create(column, m, Utils.randItem(warehouse.categories),
                            Utils.randItem(trayExpiries), Number((15 * Math.random()).toFixed(2)),
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
}

export let warehouse: Warehouse, warehouseLoaded = false;

export async function loadWarehouse(id: string): Promise<Warehouse> {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (ONLINE) {
        warehouse = await Warehouse.create(id).load(Layers.tray);
    } else {
        await generateRandomWarehouse(id);
        //await warehouse.save(true, true, true).then(() => console.log("Done."));
    }
    warehouseLoaded = true;
    return warehouse;
}


export type TrayCell = Tray | TraySpace;
export {Warehouse} from "./WarehouseModel/Layers/Warehouse";
export {Zone} from "./WarehouseModel/Layers/Zone";
export {Bay} from "./WarehouseModel/Layers/Bay";
export {Shelf} from "./WarehouseModel/Layers/Shelf";
export {Column} from "./WarehouseModel/Layers/Column";
export {Tray} from "./WarehouseModel/Layers/Tray";
