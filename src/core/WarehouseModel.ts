import {Column} from "./WarehouseModel/Layers/Column";
import {Tray} from "./WarehouseModel/Layers/Tray";

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
export {Warehouse} from "./WarehouseModel/Layers/Warehouse";
export {Zone} from "./WarehouseModel/Layers/Zone";
export {Bay} from "./WarehouseModel/Layers/Bay";
export {Shelf} from "./WarehouseModel/Layers/Shelf";
export {Column} from "./WarehouseModel/Layers/Column";
export {Tray} from "./WarehouseModel/Layers/Tray";
export {Category} from "./WarehouseModel/Category";
