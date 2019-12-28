import {MockUpperLayer} from "./MockUpperLayer";
import {MockBay} from "./MockBay";
import {MockZone} from "./MockZone";
import {MockWarehouse} from "./MockWarehouse";
import {MockColumn} from "./MockColumn";
import {MockTray} from "./MockTray";


export class MockShelf implements MockUpperLayer {
    isDeepLoaded: boolean = false;

    name: string;
    index: number;

    parentBay?: MockBay;
    columns: MockColumn[] = [];

    /**
     * @param name - The name of the shelf
     * @param index - The (ordered) index of the shelf within the bay
     * @param parentBay - The (nullable) parent bay
     */
    private constructor(name: string, index: number, parentBay?: MockBay) {
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
    public static create(columns: MockColumn[], name?: string, index?: number, parentBay?: MockBay): MockShelf {
        const shelf: MockShelf = new MockShelf(name ?? "", index ?? -1);
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
    public placeInBay(index: number, parentBay: MockBay, name?: string) {
        this.index = index;
        this.parentBay = parentBay;
        this.name = name ?? this.name;
    }

    /**
     * Load all shelves within a given bay
     * @async
     * @param bay - The bay to load the shelves for
     * @returns A promise which resolves to all loaded shelves within the bay
     */
    public static async loadShelves(bay: MockBay): Promise<MockShelf[]> {
        const shelves: MockShelf[] = [];
        for (let i = 0; i < 3; i++) {
            const shelf: MockShelf = new MockShelf(`${i + 1}`, i, bay);
            shelf.columns = await MockColumn.loadColumns(shelf);
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
    public static async loadFlatShelves(bay: MockBay): Promise<MockShelf[]> {
        const shelves: MockShelf[] = [];
        for (let i = 0; i < 3; i++)
            shelves.push(new MockShelf(`${i + 1}`, i, bay));
        return shelves;
    }

    /**
     * Load the columns into the shelf
     * @async
     */
    public async loadNextLayer(): Promise<void> {
        if (!this.isDeepLoaded)
            this.columns = await MockColumn.loadFlatColumns(this);
        this.isDeepLoaded = true;
    }

    //#region Children Getters
    get trays(): MockTray[] {
        return this.columns.flatMap(column => column.trays);
    }

    //#endregion

    //#region Parent Getters
    get parentZone(): MockZone | undefined {
        return this.parentBay?.parentZone;
    }

    get parentWarehouse(): MockWarehouse | undefined {
        return this.parentZone?.parentWarehouse;
    }

    //#endregion
}