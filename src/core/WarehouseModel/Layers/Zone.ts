import {MiddleLayer} from "../LayerStructure/MiddleLayer";
import {Bay, Column, Shelf, Tray, Warehouse} from "../../WarehouseModel";
import database from "../Database";
import Utils from "../Utils";


interface ZoneFields {
    name: string;
    color: string;
}

export class Zone extends MiddleLayer<Warehouse, Zone, ZoneFields, Bay> {
    public readonly collectionName = "zones";
    protected readonly childCollectionName = "bays";

    public static create(name: string, color: string, parent: Warehouse): Zone {
        return new Zone(Utils.generateRandomId(), {name, color}, parent);
    }

    public static createFromFields(id: string, fields: unknown, parent: Warehouse): Zone {
        return new Zone(id, fields as ZoneFields, parent);
    }

    // eslint-disable-next-line @typescript-eslint/unbound-method
    protected createChild = Bay.createFromFields;

    protected async saveLayer(forceSave = false): Promise<void> {
        if (this.changed || forceSave) {
            await database().set(this.path, this.fields);
            this.fieldsSaved();
        }
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
    get parentWarehouse(): Warehouse | undefined {
        return this.parent;
    }

    //#endregion

    //#region Children Getters
    get bays(): Bay[] {
        return this.children;
    }

    get shelves(): Shelf[] {
        return this.bays.flatMap(bay => bay.shelves);
    }

    get columns(): Column[] {
        return this.shelves.flatMap(shelf => shelf.columns);
    }

    get trays(): Tray[] {
        return this.columns.flatMap(column => column.trays);
    }

    //#endregion
}