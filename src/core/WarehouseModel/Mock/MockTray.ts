import {MockColumn} from "./MockColumn";
import {MockShelf} from "./MockShelf";
import {MockBay} from "./MockBay";
import {MockZone} from "./MockZone";
import {MockWarehouse} from "./MockWarehouse";
import {MockCategory} from "./MockCategory";
import {MockExpiryRange} from "./MockExpiryRange";


const expires: MockExpiryRange[] = [
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


export class MockTray {
    index: number;

    customField?: string;
    category?: MockCategory;
    expiry?: MockExpiryRange;
    weight?: number;

    parentColumn?: MockColumn;

    /**
     * @param index - The index of the tray within the column
     * @param category - The tray's (nullable) category
     * @param expiryRange - The tray's (nullable) expiry range
     * @param weight - The tray's (nullable) weight
     * @param customField - The tray's (nullable) custom field
     * @param parentColumn - The (nullable) parent column
     */
    private constructor(
        index: number, category?: MockCategory, expiryRange?: MockExpiryRange,
        weight?: number, customField?: string, parentColumn?: MockColumn
    ) {
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
        category?: MockCategory, expiryRange?: MockExpiryRange, weight?: number,
        customField?: string, index?: number, parentColumn?: MockColumn
    ): MockTray {
        return new MockTray(index ?? -1, category, expiryRange, weight, customField, parentColumn);
    }

    /**
     * Place the tray within a column
     * @param index - The index of the tray within the column
     * @param parentColumn - The column the tray is being added to
     */
    public placeInColumn(index: number, parentColumn: MockColumn) {
        this.index = index;
        this.parentColumn = parentColumn;
    }

    /**
     * Load all trays within a given column
     * @async
     * @param column - The column to load the trays for
     * @returns A promise which resolves to all trays within the column
     */
    public static async loadTrays(column: MockColumn): Promise<MockTray[]> {
        const trays: MockTray[] = [];
        for (let i = 0; i < 3; i++) {
            const categories: MockCategory[] = column?.parentWarehouse?.categories ?? [{name: ""}];
            trays.push(new MockTray(
                i, categories[Math.floor(categories.length * Math.random())],
                expires[Math.floor(expires.length * Math.random())],
                Number((15 * Math.random()).toFixed(2)),
                Math.random() < 0.1 ? "This is a custom field, it might be very long" : undefined,
                column
            ));
        }
        return trays;
    }

    //#region Parent Getters
    get parentShelf(): MockShelf | undefined {
        return this.parentColumn?.parentShelf;
    }

    get parentBay(): MockBay | undefined {
        return this.parentShelf?.parentBay;
    }

    get parentZone(): MockZone | undefined {
        return this.parentBay?.parentZone;
    }

    get parentWarehouse(): MockWarehouse | undefined {
        return this.parentZone?.parentWarehouse;
    }

    //#endregion
}