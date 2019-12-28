import {MockUpperLayer} from "./MockUpperLayer";
import {MockZone} from "./MockZone";
import {MockWarehouse} from "./MockWarehouse";
import {MockShelf} from "./MockShelf";
import {MockColumn} from "./MockColumn";
import {MockTray} from "./MockTray";


export class MockBay implements MockUpperLayer {
    isDeepLoaded: boolean = false;

    name: string;
    index: number;

    parentZone?: MockZone;
    shelves: MockShelf[] = [];

    /**
     * @param name - The name of the bay
     * @param index - The (ordered) index of the bay within the zone
     * @param parentZone - The (nullable) parent zone
     */
    private constructor(name: string, index: number, parentZone?: MockZone) {
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
    public static create(shelves: MockShelf[], name?: string, index?: number, parentZone?: MockZone): MockBay {
        const bay: MockBay = new MockBay(name ?? "", index ?? -1, parentZone);
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
    public placeInZone(index: number, parentZone: MockZone, name?: string) {
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
    public static async loadBays(zone: MockZone): Promise<MockBay[]> {
        const bays: MockBay[] = [];
        for (let i = 0; i < 3; i++) {
            const bay: MockBay = new MockBay(String.fromCharCode(i + 65), i, zone);
            bay.shelves = await MockShelf.loadShelves(bay);
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
    public static async loadFlatBays(zone: MockZone): Promise<MockBay[]> {
        const bays: MockBay[] = [];
        for (let i = 0; i < 3; i++)
            bays.push(new MockBay(String.fromCharCode(i + 65), i, zone));
        return bays;
    }

    /**
     * Load the shelves into the bay
     * @async
     */
    public async loadNextLayer(): Promise<void> {
        if (!this.isDeepLoaded)
            this.shelves = await MockShelf.loadFlatShelves(this);
        this.isDeepLoaded = true;
    }

    //#region Children Getters
    get columns(): MockColumn[] {
        return this.shelves.flatMap(shelf => shelf.columns);
    }

    get trays(): MockTray[] {
        return this.columns.flatMap(column => column.trays);
    }

    //#endregion

    //#region Parent Getters
    get parentWarehouse(): MockWarehouse | undefined {
        return this.parentZone?.parentWarehouse;
    }

    //#endregion
}