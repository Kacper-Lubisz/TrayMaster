import {MockWarehouse} from "./MockWarehouse";
import {UpperLayer} from "../UpperLayer";
import {MockBay} from "./MockBay";
import {MockShelf} from "./MockShelf";
import {MockColumn} from "./MockColumn";
import {MockTray} from "./MockTray";
import {Utils} from "../../Utils";

const colours = [
    {label: "Red", hex: "#FF0000"},
    {label: "Green", hex: "#00FF00"},
    {label: "Blue", hex: "#0000FF"},
    {label: "White", hex: "#FFFFFF"},
    {label: "Black", hex: "#000000"}
];

export class MockZone implements UpperLayer {
    isDeepLoaded: boolean = false;

    id: string;
    name: string;
    color: string;

    parentWarehouse?: MockWarehouse;
    bays: MockBay[] = [];

    /**
     * @param id - The database ID for the zone
     * @param name - The name of the zone
     * @param color - The hex colour of the zone
     * @param parentWarehouse - The (nullable) parent warehouse
     */
    private constructor(id: string, name: string, color: string, parentWarehouse?: MockWarehouse) {
        this.id = id;
        this.name = name;
        this.color = color;

        this.parentWarehouse = parentWarehouse;
    }

    /**
     * Create a zone from a collection of bays
     * @param bays - The bays to put in the zone
     * @param name - The name of the zone
     * @param color - The hex colour of the zone
     * @param parentWarehouse - The warehouse the zone belongs to
     * @returns The newly created zone
     */
    public static create(bays: MockBay[], name?: string, color?: string, parentWarehouse?: MockWarehouse): MockZone {
        const zone: MockZone = new MockZone(Utils.generateRandomId(), name ?? "", color ?? "#000000", parentWarehouse);
        zone.bays = bays;
        for (let i = 0; i < zone.bays.length; i++)
            zone.bays[i].placeInZone(i, zone);
        return zone;
    }

    /**
     * Place the zone within a warehouse
     * @param parentWarehouse - The warehouse the zone is being added to
     * @param name - The name of the zone
     */
    public placeInWarehouse(parentWarehouse: MockWarehouse, name?: string) {
        this.parentWarehouse = parentWarehouse;
        this.name = name ?? this.name;
    }

    /**
     * Load all zones within a given warehouse
     * @async
     * @param warehouse - The warehouse to load the zones for
     * @returns A promise which resolves to all loaded zones within the warehouse
     */
    public static async loadZones(warehouse: MockWarehouse): Promise<MockZone[]> {
        const zones: MockZone[] = [];
        for (let i = 0; i < colours.length; i++) {
            const zone: MockZone = new MockZone(Utils.generateRandomId(), colours[i].label, colours[i].hex, warehouse);
            zone.bays = await MockBay.loadBays(zone);
            zone.isDeepLoaded = true;
            zones.push(zone);
        }
        return zones;
    }

    /**
     * Load all zones (without any bays) in a warehouse
     * @async
     * @param warehouse - The warehouse to load the zones for
     * @returns A promise which resolves to the flat zones list
     */
    public static async loadFlatZones(warehouse: MockWarehouse): Promise<MockZone[]> {
        const zones: MockZone[] = [];
        for (let i = 0; i < colours.length; i++)
            zones.push(new MockZone(Utils.generateRandomId(), colours[i].label, colours[i].hex, warehouse));
        return zones;
    }

    /**
     * Load the bays into the zone
     * @async
     */
    public async loadNextLayer(): Promise<void> {
        if (!this.isDeepLoaded)
            this.bays = await MockBay.loadFlatBays(this);
        this.isDeepLoaded = true;
    }

    //#region Children Getters
    get shelves(): MockShelf[] {
        return this.bays.flatMap(bay => bay.shelves);
    }

    get columns(): MockColumn[] {
        return this.shelves.flatMap(shelf => shelf.columns);
    }

    get trays(): MockTray[] {
        return this.columns.flatMap(column => column.trays);
    }

    //#endregion
}