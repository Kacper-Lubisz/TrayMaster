import {BottomLayer} from "../LayerStructure/BottomLayer";
import {Bay, Category, Column, ExpiryRange, Shelf, Warehouse, warehouse, Zone} from "../../WarehouseModel";
import Utils from "../Utils";


interface TrayFields {
    index: number;
    categoryId: string;
    expiry: ExpiryRange | null;
    weight: number | null;
    customField: string | null;
}

export class Tray extends BottomLayer<Column, TrayFields> {
    public readonly collectionName = "trays";

    public static create(parent: Column, index: number, category?: Category, expiry?: ExpiryRange, weight?: number,
                         customField?: string
    ): Tray {
        return new Tray(Utils.generateRandomId(), {
            index,
            categoryId: warehouse.getCategoryID(category),
            expiry: expiry ?? null,
            weight: weight ?? null,
            customField: customField ?? null
        }, parent);
    }

    public static createFromFields(id: string, fields: unknown, parent: Column): Tray {
        return new Tray(id, fields as TrayFields, parent);
    }

    //#region Field Getters and Setters
    public get index(): number {
        return this.fields.index;
    }

    public set index(index: number) {
        this.fields.index = index;
    }

    public get category(): Category | undefined {
        return warehouse.getCategoryByID(this.fields.categoryId);
    }

    public set category(category: Category | undefined) {
        this.fields.categoryId = warehouse.getCategoryID(category);
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

    public get customField(): string | undefined {
        return this.fields.customField || undefined;
    }

    public set customField(customField: string | undefined) {
        this.fields.customField = customField || null;
    }

    //#endregion

    //#region Parent Getters
    get parentColumn(): Column | undefined {
        return this.parent;
    }

    get parentShelf(): Shelf | undefined {
        return this.parentColumn?.parentShelf;
    }

    get parentBay(): Bay | undefined {
        return this.parentShelf?.parentBay;
    }

    get parentZone(): Zone | undefined {
        return this.parentBay?.parentZone;
    }

    get parentWarehouse(): Warehouse | undefined {
        return this.parentZone?.parentWarehouse;
    }

    //#endregion
}