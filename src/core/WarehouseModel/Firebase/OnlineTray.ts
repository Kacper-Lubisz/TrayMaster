import {OnlineColumn} from "./OnlineColumn";
import {OnlineShelf} from "./OnlineShelf";
import {OnlineBay} from "./OnlineBay";
import {OnlineZone} from "./OnlineZone";
import {OnlineWarehouse} from "./OnlineWarehouse";
import {Category} from "../Category";
import {ExpiryRange} from "../ExpiryRange";
import {Utils} from "../../Utils";

const expires: ExpiryRange[] = [
    {
        from: new Date(2020, 1).getTime(),
        to: new Date(2020, 2).getTime(),
        label: "Jan 2020",
        color: "#FF0"
    },
    {
        from: new Date(2020, 2).getTime(),
        to: new Date(2020, 3).getTime(),
        label: "Feb 2020",
        color: "#0ff"
    },
    {
        from: new Date(2020, 1).getTime(),
        to: new Date(2020, 4).getTime(),
        label: "Jan-Mar 2020",
        color: "#00f"
    },
    {
        from: new Date(2020, 4).getTime(),
        to: new Date(2020, 7).getTime(),
        label: "Apr-Jun 2020",
        color: "#F0f"
    },
    {
        from: new Date(2020, 1).getTime(),
        to: new Date(2021, 1).getTime(),
        label: "2020",
        color: "#FF0000"
    },
    {
        from: new Date(2021, 1).getTime(),
        to: new Date(2022, 1).getTime(),
        label: "2021",
        color: "#0f0"
    },
];

export class OnlineTray {
    id: string;
    index: number;

    customField?: string;
    category?: Category;
    expiry?: ExpiryRange;
    weight?: number;

    parentColumn?: OnlineColumn;

    /**
     * @param id - The database ID of the tray
     * @param index - The index of the tray within the column
     * @param category - The tray's (nullable) category
     * @param expiryRange - The tray's (nullable) expiry range
     * @param weight - The tray's (nullable) weight
     * @param customField - The tray's (nullable) custom field
     * @param parentColumn - The (nullable) parent column
     */
    private constructor(
        id: string, index: number, category?: Category, expiryRange?: ExpiryRange,
        weight?: number, customField?: string, parentColumn?: OnlineColumn
    ) {
        this.id = id;
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
        return new OnlineTray(Utils.generateRandomId(), index ?? -1, category, expiryRange, weight, customField, parentColumn);
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

    /**
     * Load all trays within a given column
     * @async
     * @param column - The column to load the trays for
     * @returns A promise which resolves to all trays within the column
     */
    public static async loadTrays(column: OnlineColumn): Promise<OnlineTray[]> {
        const trays: OnlineTray[] = [];
        for (let i = 0; i < 3; i++) {
            const categories: Category[] = column?.parentWarehouse?.categories ?? [{name: ""}];
            trays.push(new OnlineTray(
                Utils.generateRandomId(),
                i,
                categories[Math.floor(categories.length * Math.random())],
                expires[Math.floor(expires.length * Math.random())],
                Number((15 * Math.random()).toFixed(2)),
                Math.random() < 0.1 ? "This is a custom field, it might be very long" : undefined,
                column
            ));
        }
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