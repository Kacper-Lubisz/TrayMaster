import {BottomLayer} from "../LayerStructure/BottomLayer";
import {Bay, Category, Column, ExpiryRange, Shelf, Warehouse, WarehouseModel, Zone} from "../../WarehouseModel";
import Utils from "../Utils";

interface TrayFields {
    index: number;
    categoryId: string;
    expiry: ExpiryRange | null;
    weight: number | null;
    comment: string | null;
}

export class Tray extends BottomLayer<Column, TrayFields> {
    public readonly layerID: WarehouseModel = WarehouseModel.tray;
    public readonly collectionName = "trays";

    /**
     * @param parent - The (nullable) parent column
     * @param index - The index of the tray within the column
     * @param category - The tray's (nullable) category
     * @param expiry - The tray's (nullable) expiry range
     * @param weight - The tray's (nullable) weight
     * @param comment - The tray's (nullable) custom field
     */
    public static create(parent: Column, index: number, category?: Category, expiry?: ExpiryRange, weight?: number,
                         comment?: string
    ): Tray {
        return new Tray(Utils.generateRandomId(), {
            index,
            categoryId: parent.parentWarehouse.getCategoryID(category),
            expiry: expiry ?? null,
            weight: weight ?? null,
            comment: comment ?? null
        }, parent);
    }

    /**
     * @param id - The database ID for the tray
     * @param fields - The tray fields
     * @param parent - The parent column
     */
    public static createFromFields = (id: string, fields: unknown, parent: Column): Tray =>
        new Tray(id, fields as TrayFields, parent);

    public toString(): string {
        return `Tray(${this.index}, ${this.category?.name}, ${this.expiry?.label}, ${this.weight} kg, "${this.comment}")`;
    }

    //#region Field Getters and Setters
    public get index(): number {
        return this.fields.index;
    }

    public set index(index: number) {
        this.fields.index = index;
    }

    public get category(): Category | undefined {
        return this.parentWarehouse.getCategoryByID(this.fields.categoryId);
    }

    public set category(category: Category | undefined) {
        this.fields.categoryId = this.parentWarehouse.getCategoryID(category);
    }

    public get expiry(): ExpiryRange | undefined {
        return this.fields.expiry ?? undefined;
    }

    public set expiry(expiry: ExpiryRange | undefined) {
        this.fields.expiry = expiry ?? null;
    }

    public get weight(): number | undefined {
        return this.fields.weight ?? undefined;
    }

    public set weight(weight: number | undefined) {
        this.fields.weight = weight ?? null;
    }

    public get comment(): string | undefined {
        return this.fields.comment ?? undefined;
    }

    public set comment(comment: string | undefined) {
        this.fields.comment = comment ?? null;
    }

    //#endregion

    //#region Parent Getters
    public get parentColumn(): Column {
        return this.parent;
    }

    public get parentShelf(): Shelf {
        return this.parentColumn.parentShelf;
    }

    public get parentBay(): Bay {
        return this.parentShelf.parentBay;
    }

    public get parentZone(): Zone {
        return this.parentBay.parentZone;
    }

    public get parentWarehouse(): Warehouse {
        return this.parentZone.parentWarehouse;
    }

    //#endregion

    //region derived properties
    public get locationString(): string {
        return `${
            this.parentZone.indexInParent
        }_${
            this.parentBay.indexInParent
        }_${
            this.parentShelf.indexInParent
        }_${
            this.parentColumn.indexInParent
        }_${
            this.indexInParent
        }`;
    }

    //endregion

}