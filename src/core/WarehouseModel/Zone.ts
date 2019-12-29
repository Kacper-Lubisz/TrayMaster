import {Warehouse} from "./Warehouse";
import {UpperLayer} from "./UpperLayer";
import {Bay} from "./Bay";
import {Shelf} from "./Shelf";
import {Column} from "./Column";
import {Tray} from "./Tray";
import {ONLINE} from "../WarehouseModel";
import {Utils} from "./Utils";

const colours = [
    {label: "Red", hex: "#FF0000"},
    {label: "Green", hex: "#00FF00"},
    {label: "Blue", hex: "#0000FF"},
    {label: "White", hex: "#FFFFFF"},
    {label: "Black", hex: "#000000"}
];


export class Zone extends UpperLayer {
    name: string;
    color: string;

    parentWarehouse?: Warehouse;
    bays: Bay[] = [];

    /**
     * @param path - The database path for the zone
     * @param name - The name of the zone
     * @param color - The hex colour of the zone
     * @param parentWarehouse - The (nullable) parent warehouse
     */
    private constructor(path: string, name: string, color: string, parentWarehouse?: Warehouse) {
        super(path);
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
    public static create(bays: Bay[], name?: string, color?: string, parentWarehouse?: Warehouse): Zone {
        const zone: Zone = new Zone("", name ?? "", color ?? "#000000", parentWarehouse);
        zone.bays = bays;
        for (let i = 0; i < zone.bays.length; i++)
            zone.bays[i].placeInZone(i, zone);
        return zone;
    }

    /**
     * Place the zone within a warehouse
     * @param parentWarehouse - The warehouse the zone is being added to
     */
    public placeInWarehouse(parentWarehouse: Warehouse) {
        this.parentWarehouse = parentWarehouse;
    }

    public async saveLayer(): Promise<void> {

    }

    /**
     * Load all zones within a given warehouse
     * @async
     * @param warehouse - The warehouse to load the zones for
     * @returns A promise which resolves to all loaded zones within the warehouse
     */
    public static async loadZones(warehouse: Warehouse): Promise<Zone[]> {
        if (ONLINE) {
            const zones: Zone[] = await this.loadChildObjects<Zone, Warehouse>(warehouse, "zones", "name");
            for (let zone of zones) {
                zone.bays = await Bay.loadBays(zone);
                zone.isDeepLoaded = true;
            }
            return zones;
        } else {
            const zones: Zone[] = [];
            for (let i = 0; i < colours.length; i++) {
                const zone: Zone = new Zone(Utils.generateRandomId(), colours[i].label, colours[i].hex, warehouse);
                zone.bays = await Bay.loadBays(zone);
                zone.isDeepLoaded = true;
                zones.push(zone);
            }
            return zones;
        }
    }

    /**
     * Load all zones (without any bays) in a warehouse
     * @async
     * @param warehouse - The warehouse to load the zones for
     * @returns A promise which resolves to the flat zones list
     */
    public static async loadFlatZones(warehouse: Warehouse): Promise<Zone[]> {
        if (ONLINE)
            return await this.loadChildObjects<Zone, Warehouse>(warehouse, "zones", "name");
        else {
            const zones: Zone[] = [];
            for (let i = 0; i < colours.length; i++)
                zones.push(new Zone(Utils.generateRandomId(), colours[i].label, colours[i].hex, warehouse));
            return zones;
        }
    }

    /**
     * Load the bays into the zone
     * @async
     */
    public async loadNextLayer(): Promise<void> {
        if (!this.isDeepLoaded)
            this.bays = await Bay.loadFlatBays(this);
        this.isDeepLoaded = true;
    }

    //#region Children Getters
    get shelves(): Shelf[] {
        return this.bays.flatMap(bay => bay.shelves);
    }

    get columns(): Column[] {
        return this.shelves.flatMap(shelf => shelf.columns);
    }

    get trays(): Tray[] {
        return this.columns.flatMap(column => column.trays);
    }

    //#endregion
}
