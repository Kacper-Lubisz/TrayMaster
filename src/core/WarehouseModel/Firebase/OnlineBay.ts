import {OnlineUpperLayer} from "./OnlineUpperLayer";
import {OnlineZone} from "./OnlineZone";
import {OnlineWarehouse} from "./OnlineWarehouse";
import {OnlineShelf} from "./OnlineShelf";
import {OnlineColumn} from "./OnlineColumn";
import {OnlineTray} from "./OnlineTray";


export class OnlineBay extends OnlineUpperLayer {
    isDeepLoaded: boolean = false;

    name: string;
    index: number;

    parentZone?: OnlineZone;
    shelves: OnlineShelf[] = [];

    /**
     * @param location - The database location for the bay
     * @param name - The name of the bay
     * @param index - The (ordered) index of the bay within the zone
     * @param parentZone - The (nullable) parent zone
     */
    private constructor(location: string, name: string, index: number, parentZone?: OnlineZone) {
        super(location);
        this.name = name;
        this.index = index;

        this.parentZone = parentZone;
    }

    /**
     * Create a bay from a collection of shelves
     * @param shelves - The shelves to put in the bay
     * @param name - The name of the bay
     * @param index - The index of the bay within its zone
     * @param parentZone - The zone the bay belongs to
     * @returns The newly created bay
     */
    public static create(shelves: OnlineShelf[], name?: string, index?: number, parentZone?: OnlineZone): OnlineBay {
        const bay: OnlineBay = new OnlineBay("", name ?? "", index ?? -1, parentZone);
        bay.shelves = shelves;
        for (let i = 0; i < bay.shelves.length; i++)
            bay.shelves[i].placeInBay(i, bay);
        return bay;
    }

    /**
     * Place the bay within a zone
     * @param index - The index of the bay within the zone
     * @param parentZone - The zone the bay is being added to
     */
    public placeInZone(index: number, parentZone: OnlineZone) {
        this.index = index;
        this.parentZone = parentZone;
    }

    public async saveLayer(): Promise<void> {

    }

    /**
     * Load all bays within a given zone
     * @async
     * @param zone - The zone to load the bays for
     * @returns A promise which resolves to all loaded bays within the zone
     */
    public static async loadBays(zone: OnlineZone): Promise<OnlineBay[]> {
        const bays: OnlineBay[] = await this.loadChildObjects<OnlineBay, OnlineZone>(zone, "bays", "index");
        for (let bay of bays) {
            bay.shelves = await OnlineShelf.loadShelves(bay);
            bay.isDeepLoaded = true;
        }
        return bays;
    }

    /**
     * Load all bays (without any shelves) in a zone
     * @async
     * @param zone - The zone to load the bays for
     * @returns A promise which resolves to the flat bays list
     */
    public static async loadFlatBays(zone: OnlineZone): Promise<OnlineBay[]> {
        return await this.loadChildObjects<OnlineBay, OnlineZone>(zone, "bays", "index");
    }

    /**
     * Load the shelves into the bay
     * @async
     */
    public async loadNextLayer(): Promise<void> {
        if (!this.isDeepLoaded)
            this.shelves = await OnlineShelf.loadFlatShelves(this);
        this.isDeepLoaded = true;
    }

    //#region Children Getters
    get columns(): OnlineColumn[] {
        return this.shelves.flatMap(shelf => shelf.columns);
    }

    get trays(): OnlineTray[] {
        return this.columns.flatMap(column => column.trays);
    }

    //#endregion

    //#region Parent Getters
    get parentWarehouse(): OnlineWarehouse | undefined {
        return this.parentZone?.parentWarehouse;
    }

    //#endregion
}