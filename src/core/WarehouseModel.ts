import {Column} from "./WarehouseModel/Column";
import {Tray} from "./WarehouseModel/Tray";

export const ONLINE: boolean = false;


export interface ExpiryRange {
    from: number;
    to: number;
    label: string;
}


export interface TraySize {
    label: string;
    sizeRatio: number;
}


export interface TraySpace {
    column: Column;
    index: number;
}

export type TrayCell = Tray | TraySpace;
export {Warehouse} from "./WarehouseModel/Warehouse";
export {Zone} from "./WarehouseModel/Zone";
export {Bay} from "./WarehouseModel/Bay";
export {Shelf} from "./WarehouseModel/Shelf";
export {Column} from "./WarehouseModel/Column";
export {Tray} from "./WarehouseModel/Tray";
export {Category} from "./WarehouseModel/Category";
