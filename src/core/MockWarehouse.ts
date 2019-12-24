import "dayjs";
import dayjs, {Dayjs} from "dayjs";
import {hslToHex} from "./hslToHex";

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

const cats = [
    "Baby Care", "Baby Food", "Nappies", "Beans", "Biscuits", "Cereal", "Choc/Sweet", "Coffee", "Cleaning", "Custard",
    "Feminine Hygiene", "Fish", "Fruit", "Fruit Juice", "Hot Choc", "Instant Meals", "Jam", "Meat", "Milk", "Misc",
    "Pasta", "Pasta Sauce", "Pet Food", "Potatoes", "Rice", "Rice Pud.", "Savoury Treats", "Soup", "Spaghetti",
    "Sponge Pud.", "Sugar", "Tea Bags", "Toiletries", "Tomatoes", "Vegetables", "Christmas"
];

const colours = [
    {label: "Red", hex: "#FF0000"},
    {label: "Green", hex: "#00FF00"},
    {label: "Blue", hex: "#0000FF"},
    {label: "White", hex: "#FFFFFF"},
    {label: "Black", hex: "#000000"}
];

/**
 * Period to use for a complete cycle around the hue colour wheel
 * Using 8 currently because that's the number on the expiry keyboard (and what common food lasts longer than 8 years??)
 */
const YEAR_PERIOD = 8;

/**
 * Takes in the length of an expiry range in days (1-366 inclusive) and returns a saturation value to use
 * Used inside getExpiryColour
 * @see getExpiryColour
 * @param days - the length of an expiry range in days
 * @return number - the saturation to use for that range
 */
function getSaturation(days: number) {
    if (days <= 0) return 1;        // not a valid range - TODO: decide whether to return 1 or 0 here
    //if (days <= 20) return 1;       // less than a month  TODO: also decide whether we should throw errors for bad nos
    if (days <= 40) return 1;     // month
    if (days <= 100) return 0.75;    // quarter
    if (days <= 183) return 0.6;   // 6 months
    if (days <= 366) return 0.5;    // year
    return 0;                       // more than a year
}

/**
 * Takes in an ExpiryRange object and returns a hex colour to use for that range
 * Hue depends on the start time of the expiry range in an 8 year cycle
 * Saturation depends on the length of the range (more precision = more intense colour)
 * @param range {ExpiryRange} - the expiry range to return a colour for
 * @return string - the 7-digit hex value to use for that expiry range
 */
export function getExpiryColour(range: ExpiryRange) {
    // get a dayjs date corresponding to the from property of the range, to use later
    const djsDate: Dayjs = dayjs(range.from);

    // Year modulo YEAR_PERIOD
    const modYear: number = djsDate.year() % YEAR_PERIOD;

    // Ratio of the way through the month
    const ratioMonth: number = (djsDate.date()) / djsDate.date(-1).date();

    // Ratio of the way through the year
    const ratioYear: number = ((djsDate.month()) + ratioMonth) / 12;

    // Ratio of the way through the period
    const ratioPeriod = (modYear + ratioYear) / YEAR_PERIOD;

    // get saturation from difference between from and to and return hex value
    const saturation = getSaturation(dayjs(range.to).diff(djsDate, "day"));
    return hslToHex(ratioPeriod * 360, saturation, 1);
}

let expires = [
    {
        from: new Date(2020, 0).getTime(),
        to: new Date(2021, 0).getTime(),
        label: "2020",
        color: ""
    },
    {
        from: new Date(2021, 0).getTime(),
        to: new Date(2022, 0).getTime(),
        label: "2021",
        color: ""
    },
    {
        from: new Date(2022, 0).getTime(),
        to: new Date(2023, 0).getTime(),
        label: "2022",
        color: ""
    },
    {
        from: new Date(2023, 0).getTime(),
        to: new Date(2024, 0).getTime(),
        label: "2023",
        color: ""
    },
    {
        from: new Date(2024, 0).getTime(),
        to: new Date(2025, 0).getTime(),
        label: "2024",
        color: ""
    },
    {
        from: new Date(2025, 0).getTime(),
        to: new Date(2026, 0).getTime(),
        label: "2025",
        color: ""
    },
    {
        from: new Date(2026, 0).getTime(),
        to: new Date(2027, 0).getTime(),
        label: "2026",
        color: ""
    },
    {
        from: new Date(2027, 0).getTime(),
        to: new Date(2028, 0).getTime(),
        label: "2027",
        color: ""
    },
    {
        from: new Date(2020, 0).getTime(),
        to: new Date(2020, 3).getTime(),
        label: "Jan-Mar 2020",
        color: ""
    },
    {
        from: new Date(2020, 3).getTime(),
        to: new Date(2020, 6).getTime(),
        label: "Apr-Jun 2020",
        color: ""
    },
    {
        from: new Date(2020, 6).getTime(),
        to: new Date(2020, 9).getTime(),
        label: "Jul-Sep 2020",
        color: ""
    },
    {
        from: new Date(2020, 9).getTime(),
        to: new Date(2021, 0).getTime(),
        label: "Oct-Dec 2020",
        color: ""
    },
    {
        from: new Date(2020, 1).getTime(),
        to: new Date(2020, 2).getTime(),
        label: "Feb 2020",
        color: ""
    },
    {
        from: new Date(2024, 10).getTime(),
        to: new Date(2024, 11).getTime(),
        label: "Nov 2022",
        color: ""
    },
    {
        from: new Date(2024, 4).getTime(),
        to: new Date(2024, 5).getTime(),
        label: "May 2024",
        color: ""
    },
    {
        from: new Date(2026, 7).getTime(),
        to: new Date(2026, 8).getTime(),
        label: "August 2026",
        color: ""
    },
];
// fixme this is a bit of a janky solution: I wrote it as a stopgap until we start dynamically generating expiry ranges
// fixme        rather than requiring an explicit list.
expires = expires.map((exp) => {
    exp.color = getExpiryColour(exp);
    return exp;
});


/**
 * Generate a pseudorandom firebase ID
 * @returns string - A randomly generated ID
 */
export function generateRandomId(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let id = "";
    for (let i = 0; i < 20; i++)
        id += chars[Math.floor(chars.length * Math.random())];
    return id;
}

/**
 * All non-tray warehouse model classes may be only shallow loaded at a time, this
 * interface begins to unify the warehouse model for consistent recursive data access.
 */
interface UpperLayer {
    isDeepLoaded: boolean;

    loadNextLayer(): Promise<void>;
}


export class Warehouse implements UpperLayer {
    isDeepLoaded: boolean = false;

    id: string;
    name: string;

    categories: Category[] = [];
    zones: Zone[] = [];

    /**
     * @param id firebase - The database ID of the warehouse
     * @param name - The name of the warehouse
     */
    private constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
    }

    /**
     * Create a warehouse from a collection of zones
     * @param zones - The zones to put in the warehouse
     * @param name - The name of the warehouse
     * @returns The newly created warehouse
     */
    public static create(zones: Zone[], name?: string): Warehouse {
        const warehouse: Warehouse = new Warehouse(generateRandomId(), name ?? "");
        warehouse.zones = zones;
        for (let i = 0; i < warehouse.zones.length; i++)
            warehouse.zones[i].placeInWarehouse(warehouse);
        return warehouse;
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
        warehouse.isDeepLoaded = true;
        return warehouse;
    }

    /**
     * Load a warehouse (without any zones) by ID
     * @async
     * @param id
     * @returns A promise which resolves to the flat warehouse
     */
    public static async loadFlatWarehouse(id: string): Promise<Warehouse> {
        const warehouse: Warehouse = new Warehouse(id, `Warehouse ${Math.random()}`);
        warehouse.categories = await Warehouse.loadCategories();
        return warehouse;
    }

    /**
     * Load the zones into the warehouse
     * @async
     */
    public async loadNextLayer(): Promise<void> {
        if (!this.isDeepLoaded)
            this.zones = await Zone.loadFlatZones(this);
        this.isDeepLoaded = true;
    }

    //#region Children Getters
    get bays(): Bay[] {
        return this.zones.flatMap(zone => zone.bays);
    }

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


export class Zone implements UpperLayer {
    isDeepLoaded: boolean = false;

    id: string;
    name: string;
    color: string;

    parentWarehouse?: Warehouse;
    bays: Bay[] = [];

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
        const zone: Zone = new Zone(generateRandomId(), name ?? "", color ?? "#000000", parentWarehouse);
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
    public placeInWarehouse(parentWarehouse: Warehouse, name?: string) {
        this.parentWarehouse = parentWarehouse;
        this.name = name ?? this.name;
    }

    /**
     * Load all zones within a given warehouse
     * @async
     * @param warehouse - The warehouse to load the zones for
     * @returns A promise which resolves to all loaded zones within the warehouse
     */
    public static async loadZones(warehouse: Warehouse): Promise<Zone[]> {
        const zones: Zone[] = [];
        for (let i = 0; i < colours.length; i++) {
            const zone: Zone = new Zone(generateRandomId(), colours[i].label, colours[i].hex, warehouse);
            zone.bays = await Bay.loadBays(zone);
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
    public static async loadFlatZones(warehouse: Warehouse): Promise<Zone[]> {
        const zones: Zone[] = [];
        for (let i = 0; i < colours.length; i++)
            zones.push(new Zone(generateRandomId(), colours[i].label, colours[i].hex, warehouse));
        return zones;
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
        const bay: Bay = new Bay(generateRandomId(), name ?? "", index ?? -1, parentZone);
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
            const bay: Bay = new Bay(generateRandomId(), String.fromCharCode(i + 65), i, zone);
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
        for (let i = 0; i < colours.length; i++)
            bays.push(new Bay(generateRandomId(), `Bay ${Math.random()}`, i, zone));
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


export class Shelf implements UpperLayer {
    isDeepLoaded: boolean = false;

    id: string;
    name: string;
    index: number;

    parentBay?: Bay;
    columns: Column[] = [];

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
    }

    /**
     * Create a shelf from a collection of columns
     * @param columns - The columns to put in the shelf
     * @param name - The name of the shelf
     * @param index - The index of the shelf within its bay
     * @param parentBay - The bay the shelf belongs to
     * @returns The newly created shelf
     */
    public static create(columns: Column[], name?: string, index?: number, parentBay?: Bay): Shelf {
        const shelf: Shelf = new Shelf(generateRandomId(), name ?? "", index ?? -1);
        shelf.columns = columns;
        for (let i = 0; i < shelf.columns.length; i++)
            shelf.columns[i].placeInShelf(i, shelf);
        return shelf;
    }

    /**
     * Place the shelf within a bay
     * @param index - The index of the shelf within the bay
     * @param parentBay - The bay the shelf is being added to
     * @param name - The name of the shelf
     */
    public placeInBay(index: number, parentBay: Bay, name?: string) {
        this.index = index;
        this.parentBay = parentBay;
        this.name = name ?? this.name;
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
            shelf.isDeepLoaded = true;
            shelves.push(shelf);
        }
        return shelves;
    }

    public toString(): string {
        return `${this.parentZone?.name} ${this.parentBay?.name}${this.name}`;
        // todo decide and implement this shelf toString
    }

    /**
     * Load all shelves (without any columns) in a bay
     * @async
     * @param bay - The bay to load the shelves for
     * @returns A promise which resolves to the flat shelf list
     */
    public static async loadFlatShelves(bay: Bay): Promise<Shelf[]> {
        const shelves: Shelf[] = [];
        for (let i = 0; i < colours.length; i++)
            shelves.push(new Shelf(generateRandomId(), `Shelf ${Math.random()}`, i, bay));
        return shelves;
    }

    /**
     * Load the columns into the shelf
     * @async
     */
    public async loadNextLayer(): Promise<void> {
        if (!this.isDeepLoaded)
            this.columns = await Column.loadFlatColumns(this);
        this.isDeepLoaded = true;
    }

    //#region Children Getters
    get trays(): Tray[] {
        return this.columns.flatMap(column => column.trays);
    }

    //#endregion

    //#region Parent Getters
    get parentZone(): Zone | undefined {
        return this.parentBay?.parentZone;
    }

    get parentWarehouse(): Warehouse | undefined {
        return this.parentZone?.parentWarehouse;
    }

    //#endregion
}


export class Column implements UpperLayer {
    isDeepLoaded: boolean = false;

    id: string;
    index: number;

    parentShelf?: Shelf;
    trays: Tray[] = [];

    /**
     * @param id - The database ID of the column
     * @param index - The (ordered) index of the column within the shelf
     * @param parentShelf - The (nullable) parent shelf
     */
    private constructor(id: string, index: number, parentShelf?: Shelf) {
        this.id = id;
        this.index = index;

        this.parentShelf = parentShelf;
    }

    /**
     * Create a column from a collection of trays
     * @param trays - The trays to put in the column
     * @param index - The index of the column within its shelf
     * @param parentShelf - The shelf the column belongs to
     * @returns The newly created column
     */
    public static create(trays: Tray[], index?: number, parentShelf?: Shelf): Column {
        const column: Column = new Column(generateRandomId(), index ?? -1, parentShelf);
        column.trays = trays;
        for (let i = 0; i < column.trays.length; i++)
            column.trays[i].placeInColumn(i, column);
        return column;
    }

    /**
     * Place the column within a shelf
     * @param index - The index of the column within the shelf
     * @param parentShelf - The shelf the column is being added to
     */
    public placeInShelf(index: number, parentShelf: Shelf) {
        this.index = index;
        this.parentShelf = parentShelf;
    }

    /**
     * Load all columns within a given column
     * @async
     * @param shelf - The shelf to load the columns for
     * @returns A promise which resolves to all columns within the shelf
     */
    public static async loadColumns(shelf: Shelf): Promise<Column[]> {
        const columns: Column[] = [];
        for (let i = 0; i < 4; i++) {
            const column: Column = new Column(generateRandomId(), i, shelf);
            column.trays = await Tray.loadTrays(column);
            column.isDeepLoaded = true;
            columns.push(column);
        }
        return columns;
    }

    /**
     * Load all columns (without any trays) in a shelf
     * @async
     * @param shelf - The shelf to load the columns for
     * @returns A promise which resolves to the flat column list
     */
    public static async loadFlatColumns(shelf: Shelf): Promise<Column[]> {
        const columns: Column[] = [];
        for (let i = 0; i < colours.length; i++)
            columns.push(new Column(generateRandomId(), i, shelf));
        return columns;
    }

    /**
     * Load the trays into the column
     * @async
     */
    public async loadNextLayer(): Promise<void> {
        if (!this.isDeepLoaded)
            this.trays = await Tray.loadTrays(this);
        this.isDeepLoaded = true;
    }

    //#region Parent Getters
    get parentBay(): Bay | undefined {
        return this.parentShelf?.parentBay;
    }

    get parentZone(): Zone | undefined {
        return this.parentBay?.parentZone;
    }

    get parentWarehouse(): Warehouse | undefined {
        return this.parentZone?.parentWarehouse;
    }

    //#endregion
}


export class Tray {
    id: string;
    index: number;

    customField?: string;
    category?: Category;
    expiry?: ExpiryRange;
    weight?: number;

    parentColumn?: Column;

    /**
     * @param id - The database ID of the tray
     * @param index - The index of the tray within the column
     * @param category - The tray's (nullable) category
     * @param expiryRange - The tray's (nullable) expiry range
     * @param weight - The tray's (nullable) weight
     * @param customField - The tray's (nullable) custom field
     * @param parentColumn - The (nullable) parent column
     */
    private constructor(
        id: string, index: number, category?: Category, expiryRange?: ExpiryRange,
        weight?: number, customField?: string, parentColumn?: Column
    ) {
        this.id = id;
        this.index = index;

        this.category = category;
        this.weight = weight;
        this.expiry = expiryRange;
        this.customField = customField;
        this.parentColumn = parentColumn;
    }

    /**
     * Create a new tray
     * @param category - The tray's (nullable) category
     * @param expiryRange - The tray's (nullable) expiry range
     * @param weight - The tray's (nullable) weight
     * @param customField - The tray's (nullable) custom field
     * @param index - The index of the tray within the column
     * @param parentColumn - The (nullable) parent column
     */
    public static create(
        category?: Category, expiryRange?: ExpiryRange, weight?: number,
        customField?: string, index?: number, parentColumn?: Column
    ): Tray {
        return new Tray(generateRandomId(), index ?? -1, category, expiryRange, weight, customField, parentColumn);
    }

    /**
     * Place the tray within a column
     * @param index - The index of the tray within the column
     * @param parentColumn - The column the tray is being added to
     */
    public placeInColumn(index: number, parentColumn: Column) {
        this.index = index;
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
            const categories: Category[] = column?.parentWarehouse?.categories ?? [{name: ""}];
            trays.push(new Tray(
                generateRandomId(),
                i,
                categories[Math.floor(categories.length * Math.random())],
                expires[Math.floor(expires.length * Math.random())],
                Number((15 * Math.random()).toFixed(2)),
                Math.random() < 0.1 ? "This is a custom field, it might be very long" : undefined,
                column
            ));
        }
        return trays;
    }

    //#region Parent Getters
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

    //#endregion
}


export interface ExpiryRange {
    from: number;
    to: number;
    label: string;
}


export interface Category {
    name: string;
    shortName?: string;
}