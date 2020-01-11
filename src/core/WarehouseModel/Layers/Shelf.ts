import {MiddleLayer} from "../LayerStructure/MiddleLayer";
import {Bay, Column, Tray, Warehouse, WarehouseModel, Zone} from "../../WarehouseModel";
import Utils from "../Utils";

interface ShelfFields {
    index: number;
    name: string;
    isPickingArea: boolean;
}

export class Shelf extends MiddleLayer<Bay, ShelfFields, Column> {
    public readonly layerID: WarehouseModel = WarehouseModel.shelf;
    public readonly collectionName = "shelves";
    public readonly childCollectionName = "columns";

    protected constructor(id: string, fields: ShelfFields, parent: Bay) {
        super(id, fields, parent);
        this.childLoadComplete = () => this.children.sort((a, b) => a.index - b.index);
    }

    /**
     * @param index - The (ordered) index of the shelf within the bay
     * @param name - The name of the shelf
     * @param isPickingArea - true if in picking area
     * @param parent - The parent bay
     */
    public static create(index: number, name: string, isPickingArea: boolean, parent: Bay): Shelf {
        return new Shelf(Utils.generateRandomId(), {index, name, isPickingArea}, parent);
    }

    /**
     * @param id - The database ID for the shelf
     * @param fields - The shelf fields
     * @param parent - The parent bay
     */
    public static createFromFields = (id: string, fields: unknown, parent: Bay): Shelf =>
        new Shelf(id, fields as ShelfFields, parent);

    public createChild = Column.createFromFields;

    public toString(): string {
        return `${this.parentZone.toString()} ${this.parentBay.toString()}${this.name}`;
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
    public get parentBay(): Bay {
        return this.parent;
    }

    public get parentZone(): Zone {
        return this.parentBay.parentZone;
    }

    public get parentWarehouse(): Warehouse {
        return this.parentZone.parentWarehouse;
    }

    //#endregion

    //#region Children Getters
    public get columns(): Column[] {
        return this.children;
    }

    public get trays(): Tray[] {
        return this.columns.flatMap(column => column.trays);
    }

    //#endregion
}