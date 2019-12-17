import {db} from "./database";
import {firestore} from "firebase";


export class Warehouse {
    public id: string;
    public name: string;

    public zones: Zone[];
    public categories: Category[];

    /**
     * @param id firebase - The database ID of the warehouse
     * @param name - The name of the warehouse
     */
    private constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
        this.zones = [];
        this.categories = [];
    }

    /**
     * Load tray categories.
     * @async
     * @returns A promise which resolves to the list of categories in the warehouse
     */
    public static async loadCategories(): Promise<Category[]> {
        return [];
    }

    /**
     * Load a whole warehouse corresponding to a given ID
     * @async
     * @param id - Database ID of the warehouse to load
     * @returns A promise which resolves to the fully loaded warehouse
     */
    public static async loadWarehouse(id: string): Promise<Warehouse> {
        return new Warehouse(id, "");
    }
}


export class Zone {
    id: string;
    name: string;
    color: string;

    parentWarehouse?: Warehouse;
    bays: Bay[];

    /**
     * @param id - The database ID for the zone
     * @param name - The name of the zone
     * @param color - The hex colour of the zone
     * @param parentWarehouse - The (nullable) parent warehouse
     */
    private constructor(id: string, name: string, color: string, parentWarehouse?: Warehouse) {
        this.id = id;
        this.name = name;
        this.color = color;

        this.parentWarehouse = parentWarehouse;
        this.bays = [];
    }

    /**
     * Load all zones within a given warehouse
     * @async
     * @param warehouse - The warehouse to load the zones for
     * @returns A promise which resolves to all loaded zones within the warehouse
     */
    public static async loadZones(warehouse: Warehouse): Promise<Zone[]> {
        return [];
    }
}


export class Bay {
    id: string;
    name: string;
    index: number;

    parentZone?: Zone;
    shelves: Shelf[];

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
        this.shelves = [];
    }

    /**
     * Load all bays within a given zone
     * @async
     * @param zone - The zone to load the bays for
     * @returns A promise which resolves to all loaded bays within the zone
     */
    public static async loadBays(zone: Zone): Promise<Bay[]> {
        return [];
    }
}


export class Shelf {
    id: string;
    name: string;
    index: number;

    parentBay?: Bay;
    columns: Column[];

    /**
     * @param id - The database ID for the shelf
     * @param name - The name of the shelf
     * @param index - The (ordered) index of the shelf within the bay
     * @param parentBay - The (nullable) parent bay
     */
    private constructor(id: string, name: string, index: number, parentBay?: Bay) {
        this.id = id;
        this.name = name;
        this.index = index;

        this.parentBay = parentBay;
        this.columns = [];
    }

    /**
     * Load all shelves within a given bay
     * @async
     * @param bay - The bay to load the shelves for
     * @returns A promise which resolves to all loaded shelves within the bay
     */
    public static async loadShelves(bay: Bay): Promise<Shelf[]> {
        return [];
    }
}


export class Column {
    id: string;
    index: number;

    parentShelf?: Shelf;
    trays: Tray[];

    /**
     * @param id - The database ID of the column
     * @param index - The (ordered) index of the column within the shelf
     * @param parentShelf - The (nullable) parent shelf
     */
    private constructor(id: string, index: number, parentShelf?: Shelf) {
        this.id = id;
        this.index = index;

        this.parentShelf = parentShelf;
        this.trays = [];
    }

    /**
     * Load all columns within a given column
     * @async
     * @param shelf - The shelf to load the columns for
     * @returns A promise which resolves to all columns within the shelf
     */
    public static async loadColumns(shelf: Shelf): Promise<Column[]> {
        return [];
    }
}


export class Tray {
    id: string;
    parentColumn?: Column;
    customField?: string;
    category?: Category;
    expiry?: ExpiryRange;
    weight?: number;

    /**
     * @param id - The database ID of the tray
     * @param parentColumn - The (nullable) parent column
     * @param category - The tray's (nullable) category
     * @param expiryRange - The tray's (nullable) expiry range
     * @param weight - The tray's (nullable) weight
     * @param customField - The tray's (nullable) custom field
     */
    private constructor(
        id: string, parentColumn: Column, category?: Category, expiryRange?: ExpiryRange, weight?: number,
        customField?: string
    ) {
        this.id = id;
        this.category = category;
        this.weight = weight;
        this.expiry = expiryRange;
        this.customField = customField;
        this.parentColumn = parentColumn;
    }

    /**
     * Load all trays within a given column
     * @async
     * @param column - The column to load the trays for
     * @returns A promise which resolves to all trays within the column
     */
    public static async loadTrays(column: Column): Promise<Tray[]> {
        return [];
    }
}


export interface ExpiryRange {
    from: number;
    to: number;
    label: string;
    color: string;
}


export interface Category {
    name: string;
}


/**
 * Generate a random warehouse in the firebase database
 * @async
 */
export async function createTestWarehouse() {
    const warehouseRef = db.collection("warehouses");
    const warehouseSnapshot = await warehouseRef.add({name: `Warehouse ${Math.random()}`});

    let categorySnapshot = [];
    for (let i: number = 0; i < 25; i++)
        categorySnapshot.push(await warehouseRef.doc(warehouseSnapshot.id).collection("categories")
            .add({name: `Category ${Math.random()}`}));

    let traySnapshots = [];
    const colours = [
        {label: "Red", hex: "#FF0000"},
        {label: "Green", hex: "#00FF00"},
        {label: "Blue", hex: "#0000FF"},
        {label: "White", hex: "#FFFFFF"},
        {label: "Black", hex: "#000000"}
    ];
    const zonesRef = warehouseRef.doc(warehouseSnapshot.id).collection("zones");
    for (let i: number = 0; i < colours.length; i++) {
        let zoneSnapshot = await zonesRef.add({colour: colours[i]});
        let zoneRef = zonesRef.doc(zoneSnapshot.id);

        const baysRef = zoneRef.collection("bays");
        for (let j: number = 0; j < 5; j++) {
            let baySnapshot = await baysRef.add({name: `Bay ${Math.random()}`});
            let bayRef = baysRef.doc(baySnapshot.id);

            const shelvesRef = bayRef.collection("shelves");
            for (let k: number = 0; k < 25; k++) {
                let shelfSnapshot = await shelvesRef.add({
                    name: `Shelf ${Math.random()}`,
                    maxWeight: 100 + Math.trunc(500 * Math.random())
                });
                let shelfRef = shelvesRef.doc(shelfSnapshot.id);

                const columnsRef = shelfRef.collection("columns");
                for (let k: number = 0; k < 4; k++) {
                    let maxHeight = 2 + Math.trunc(3 * Math.random());
                    let columnSnapshot = await columnsRef.add({maxHeight: maxHeight});
                    let columnRef = columnsRef.doc(columnSnapshot.id);

                    const traysRef = columnRef.collection("trays");
                    for (let l: number = 0; l < Math.floor(maxHeight * Math.random()); l++) {
                        let fromDate = new firestore.Timestamp(1576591600 + Math.trunc(157766400 * Math.random()), 0);
                        let tray = {
                            category: categorySnapshot[Math.trunc(categorySnapshot.length * Math.random())].path,
                            customField: `${Math.random()}`,
                            expiry: {
                                from: fromDate,
                                to: new firestore.Timestamp(fromDate.seconds + 31536000, 0),
                                label: `${Math.random()} time`
                            }
                        };
                        let trayRef = await traysRef.add(tray);
                        let traySearchReference = {
                            category: tray.category,
                            customField: tray.customField,
                            expiry: tray.expiry,
                            location: trayRef.path
                        };
                        traySnapshots.push(await warehouseRef.doc(warehouseSnapshot.id).collection("trays")
                            .add(traySearchReference));
                    }
                }
            }
        }
    }
}
