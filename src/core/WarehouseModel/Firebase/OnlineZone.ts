import {OnlineWarehouse} from "./OnlineWarehouse";
import {UpperLayer} from "../UpperLayer";
import {OnlineBay} from "./OnlineBay";
import {OnlineShelf} from "./OnlineShelf";
import {OnlineColumn} from "./OnlineColumn";
import {OnlineTray} from "./OnlineTray";
import {Utils} from "../../Utils";

const colours = [
    {label: "Red", hex: "#FF0000"},
    {label: "Green", hex: "#00FF00"},
    {label: "Blue", hex: "#0000FF"},
    {label: "White", hex: "#FFFFFF"},
    {label: "Black", hex: "#000000"}
];

export class OnlineZone implements UpperLayer {
    isDeepLoaded: boolean = false;

    id: string;
    name: string;
    color: string;

    parentWarehouse?: OnlineWarehouse;
    bays: OnlineBay[] = [];

    /**
     * @param id - The database ID for the zone
     * @param name - The name of the zone
     * @param color - The hex colour of the zone
     * @param parentWarehouse - The (nullable) parent warehouse
     */
    private constructor(id: string, name: string, color: string, parentWarehouse?: OnlineWarehouse) {
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
    public static create(bays: OnlineBay[], name?: string, color?: string, parentWarehouse?: OnlineWarehouse): OnlineZone {
        const zone: OnlineZone = new OnlineZone(Utils.generateRandomId(), name ?? "", color ?? "#000000", parentWarehouse);
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
    public placeInWarehouse(parentWarehouse: OnlineWarehouse, name?: string) {
        this.parentWarehouse = parentWarehouse;
        this.name = name ?? this.name;
    }

    /**
     * Load all zones within a given warehouse
     * @async
     * @param warehouse - The warehouse to load the zones for
     * @returns A promise which resolves to all loaded zones within the warehouse
     */
    public static async loadZones(warehouse: OnlineWarehouse): Promise<OnlineZone[]> {
        const zones: OnlineZone[] = [];
        for (let i = 0; i < colours.length; i++) {
            const zone: OnlineZone = new OnlineZone(Utils.generateRandomId(), colours[i].label, colours[i].hex, warehouse);
            zone.bays = await OnlineBay.loadBays(zone);
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
    public static async loadFlatZones(warehouse: OnlineWarehouse): Promise<OnlineZone[]> {
        const zones: OnlineZone[] = [];
        for (let i = 0; i < colours.length; i++)
            zones.push(new OnlineZone(Utils.generateRandomId(), colours[i].label, colours[i].hex, warehouse));
        return zones;
    }

    /**
     * Load the bays into the zone
     * @async
     */
    public async loadNextLayer(): Promise<void> {
        if (!this.isDeepLoaded)
            this.bays = await OnlineBay.loadFlatBays(this);
        this.isDeepLoaded = true;
    }

    //#region Children Getters
    get shelves(): OnlineShelf[] {
        return this.bays.flatMap(bay => bay.shelves);
    }

    get columns(): OnlineColumn[] {
        return this.shelves.flatMap(shelf => shelf.columns);
    }

    get trays(): OnlineTray[] {
        return this.columns.flatMap(column => column.trays);
    }

    //#endregion
}