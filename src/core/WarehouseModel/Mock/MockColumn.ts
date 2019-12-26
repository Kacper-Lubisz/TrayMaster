import {UpperLayer} from "../UpperLayer";
import {MockShelf} from "./MockShelf";
import {MockBay} from "./MockBay";
import {MockZone} from "./MockZone";
import {MockWarehouse} from "./MockWarehouse";
import {MockTray} from "./MockTray";


export class MockColumn implements UpperLayer {
    isDeepLoaded: boolean = false;

    index: number;

    parentShelf?: MockShelf;
    trays: MockTray[] = [];

    /**
     * @param index - The (ordered) index of the column within the shelf
     * @param parentShelf - The (nullable) parent shelf
     */
    private constructor(index: number, parentShelf?: MockShelf) {
        this.index = index;

        this.parentShelf = parentShelf;
    }

    /**
     * Create a column from a collection of trays
     * @param trays - The trays to put in the column
     * @param index - The index of the column within its shelf
     * @param parentShelf - The shelf the column belongs to
     * @returns The newly created column
     */
    public static create(trays: MockTray[], index?: number, parentShelf?: MockShelf): MockColumn {
        const column: MockColumn = new MockColumn(index ?? -1, parentShelf);
        column.trays = trays;
        for (let i = 0; i < column.trays.length; i++)
            column.trays[i].placeInColumn(i, column);
        return column;
    }

    /**
     * Place the column within a shelf
     * @param index - The index of the column within the shelf
     * @param parentShelf - The shelf the column is being added to
     */
    public placeInShelf(index: number, parentShelf: MockShelf) {
        this.index = index;
        this.parentShelf = parentShelf;
    }

    /**
     * Load all columns within a given column
     * @async
     * @param shelf - The shelf to load the columns for
     * @returns A promise which resolves to all columns within the shelf
     */
    public static async loadColumns(shelf: MockShelf): Promise<MockColumn[]> {
        const columns: MockColumn[] = [];
        for (let i = 0; i < 4; i++) {
            const column: MockColumn = new MockColumn(i, shelf);
            column.trays = await MockTray.loadTrays(column);
            column.isDeepLoaded = true;
            columns.push(column);
        }
        return columns;
    }

    /**
     * Load all columns (without any trays) in a shelf
     * @async
     * @param shelf - The shelf to load the columns for
     * @returns A promise which resolves to the flat column list
     */
    public static async loadFlatColumns(shelf: MockShelf): Promise<MockColumn[]> {
        const columns: MockColumn[] = [];
        for (let i = 0; i < 4; i++)
            columns.push(new MockColumn(i, shelf));
        return columns;
    }

    /**
     * Load the trays into the column
     * @async
     */
    public async loadNextLayer(): Promise<void> {
        if (!this.isDeepLoaded)
            this.trays = await MockTray.loadTrays(this);
        this.isDeepLoaded = true;
    }

    //#region Parent Getters
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