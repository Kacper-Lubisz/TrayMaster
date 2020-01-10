import {MiddleLayer} from "../LayerStructure/MiddleLayer";
import {Column, Shelf, Tray, Warehouse, WarehouseModel, Zone} from "../../WarehouseModel";
import Utils from "../Utils";

interface BayFields {
    index: number;
    name: string;
}

export class Bay extends MiddleLayer<Zone, BayFields, Shelf> {
    public readonly layerID: WarehouseModel = WarehouseModel.bay;
    public readonly collectionName = "bays";
    public readonly childCollectionName = "shelves";

    /**
     * @param name - The name of the bay
     * @param index - The (ordered) index of the bay within the zone
     * @param parent - The parent zone
     */
    public static create(index: number, name: string, parent: Zone): Bay {
        return new Bay(Utils.generateRandomId(), {index, name}, parent);
    }

    /**
     * @param id - The database ID for the bay
     * @param fields - The bay fields
     * @param parent - The parent zone
     */
    public static createFromFields(id: string, fields: unknown, parent: Zone): Bay {
        return new Bay(id, fields as BayFields, parent);
    }

    public toString(): string {
        return this.name;
    }

    // eslint-disable-next-line @typescript-eslint/unbound-method
    public createChild = Shelf.createFromFields;

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
    public get parentZone(): Zone {
        return this.parent;
    }

    public get parentWarehouse(): Warehouse {
        return this.parentZone.parentWarehouse;
    }

    //#endregion

    //#region Children Getters
    public get shelves(): Shelf[] {
        return this.children;
    }

    public get columns(): Column[] {
        return this.shelves.flatMap(shelf => shelf.columns);
    }

    public get trays(): Tray[] {
        return this.columns.flatMap(column => column.trays);
    }

    //#endregion
}