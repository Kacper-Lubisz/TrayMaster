import {UpperLayer} from "./UpperLayer";
import {Shelf} from "./Shelf";
import {Bay} from "./Bay";
import {Zone} from "./Zone";
import {Warehouse} from "./Warehouse";
import {Tray} from "./Tray";
import {Utils} from "../Utils";

export class Column implements UpperLayer {
    isDeepLoaded: boolean = false;

    id: string;
    index: number;

    parentShelf?: Shelf;
    trays: Tray[] = [];

    /**
     * @param id - The database ID of the column
     * @param index - The (ordered) index of the column within the shelf
     * @param parentShelf - The (nullable) parent shelf
     */
    private constructor(id: string, index: number, parentShelf?: Shelf) {
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
    public static create(trays: Tray[], index?: number, parentShelf?: Shelf): Column {
        const column: Column = new Column(Utils.generateRandomId(), index ?? -1, parentShelf);
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
    public placeInShelf(index: number, parentShelf: Shelf) {
        this.index = index;
        this.parentShelf = parentShelf;
    }

    /**
     * Load all columns within a given column
     * @async
     * @param shelf - The shelf to load the columns for
     * @returns A promise which resolves to all columns within the shelf
     */
    public static async loadColumns(shelf: Shelf): Promise<Column[]> {
        const columns: Column[] = [];
        for (let i = 0; i < 4; i++) {
            const column: Column = new Column(Utils.generateRandomId(), i, shelf);
            column.trays = await Tray.loadTrays(column);
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
    public static async loadFlatColumns(shelf: Shelf): Promise<Column[]> {
        const columns: Column[] = [];
        for (let i = 0; i < 4; i++)
            columns.push(new Column(Utils.generateRandomId(), i, shelf));
        return columns;
    }

    /**
     * Load the trays into the column
     * @async
     */
    public async loadNextLayer(): Promise<void> {
        if (!this.isDeepLoaded)
            this.trays = await Tray.loadTrays(this);
        this.isDeepLoaded = true;
    }

    //#region Parent Getters
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