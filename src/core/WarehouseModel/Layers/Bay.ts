import {MiddleLayer} from "../LayerStructure/MiddleLayer";
import {Column, Shelf, Tray, Warehouse, Zone} from "../../WarehouseModel";
import Utils from "../Utils";


interface BayFields {
    index: number;
    name: string;
}

export class Bay extends MiddleLayer<Zone, Bay, BayFields, Shelf> {
    public readonly collectionName = "bays";
    protected readonly childCollectionName = "shelves";

    public static create(index: number, name: string, parent: Zone): Bay {
        return new Bay(Utils.generateRandomId(), {index, name}, parent);
    }

    public static createFromFields(id: string, fields: unknown, parent: Zone): Bay {
        return new Bay(id, fields as BayFields, parent);
    }

    // eslint-disable-next-line @typescript-eslint/unbound-method
    protected createChild = Shelf.createFromFields;

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
    get parentZone(): Zone | undefined {
        return this.parent;
    }

    get parentWarehouse(): Warehouse | undefined {
        return this.parentZone?.parentWarehouse;
    }

    //#endregion

    //#region Children Getters
    get shelves(): Shelf[] {
        return this.children;
    }

    get columns(): Column[] {
        return this.shelves.flatMap(shelf => shelf.columns);
    }

    get trays(): Tray[] {
        return this.columns.flatMap(column => column.trays);
    }

    //#endregion
}