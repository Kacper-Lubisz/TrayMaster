import {UpperLayer} from "../UpperLayer";
import {OnlineBay} from "./OnlineBay";
import {OnlineZone} from "./OnlineZone";
import {OnlineWarehouse} from "./OnlineWarehouse";
import {OnlineColumn} from "./OnlineColumn";
import {OnlineTray} from "./OnlineTray";
import {OnlineLayer} from "./OnlineLayer";

export class OnlineShelf extends OnlineLayer implements UpperLayer {
    isDeepLoaded: boolean = false;

    name: string;
    index: number;

    parentBay?: OnlineBay;
    columns: OnlineColumn[] = [];

    /**
     * @param location - The database location for the shelf
     * @param name - The name of the shelf
     * @param index - The (ordered) index of the shelf within the bay
     * @param parentBay - The (nullable) parent bay
     */
    private constructor(location: string, name: string, index: number, parentBay?: OnlineBay) {
        super(location);
        this.name = name;
        this.index = index;

        this.parentBay = parentBay;
    }

    /**
     * Create a shelf from a collection of columns
     * @param columns - The columns to put in the shelf
     * @param name - The name of the shelf
     * @param index - The index of the shelf within its bay
     * @param parentBay - The bay the shelf belongs to
     * @returns The newly created shelf
     */
    public static create(columns: OnlineColumn[], name?: string, index?: number, parentBay?: OnlineBay): OnlineShelf {
        const shelf: OnlineShelf = new OnlineShelf("", name ?? "", index ?? -1);
        shelf.columns = columns;
        for (let i = 0; i < shelf.columns.length; i++)
            shelf.columns[i].placeInShelf(i, shelf);
        return shelf;
    }

    /**
     * Place the shelf within a bay
     * @param index - The index of the shelf within the bay
     * @param parentBay - The bay the shelf is being added to
     * @param name - The name of the shelf
     */
    public placeInBay(index: number, parentBay: OnlineBay, name?: string) {
        this.index = index;
        this.parentBay = parentBay;
        this.name = name ?? this.name;
    }

    public async saveLayer(): Promise<void> {

    }

    /**
     * Load all shelves within a given bay
     * @async
     * @param bay - The bay to load the shelves for
     * @returns A promise which resolves to all loaded shelves within the bay
     */
    public static async loadShelves(bay: OnlineBay): Promise<OnlineShelf[]> {
        const shelves: OnlineShelf[] = [];
        for (let i = 0; i < 3; i++) {
            const shelf: OnlineShelf = new OnlineShelf("", `${i + 1}`, i, bay);
            shelf.columns = await OnlineColumn.loadColumns(shelf);
            shelf.isDeepLoaded = true;
            shelves.push(shelf);
        }
        return shelves;
    }

    public toString(): string {
        return `${this.parentZone?.name} ${this.parentBay?.name}${this.name}`;
        // todo decide and implement this shelf toString
    }

    /**
     * Load all shelves (without any columns) in a bay
     * @async
     * @param bay - The bay to load the shelves for
     * @returns A promise which resolves to the flat shelf list
     */
    public static async loadFlatShelves(bay: OnlineBay): Promise<OnlineShelf[]> {
        const shelves: OnlineShelf[] = [];
        for (let i = 0; i < 3; i++)
            shelves.push(new OnlineShelf("", `${i + 1}`, i, bay));
        return shelves;
    }

    /**
     * Load the columns into the shelf
     * @async
     */
    public async loadNextLayer(): Promise<void> {
        if (!this.isDeepLoaded)
            this.columns = await OnlineColumn.loadFlatColumns(this);
        this.isDeepLoaded = true;
    }

    //#region Children Getters
    get trays(): OnlineTray[] {
        return this.columns.flatMap(column => column.trays);
    }

    //#endregion

    //#region Parent Getters
    get parentZone(): OnlineZone | undefined {
        return this.parentBay?.parentZone;
    }

    get parentWarehouse(): OnlineWarehouse | undefined {
        return this.parentZone?.parentWarehouse;
    }

    //#endregion
}