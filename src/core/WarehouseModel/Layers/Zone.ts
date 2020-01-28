import {Bay, Column, Shelf, Tray, Warehouse, WarehouseModel} from "../../WarehouseModel";
import {MiddleLayer} from "../LayerStructure/MiddleLayer";
import Utils from "../Utils";


interface ZoneFields {
    name: string;
    color: string;
}

export class Zone extends MiddleLayer<Warehouse, ZoneFields, Bay> {
    public readonly layerID: WarehouseModel = WarehouseModel.zone;
    public readonly childIndexed = true;
    public readonly collectionName = "zones";
    public readonly childCollectionName = "bays";

    /**
     * @param name - The name of the zone
     * @param color - The hex colour of the zone
     * @param parent - The parent warehouse
     */
    public static create(name: string, color: string, parent: Warehouse): Zone {
        return new Zone(Utils.generateRandomId(), {name, color}, parent);
    }

    /**
     * @param id - The database ID for the zone
     * @param fields - The zone fields
     * @param parent - The parent warehouse
     */
    public static createFromFields = (id: string, fields: unknown, parent: Warehouse): Zone =>
        new Zone(id, fields as ZoneFields, parent);

    public createChild = Bay.createFromFields;

    public toString(): string {
        return this.name;
    }

    //#region Field Getters and Setters
    public get name(): string {
        return this.fields.name;
    }

    public set name(name: string) {
        this.fields.name = name;
    }

    public get color(): string {
        return this.fields.color;
    }

    public set color(color: string) {
        this.fields.color = color;
    }

    //#endregion

    //#region Parent Getters
    public get parentWarehouse(): Warehouse {
        return this.parent;
    }

    //#endregion

    //#region Children Getters
    public get bays(): Bay[] {
        return this.children;
    }

    public get shelves(): Shelf[] {
        return this.bays.flatMap(bay => bay.shelves);
    }

    public get columns(): Column[] {
        return this.shelves.flatMap(shelf => shelf.columns);
    }

    public get trays(): Tray[] {
        return this.columns.flatMap(column => column.trays);
    }

    //#endregion
}