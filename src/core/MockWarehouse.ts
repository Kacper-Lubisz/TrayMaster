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

const sizes: ColumnSize[] = [
    {label: "small", sizeRatio: 1.5},
    {label: "normal", sizeRatio: 2.5},
    {label: "big", sizeRatio: 3.5},
];

const colours = [
    {label: "Red", hex: "#FF0000"},
    {label: "Green", hex: "#00FF00"},
    {label: "Blue", hex: "#0000FF"},
    {label: "White", hex: "#FFFFFF"},
    {label: "Black", hex: "#000000"}
];

const expires: ExpiryRange[] = [
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

    columnSizes: ColumnSize[] = [];
    categories: Category[] = [];
    zones: Zone[] = [];

    // todo rename column size to tray size, load tray sizes

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
     * Load column sizes.
     * @async
     * @returns A promise which resolves to the list of column sizes in the warehouse
     */
    public static async loadColumnSizes(): Promise<ColumnSize[]> {
        const columnSizes: ColumnSize[] = [];
        for (let i = 0; i < sizes.length; i++)
            columnSizes.push({...sizes[i]});
        return columnSizes;
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
        warehouse.columnSizes = await Warehouse.loadColumnSizes();
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

interface ColumnSize {
    label: string;
    sizeRatio: number;
}

export class Column implements UpperLayer {

    /**
     * This stores the tray spaces.  The tray spaces must be stored and not rebuild each time because otherwise the two
     * different object would be different keys of the selection map
     */
    private static traySpaces: Map<Column, TraySpace[]> = new Map();

    isDeepLoaded: boolean = false;

    id: string;
    index: number;

    size?: ColumnSize;
    maxHeight?: number;

    parentShelf?: Shelf;
    trays: Tray[] = [];

    /**
     * @param id - The database ID of the column
     * @param index - The (ordered) index of the column within the shelf
     * @param parentShelf - The (nullable) parent shelf
     * @param size - The size of the tray
     * @param maxHeight - The maximum number of trays that can be placed in this column
     */
    private constructor(id: string, index: number, parentShelf?: Shelf, size?: ColumnSize, maxHeight?: number) {
        this.id = id;
        this.index = index;
        this.size = size;
        this.maxHeight = maxHeight;

        this.parentShelf = parentShelf;
    }

    /**
     * Create a column from a collection of trays
     * @param trays - The trays to put in the column
     * @param index - The index of the column within its shelf
     * @param parentShelf - The shelf the column belongs to
     * @param size - The column size
     * @param maxHeight - The max number of trays that can go in this column
     * @returns The newly created column
     */
    public static create(
        trays: Tray[],
        index?: number,
        parentShelf?: Shelf,
        size?: ColumnSize,
        maxHeight?: number
    ): Column {
        const column: Column = new Column(generateRandomId(), index ?? -1, parentShelf, size, maxHeight);
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

        const colNumber = shelf.index % 2 === 0 ? 4 : 2;

        for (let i = 0; i < colNumber; i++) {
            const sizes = shelf.parentWarehouse?.columnSizes!!;
            const size: ColumnSize = sizes[Math.floor(Math.random() * sizes.length)];
            const maxHeight = shelf.index % 2 === 0 ? Math.floor(Math.random() * 8 + 2)
                                                    : Math.random() < 0.5 ? 2
                                                                          : 10;

            const column: Column = new Column(generateRandomId(), i, shelf, size, maxHeight);
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

    /**
     * This method pads the tray arrays of a column with TraySpaces such that the the length of the returned array is
     * the max height of the column.  If the column has an undefined max height, it is padded with the specified value.
     * This method stores the tray spaces that are added in the traySpaces field such that the same TraySpace object is
     * always returned.  The same object being returned is important if it is going to be used as the key of a map.
     * @param ifNoMaxHeight The padding to add if maxHeight is empty
     * @return The padded array.
     */
    getPaddedTrays(ifNoMaxHeight: number = 1): TrayCell[] {

        const missingTrays = this.maxHeight ? Math.max(0, this.maxHeight - this.trays.length)
                                            : 1;

        const existing: TraySpace[] | undefined = Column.traySpaces.get(this);
        if (existing) {

            if (existing.length === missingTrays) {

                return (this.trays as TrayCell[]).concat(existing);

            } else if (existing.length > missingTrays) { // there are too many missing trays

                const newSpaces = existing.filter(space => space.index >= this.trays.length);

                Column.traySpaces.set(this, newSpaces);
                return (this.trays as TrayCell[]).concat(newSpaces);
            } else { // there are not enough tray spaces

                const traysToAdd = missingTrays - existing.length;
                const newSpaces = Array(traysToAdd).fill(0).map((_, index) => {
                        return ({column: this, index: this.trays.length + index} as TraySpace);
                    }
                ).concat(existing);

                Column.traySpaces.set(this, newSpaces);
                return (this.trays as TrayCell[]).concat(newSpaces);
            }

        } else { // build tray spaces

            const newSpaces = Array(missingTrays).fill(0).map((_, index) => {
                    return {column: this, index: this.trays.length + index};
                }
            );
            Column.traySpaces.set(this, newSpaces);

            return (this.trays as TrayCell[]).concat(newSpaces);

        }

    }


    /**
     * This method clears the padded spaces, this can be used to reset empty spaces or otherwise to clear up memory
     * which will no longer be used.  If a column is passed then only that column is purged otherwise all columns are.
     */
    static purgePaddedSpaces(column?: Column) {
        if (column) {
            Column.traySpaces.delete(column);
        } else {
            Column.traySpaces.clear();
        }
    }

}


export interface TraySpace {
    column: Column;
    index: number;
}

export type TrayCell = Tray | TraySpace;

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
        const categories: Category[] = column?.parentWarehouse?.categories ?? [{name: ""}];

        const height = Math.random() > 0.5 ? column.maxHeight ?? 3
                                           : Math.min(3, column.maxHeight ?? 3);

        for (let i = 0; i < height; i++) {
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
    color: string;
}


export interface Category {
    name: string;
    shortName?: string;
}
