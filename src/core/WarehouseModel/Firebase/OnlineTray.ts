import {OnlineColumn} from "./OnlineColumn";
import {OnlineShelf} from "./OnlineShelf";
import {OnlineBay} from "./OnlineBay";
import {OnlineZone} from "./OnlineZone";
import {OnlineWarehouse} from "./OnlineWarehouse";
import {ExpiryRange} from "../ExpiryRange";
import {OnlineLayer} from "./OnlineLayer";
import {Category} from "../OnlineWarehouseModel";


export class OnlineTray extends OnlineLayer {
    index: number;

    customField?: string;
    category?: Category;
    expiry?: ExpiryRange;
    weight?: number;

    parentColumn?: OnlineColumn;

    /**
     * @param location - The database location of the tray
     * @param index - The index of the tray within the column
     * @param category - The tray's (nullable) category
     * @param expiryRange - The tray's (nullable) expiry range
     * @param weight - The tray's (nullable) weight
     * @param customField - The tray's (nullable) custom field
     * @param parentColumn - The (nullable) parent column
     */
    private constructor(
        location: string, index: number, category?: Category, expiryRange?: ExpiryRange,
        weight?: number, customField?: string, parentColumn?: OnlineColumn
    ) {
        super(location);
        this.index = index;

        this.category = category;
        this.weight = weight;
        this.expiry = expiryRange;
        this.customField = customField;
        this.parentColumn = parentColumn;
    }

    /**
     * Create a new tray
     * @param category - The tray's (nullable) category
     * @param expiryRange - The tray's (nullable) expiry range
     * @param weight - The tray's (nullable) weight
     * @param customField - The tray's (nullable) custom field
     * @param index - The index of the tray within the column
     * @param parentColumn - The (nullable) parent column
     */
    public static create(
        category?: Category, expiryRange?: ExpiryRange, weight?: number,
        customField?: string, index?: number, parentColumn?: OnlineColumn
    ): OnlineTray {
        return new OnlineTray("", index ?? -1, category, expiryRange, weight, customField, parentColumn);
    }

    /**
     * Place the tray within a column
     * @param index - The index of the tray within the column
     * @param parentColumn - The column the tray is being added to
     */
    public placeInColumn(index: number, parentColumn: OnlineColumn) {
        this.index = index;
        this.parentColumn = parentColumn;
    }

    public async saveLayer(): Promise<void> {

    }

    /**
     * Load all trays within a given column
     * @async
     * @param column - The column to load the trays for
     * @returns A promise which resolves to all trays within the column
     */
    public static async loadTrays(column: OnlineColumn): Promise<OnlineTray[]> {
        const trays: OnlineTray[] = [];

        return trays;
    }

    //#region Parent Getters
    get parentShelf(): OnlineShelf | undefined {
        return this.parentColumn?.parentShelf;
    }

    get parentBay(): OnlineBay | undefined {
        return this.parentShelf?.parentBay;
    }

    get parentZone(): OnlineZone | undefined {
        return this.parentBay?.parentZone;
    }

    get parentWarehouse(): OnlineWarehouse | undefined {
        return this.parentZone?.parentWarehouse;
    }

    //#endregion
}