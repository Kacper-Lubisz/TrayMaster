/*
Warehouse
>   SettingsPage
>   Categories
>   Zones
    >   Bays
        >   Shelves
            >   Columns
                >   Trays
>   Bays
>   Shelves
>   Columns
>   Trays
 */

const cats = [
    "Baby Care", "Baby Food", "Nappies", "Beans", "Biscuits", "Cereal", "Choc/Sweet", "Coffee", "Cleaning", "Custard",
    "Feminine Hygiene", "Fish", "Fruit", "Fruit Juice", "Hot Choc", "Instant Meals", "Jam", "Meat", "Milk", "Misc",
    "Pasta", "Pasta Sauce", "Pet Food", "Potatoes", "Rice", "Rice Pud.", "Savoury Treats", "Soup", "Spaghetti",
    "Sponge Pud.", "Sugar", "Tea Bags", "Toiletries", "Tomatoes", "Vegetables", "Christmas"
];

/**
 * Generate a pseudorandom firebase ID
 * @returns string - A randomly generated ID
 */
export function generateRandomId() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let id = "";
    for (let i = 0; i < 20; i++)
        id += chars[Math.floor(chars.length * Math.random())];
    return id;
}


export class Warehouse {
    id: string;
    name: string;

    zones: Zone[];
    categories: Category[];

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

    get bays() {
        return this.zones.flatMap(zone => zone.bays);
    }

    get shelves() {
        return this.bays.flatMap(bay => bay.shelves);
    }

    get columns() {
        return this.shelves.flatMap(shelf => shelf.columns);
    }

    get trays() {
        return this.columns.flatMap(column => column.trays);
    }

    /**
     * Load tray categories.
     * @async
     * @returns A promise which resolves to the list of categories in the warehouse
     */
    public static async loadCategories(): Promise<Category[]> {
        const categories: Category[] = [];
        for (let i = 0; i < cats.length; i++)
            categories.push({name: cats[i]});
        return categories;
    }

    /**
     * Load a whole warehouse corresponding to a given ID
     * @async
     * @param id - Database ID of the warehouse to load
     * @returns A promise which resolves to the fully loaded warehouse
     */
    public static async loadWarehouse(id: string): Promise<Warehouse> {
        const warehouse: Warehouse = new Warehouse(id, `Warehouse ${Math.random()}`);
        warehouse.categories = await Warehouse.loadCategories();
        warehouse.zones = await Zone.loadZones(warehouse);
        // fixme the order of these two lines determines if the warehouse is generated with random labels or not
        return warehouse;
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

    get shelves() {
        return this.bays.flatMap(bay => bay.shelves);
    }

    get columns() {
        return this.shelves.flatMap(shelf => shelf.columns);
    }

    get trays() {
        return this.columns.flatMap(column => column.trays);
    }

    /**
     * Load all zones within a given warehouse
     * @async
     * @param warehouse - The warehouse to load the zones for
     * @returns A promise which resolves to all loaded zones within the warehouse
     */
    public static async loadZones(warehouse: Warehouse): Promise<Zone[]> {
        const colours = [
            {label: "Red", hex: "#FF0000"},
            {label: "Green", hex: "#00FF00"},
            {label: "Blue", hex: "#0000FF"},
            {label: "White", hex: "#FFFFFF"},
            {label: "Black", hex: "#000000"}
        ];
        const zones: Zone[] = [];
        for (let i = 0; i < colours.length; i++) {
            const zone: Zone = new Zone(generateRandomId(), colours[i].label, colours[i].hex, warehouse);
            zone.bays = await Bay.loadBays(zone);
            zones.push(zone);
        }
        return zones;
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

    get parentWarehouse(): Warehouse | undefined {
        return this.parentZone?.parentWarehouse;
    }

    get columns() {
        return this.shelves.flatMap(shelf => shelf.columns);
    }

    get trays() {
        return this.columns.flatMap(column => column.trays);
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
            const bay: Bay = new Bay(generateRandomId(), String.fromCharCode(i + 65), i, zone);
            bay.shelves = await Shelf.loadShelves(bay);
            bays.push(bay);
        }
        return bays;
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

    get parentZone(): Zone | undefined {
        return this.parentBay?.parentZone;
    }

    get parentWarehouse(): Warehouse | undefined {
        return this.parentZone?.parentWarehouse;
    }

    get trays() {
        return this.columns.flatMap(column => column.trays);
    }

    /**
     * Load all shelves within a given bay
     * @async
     * @param bay - The bay to load the shelves for
     * @returns A promise which resolves to all loaded shelves within the bay
     */
    public static async loadShelves(bay: Bay): Promise<Shelf[]> {
        const shelves: Shelf[] = [];
        for (let i = 0; i < 3; i++) {
            const shelf: Shelf = new Shelf(generateRandomId(), `${i + 1}`, i, bay);
            shelf.columns = await Column.loadColumns(shelf);
            shelves.push(shelf);
        }
        return shelves;
    }

    public toString(): string {
        return `${this.parentZone?.name} ${this.parentBay?.name}${this.name}`; // todo decide and implement this shelf
                                                                               // toString
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

    get parentBay(): Bay | undefined {
        return this.parentShelf?.parentBay;
    }

    get parentZone(): Zone | undefined {
        return this.parentBay?.parentZone;
    }

    get parentWarehouse(): Warehouse | undefined {
        return this.parentZone?.parentWarehouse;
    }

    /**
     * Load all columns within a given column
     * @async
     * @param shelf - The shelf to load the columns for
     * @returns A promise which resolves to all columns within the shelf
     */
    public static async loadColumns(shelf: Shelf): Promise<Column[]> {
        const columns: Column[] = [];
        for (let i = 0; i < 3; i++) {
            const column: Column = new Column(generateRandomId(), i, shelf);
            column.trays = await Tray.loadTrays(column);
            columns.push(column);
        }
        return columns;
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

    get parentShelf(): Shelf | undefined {
        return this.parentColumn?.parentShelf;
    }

    get parentBay(): Bay | undefined {
        return this.parentShelf?.parentBay;
    }

    get parentZone(): Zone | undefined {
        return this.parentBay?.parentZone;
    }

    get parentWarehouse(): Warehouse | undefined {
        return this.parentZone?.parentWarehouse;
    }

    /**
     * Load all trays within a given column
     * @async
     * @param column - The column to load the trays for
     * @returns A promise which resolves to all trays within the column
     */
    public static async loadTrays(column: Column): Promise<Tray[]> {
        const trays: Tray[] = [];
        for (let i = 0; i < 3; i++) {
            const categories: Category[] = column?.parentWarehouse?.categories ?? [{name: ""}];
            const testExpires = [
                {
                    from: new Date(2020, 1).getTime(),
                    to: new Date(2020, 2).getTime(),
                    label: "Jan 2020",
                    color: "#FF0"
                },
                {
                    from: new Date(2020, 2).getTime(),
                    to: new Date(2020, 3).getTime(),
                    label: "Feb 2020",
                    color: "#0ff"
                },
                {
                    from: new Date(2020, 1).getTime(),
                    to: new Date(2020, 4).getTime(),
                    label: "Jan-Mar 2020",
                    color: "#00f"
                },
                {
                    from: new Date(2020, 4).getTime(),
                    to: new Date(2020, 7).getTime(),
                    label: "Apr-Jun 2020",
                    color: "#F0f"
                },
                {
                    from: new Date(2020, 1).getTime(),
                    to: new Date(2021, 1).getTime(),
                    label: "2020",
                    color: "#FF0000"
                },
                {
                    from: new Date(2021, 1).getTime(),
                    to: new Date(2022, 1).getTime(),
                    label: "2021",
                    color: "#0f0"
                },
            ];

            // This is not nice to look at...
            trays.push(new Tray(
                generateRandomId(),
                column,
                categories[Math.floor(categories.length * Math.random())],
                testExpires[Math.floor(testExpires.length * Math.random())],
                Number((15 * Math.random()).toFixed(2)),
                Math.random() < 0.1 ? "This is a custom field, it might be very long" : undefined
            ));
        }
        return trays;
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
    shortName?: string;
}

