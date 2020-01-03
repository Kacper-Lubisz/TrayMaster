import {Warehouse} from "./Warehouse";
import {Layer} from "../Layer";
import {Bay} from "./Bay";
import {Shelf} from "./Shelf";
import {Column} from "./Column";
import {Tray} from "./Tray";
import {ONLINE} from "../../WarehouseModel";
import Utils from "../Utils";


const colours = [
    {name: "Red", color: "#FF0000"},
    {name: "Green", color: "#00FF00"},
    {name: "Blue", color: "#0000FF"},
    {name: "White", color: "#FFFFFF"},
    {name: "Black", color: "#000000"}
];


interface ZoneFields {
    name: string;
    color: string;
}


export class Zone extends Layer<ZoneFields> {
    isDeepLoaded: boolean;

    parentWarehouse?: Warehouse;
    bays: Bay[] = [];

    /**
     * @param id - The database ID for the zone
     * @param name - The name of the zone
     * @param color - The hex colour of the zone
     * @param parentWarehouse - The (nullable) parent warehouse
     */
    private constructor(id: string, name: string, color: string, parentWarehouse?: Warehouse) {
        super({name: name, color: color}, parentWarehouse?.childCollection("zones") ?? "zones", id);
        this.parentWarehouse = parentWarehouse;
        this.isDeepLoaded = false;
    }

    public get name(): string {
        return this.fields.name;
    }

    public set name(name: string) {
        this.fields.name = name;
        this.fieldChange();
    }

    public get color(): string {
        return this.fields.color;
    }

    public set color(color: string) {
        this.fields.color = color;
        this.fieldChange();
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
        const zone: Zone = new Zone(Utils.generateRandomId(), name ?? "", color ?? "#000000", parentWarehouse);
        zone.bays = bays;
        for (let i = 0; i < zone.bays.length; i++)
            zone.bays[i].placeInZone(i, zone);
        return zone;
    }

    /**
     * Place the zone within a warehouse
     * @param parentWarehouse - The warehouse the zone is being added to
     */
    public placeInWarehouse(parentWarehouse: Warehouse): void {
        this.parentWarehouse = parentWarehouse;
    }

    /**
     * Load all zones within a given warehouse
     * @async
     * @param warehouse - The warehouse to load the zones for
     * @returns A promise which resolves to all loaded zones within the warehouse
     */
    public static async loadZones(warehouse: Warehouse): Promise<Zone[]> {
        if (ONLINE) {
            const zones: Zone[] = await this.loadChildObjects<Zone, ZoneFields, Warehouse>(warehouse, "zones", "name");
            for (const zone of zones) {
                zone.bays = await Bay.loadBays(zone);
                zone.isDeepLoaded = true;
            }
            return zones;
        } else {
            const zones: Zone[] = [];
            for (const colour of colours) {
                const zone: Zone = new Zone(Utils.generateRandomId(), colour.name, colour.color, warehouse);
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
            return await this.loadChildObjects<Zone, ZoneFields, Warehouse>(warehouse, "zones", "name");
        else {
            const zones: Zone[] = [];
            for (const colour of colours) {
                zones.push(new Zone(Utils.generateRandomId(), colour.name, colour.color, warehouse));
            }
            return zones;
        }
    }

    /**
     * Load the bays into the zone
     * @async
     */
    public async loadChildren(): Promise<void> {
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
