import {MiddleLayer} from "../LayerStructure/MiddleLayer";
import {Bay, Column, Tray, Warehouse, Zone} from "../../WarehouseModel";
import Utils from "../Utils";


interface ShelfFields {
    index: number;
    name: string;
}

export class Shelf extends MiddleLayer<Bay, Shelf, ShelfFields, Column> {
    public readonly layerID: number = 2;
    public readonly collectionName = "shelves";
    public readonly childCollectionName = "columns";

    public static create(index: number, name: string, parent: Bay): Shelf {
        return new Shelf(Utils.generateRandomId(), {index, name}, parent);
    }

    public static createFromFields(id: string, fields: unknown, parent: Bay): Shelf {
        return new Shelf(id, fields as ShelfFields, parent);
    }

    // eslint-disable-next-line @typescript-eslint/unbound-method
    public createChild = Column.createFromFields;

    public toString(): string {
        return `${this.parentZone?.toString()} ${this.parentBay?.toString()}${this.name}`;
    }

    //#region Field Getters and Setters
    public get index(): number {
        return this.fields.index;
    }

    public set index(index: number) {
        this.fields.index = index;
    }

    public get name(): string {
        return this.fields.name;
    }

    public set name(name: string) {
        this.fields.name = name;
    }

    //#endregion

    //#region Parent Getters
    get parentBay(): Bay {
        return this.parent;
    }

    get parentZone(): Zone {
        return this.parentBay.parentZone;
    }

    get parentWarehouse(): Warehouse {
        return this.parentZone.parentWarehouse;
    }

    //#endregion

    //#region Children Getters
    get columns(): Column[] {
        return this.children;
    }

    get trays(): Tray[] {
        return this.columns.flatMap(column => column.trays);
    }

    //#endregion
}