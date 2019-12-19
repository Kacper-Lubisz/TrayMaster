import {UpperLayer} from "../UpperLayer";
import {Zone} from "./Zone";
import {Warehouse} from "./Warehouse";
import {Shelf} from "./Shelf";
import {Column} from "./Column";
import {Tray} from "./Tray";
import {Utils} from "../../Utils";


export class Bay implements UpperLayer {
    isDeepLoaded: boolean = false;

    id: string;
    name: string;
    index: number;

    parentZone?: Zone;
    shelves: Shelf[] = [];

    /**
     * @param id - The database ID for the bay
     * @param name - The name of the bay
     * @param index - The (ordered) index of the bay within the zone
     * @param parentZone - The (nullable) parent zone
     */
    private constructor(id: string, name: string, index: number, parentZone?: Zone) {
        this.id = id;
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
    public static create(shelves: Shelf[], name?: string, index?: number, parentZone?: Zone): Bay {
        const bay: Bay = new Bay(Utils.generateRandomId(), name ?? "", index ?? -1, parentZone);
        bay.shelves = shelves;
        for (let i = 0; i < bay.shelves.length; i++)
            bay.shelves[i].placeInBay(i, bay);
        return bay;
    }

    /**
     * Place the bay within a zone
     * @param index - The index of the bay within the zone
     * @param parentZone - The zone the bay is being added to
     * @param name - The name of the bay
     */
    public placeInZone(index: number, parentZone: Zone, name?: string) {
        this.index = index;
        this.parentZone = parentZone;
        this.name = name ?? this.name;
    }

    /**
     * Load all bays within a given zone
     * @async
     * @param zone - The zone to load the bays for
     * @returns A promise which resolves to all loaded bays within the zone
     */
    public static async loadBays(zone: Zone): Promise<Bay[]> {
        const bays: Bay[] = [];
        for (let i = 0; i < 3; i++) {
            const bay: Bay = new Bay(Utils.generateRandomId(), String.fromCharCode(i + 65), i, zone);
            bay.shelves = await Shelf.loadShelves(bay);
            bay.isDeepLoaded = true;
            bays.push(bay);
        }
        return bays;
    }

    /**
     * Load all bays (without any shelves) in a zone
     * @async
     * @param zone - The zone to load the bays for
     * @returns A promise which resolves to the flat bays list
     */
    public static async loadFlatBays(zone: Zone): Promise<Bay[]> {
        const bays: Bay[] = [];
        for (let i = 0; i < 3; i++)
            bays.push(new Bay(Utils.generateRandomId(), String.fromCharCode(i + 65), i, zone));
        return bays;
    }

    /**
     * Load the shelves into the bay
     * @async
     */
    public async loadNextLayer(): Promise<void> {
        if (!this.isDeepLoaded)
            this.shelves = await Shelf.loadFlatShelves(this);
        this.isDeepLoaded = true;
    }

    //#region Children Getters
    get columns(): Column[] {
        return this.shelves.flatMap(shelf => shelf.columns);
    }

    get trays(): Tray[] {
        return this.columns.flatMap(column => column.trays);
    }

    //#endregion

    //#region Parent Getters
    get parentWarehouse(): Warehouse | undefined {
        return this.parentZone?.parentWarehouse;
    }

    //#endregion
}