import {Layer} from "../Layer";
import {Bay} from "./Bay";
import {Zone} from "./Zone";
import {Warehouse} from "./Warehouse";
import {Column} from "./Column";
import {Tray} from "./Tray";
import {ONLINE} from "../../WarehouseModel";
import Utils from "../Utils";


interface ShelfFields {
    name: string;
    index: number;
}


export class Shelf extends Layer<ShelfFields> {
    isDeepLoaded: boolean = false;

    parentBay?: Bay;
    columns: Column[] = [];

    /**
     * @param id - The database ID for the shelf
     * @param name - The name of the shelf
     * @param index - The (ordered) index of the shelf within the bay
     * @param parentBay - The (nullable) parent bay
     */
    private constructor(id: string, name: string, index: number, parentBay?: Bay) {
        super({name: name, index: index}, parentBay?.childCollection("shelves") ?? "shelves", id);
        this.parentBay = parentBay;
    }

    public get name(): string {
        return this.fields.name;
    }

    public get index(): number {
        return this.fields.index;
    }

    public set name(name: string) {
        this.fields.name = name;
        this.fieldChange();
    }

    public set index(index: number) {
        this.fields.index = index;
        this.fieldChange();
    }

    /**
     * Create a shelf from a collection of columns
     * @param columns - The columns to put in the shelf
     * @param name - The name of the shelf
     * @param index - The index of the shelf within its bay
     * @param parentBay - The bay the shelf belongs to
     * @returns The newly created shelf
     */
    public static create(columns: Column[], name?: string, index?: number, parentBay?: Bay): Shelf {
        const shelf: Shelf = new Shelf("", name ?? "", index ?? -1);
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
    public placeInBay(index: number, parentBay: Bay, name?: string) {
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
    public static async loadShelves(bay: Bay): Promise<Shelf[]> {
        if (ONLINE) {
            const shelves: Shelf[] = await this.loadChildObjects<Shelf, ShelfFields, Bay>(bay, "shelves", "index");
            for (let shelf of shelves) {
                shelf.columns = await Column.loadColumns(shelf);
                shelf.isDeepLoaded = true;
            }
            return shelves;
        } else {
            const shelves: Shelf[] = [];
            for (let i = 0; i < 3; i++) {
                const shelf: Shelf = new Shelf(Utils.generateRandomId(), `${i + 1}`, i, bay);
                shelf.columns = await Column.loadColumns(shelf);
                shelf.isDeepLoaded = true;
                shelves.push(shelf);
            }
            return shelves;
        }
    }

    /**
     * Load all shelves (without any columns) in a bay
     * @async
     * @param bay - The bay to load the shelves for
     * @returns A promise which resolves to the flat shelf list
     */
    public static async loadFlatShelves(bay: Bay): Promise<Shelf[]> {
        if (ONLINE)
            return await this.loadChildObjects<Shelf, ShelfFields, Bay>(bay, "shelves", "index");
        else {
            const shelves: Shelf[] = [];
            for (let i = 0; i < 3; i++)
                shelves.push(new Shelf(Utils.generateRandomId(), `${i + 1}`, i, bay));
            return shelves;
        }
    }

    /**
     * Load the columns into the shelf
     * @async
     */
    public async loadChildren(): Promise<void> {
        if (!this.isDeepLoaded)
            this.columns = await Column.loadFlatColumns(this);
        this.isDeepLoaded = true;
    }

    public toString(): string {
        return `${this.parentZone?.name} ${this.parentBay?.name}${this.name}`;
        // todo decide and implement this shelf toString
    }

    //#region Children Getters
    get trays(): Tray[] {
        return this.columns.flatMap(column => column.trays);
    }

    //#endregion

    //#region Parent Getters
    get parentZone(): Zone | undefined {
        return this.parentBay?.parentZone;
    }

    get parentWarehouse(): Warehouse | undefined {
        return this.parentZone?.parentWarehouse;
    }

    //#endregion
}