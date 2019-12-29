import {Column} from "./Column";
import {Shelf} from "./Shelf";
import {Bay} from "./Bay";
import {Zone} from "./Zone";
import {Warehouse} from "./Warehouse";
import {Category} from "./Category";
import {Layer} from "./Layer";
import {ONLINE} from "../WarehouseModel";
import {Utils} from "./Utils";


const sizes: TraySize[] = [
    {label: "small", sizeRatio: 1.5},
    {label: "normal", sizeRatio: 2.5},
    {label: "big", sizeRatio: 3.5},
];


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


export interface ExpiryRange {
    from: number;
    to: number;
    label: string;
    color: string;
}


export interface TraySize {
    label: string;
    sizeRatio: number;
}


export class Tray extends Layer {
    index: number;

    customField?: string;
    category?: Category;
    expiry?: ExpiryRange;
    weight?: number;

    parentColumn?: Column;

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
        weight?: number, customField?: string, parentColumn?: Column
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
        customField?: string, index?: number, parentColumn?: Column
    ): Tray {
        return new Tray("", index ?? -1, category, expiryRange, weight, customField, parentColumn);
    }

    /**
     * Place the tray within a column
     * @param index - The index of the tray within the column
     * @param parentColumn - The column the tray is being added to
     */
    public placeInColumn(index: number, parentColumn: Column) {
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
    public static async loadTrays(column: Column): Promise<Tray[]> {
        if (ONLINE)
            return await this.loadChildObjects<Tray, Column>(column, "columns", "index");
        else {
            const trays: Tray[] = [];
            for (let i = 0; i < 3; i++) {
                const categories: Category[] | undefined = column?.parentWarehouse?.categories;
                trays.push(new Tray(Utils.generateRandomId(),
                    i, categories === undefined ? undefined : categories[Math.floor(categories.length * Math.random())],
                    expires[Math.floor(expires.length * Math.random())],
                    Number((15 * Math.random()).toFixed(2)),
                    Math.random() < 0.1 ? "This is a custom field, it might be very long" : undefined,
                    column
                ));
            }
            return trays;
        }
    }

    /**
     * Load tray sizes.
     * @async
     * @returns A promise which resolves to the list of tray sizes in the warehouse
     */
    public static async loadTraySizes(): Promise<TraySize[]> {
        if (ONLINE) {
            throw new Error("Not yet implemented.");
        } else {
            const traySizes: TraySize[] = [];
            for (let i = 0; i < sizes.length; i++)
                traySizes.push({...sizes[i]});
            return traySizes;
        }
    }

    //#region Parent Getters
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
