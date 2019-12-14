/*
Warehouse
>   Settings
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

const cats = ["Baby Care", "Baby Food", "Nappies", "Beans", "Biscuits", "Cereal", "Choc/Sweet", "Coffee", "Cleaning", "Custard", "Feminine Hygiene", "Fish", "Fruit", "Fruit Juice", "Hot Choc", "Instant Meals", "Jam", "Meat", "Milk", "Misc", "Pasta", "Pasta Sauce", "Pet Food", "Potatoes", "Rice", "Rice Pud.", "Savoury Treats", "Soup", "Spaghetti", "Sponge Pud.", "Sugar", "Tea Bags", "Toiletries", "Tomatoes", "Vegetables", "Christmas"];

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
        let categories: Category[] = [];
        for (let i = 0; i < cats.length; i++)
            categories.push({ name: cats[i] });
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
        warehouse.zones = await Zone.loadZones(warehouse);
        warehouse.categories = await Warehouse.loadCategories();
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
        for (let i = 0; i < colours.length; i++)
        {
            let zone: Zone = new Zone(generateRandomId(), colours[i].label, colours[i].hex, warehouse);
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

    /**
     * Load all bays within a given zone
     * @async
     * @param zone - The zone to load the bays for
     * @returns A promise which resolves to all loaded bays within the zone
     */
    public static async loadBays(zone: Zone): Promise<Bay[]> {
        const bays: Bay[] = [];
        for (let i = 0; i < 3; i++)
        {
            let bay: Bay = new Bay(generateRandomId(), `Bay ${Math.random()}`, i, zone);
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

    /**
     * Load all shelves within a given bay
     * @async
     * @param bay - The bay to load the shelves for
     * @returns A promise which resolves to all loaded shelves within the bay
     */
    public static async loadShelves(bay: Bay): Promise<Shelf[]> {
        const shelves: Shelf[] = [];
        for (let i = 0; i < 3; i++)
        {
            let shelf: Shelf = new Shelf(generateRandomId(), `Shelf ${Math.random()}`, i, bay);
            shelf.columns = await Column.loadColumns(shelf);
            shelves.push(shelf);
        }
        return shelves;
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
        const columns: Column[] = [];
        for (let i = 0; i < 3; i++)
        {
            let column: Column = new Column(generateRandomId(), i, shelf);
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
    private constructor(id: string, parentColumn: Column, category?: Category, expiryRange?: ExpiryRange, weight?: number, customField?:string) {
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
        const trays: Tray[] = [];
        for (let i = 0; i < 3; i++) {
            let categories: Category[] = column?.parentShelf?.parentBay?.parentZone?.parentWarehouse?.categories ?? [{name: ""}];
            trays.push(new Tray(generateRandomId(), column,
                // This is not nice to look at...
                categories[Math.floor(categories.length * Math.random())],
                {from: 0, to: 1, label: "Past", color: "#FF0000"}, Math.floor(15 * Math.random()), undefined));
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
}

