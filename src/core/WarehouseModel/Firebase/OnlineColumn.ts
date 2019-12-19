import {UpperLayer} from "../UpperLayer";
import {OnlineShelf} from "./OnlineShelf";
import {OnlineBay} from "./OnlineBay";
import {OnlineZone} from "./OnlineZone";
import {OnlineWarehouse} from "./OnlineWarehouse";
import {OnlineTray} from "./OnlineTray";
import {Utils} from "../../Utils";

export class OnlineColumn implements UpperLayer {
    isDeepLoaded: boolean = false;

    id: string;
    index: number;

    parentShelf?: OnlineShelf;
    trays: OnlineTray[] = [];

    /**
     * @param id - The database ID of the column
     * @param index - The (ordered) index of the column within the shelf
     * @param parentShelf - The (nullable) parent shelf
     */
    private constructor(id: string, index: number, parentShelf?: OnlineShelf) {
        this.id = id;
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
    public static create(trays: OnlineTray[], index?: number, parentShelf?: OnlineShelf): OnlineColumn {
        const column: OnlineColumn = new OnlineColumn(Utils.generateRandomId(), index ?? -1, parentShelf);
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
    public placeInShelf(index: number, parentShelf: OnlineShelf) {
        this.index = index;
        this.parentShelf = parentShelf;
    }

    /**
     * Load all columns within a given column
     * @async
     * @param shelf - The shelf to load the columns for
     * @returns A promise which resolves to all columns within the shelf
     */
    public static async loadColumns(shelf: OnlineShelf): Promise<OnlineColumn[]> {
        const columns: OnlineColumn[] = [];
        for (let i = 0; i < 4; i++) {
            const column: OnlineColumn = new OnlineColumn(Utils.generateRandomId(), i, shelf);
            column.trays = await OnlineTray.loadTrays(column);
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
    public static async loadFlatColumns(shelf: OnlineShelf): Promise<OnlineColumn[]> {
        const columns: OnlineColumn[] = [];
        for (let i = 0; i < 4; i++)
            columns.push(new OnlineColumn(Utils.generateRandomId(), i, shelf));
        return columns;
    }

    /**
     * Load the trays into the column
     * @async
     */
    public async loadNextLayer(): Promise<void> {
        if (!this.isDeepLoaded)
            this.trays = await OnlineTray.loadTrays(this);
        this.isDeepLoaded = true;
    }

    //#region Parent Getters
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