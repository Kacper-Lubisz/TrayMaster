// TODO: Document

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

    private constructor(id: string, name: string) {
        this.id = id;
        this.name = name;
        this.zones = [];
        this.categories = [];
    }

    public static async loadCategories() {
        let categories: Category[] = [];
        for (let i = 0; i < cats.length; i++)
            categories.push({ name: cats[i] });
        return categories;
    }

    public static async loadWarehouse(id: string) {
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

    private constructor(id: string, name: string, color: string, parentWarehouse: Warehouse) {
        this.id = id;
        this.name = name;
        this.color = color;

        this.parentWarehouse = parentWarehouse;
        this.bays = [];
    }

    public static async loadZones(warehouse: Warehouse) {
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

    private constructor(id: string, name: string, index: number, parentZone: Zone) {
        this.id = id;
        this.name = name;
        this.index = index;

        this.parentZone = parentZone;
        this.shelves = [];
    }

    public static async loadBays(zone: Zone) {
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

    private constructor(id: string, name: string, index: number, parentBay: Bay) {
        this.id = id;
        this.name = name;
        this.index = index;

        this.parentBay = parentBay;
        this.columns = [];
    }

    public static async loadShelves(bay: Bay) {
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

    private constructor(id: string, index: number, parentShelf: Shelf) {
        this.id = id;
        this.index = index;

        this.parentShelf = parentShelf;
        this.trays = [];
    }

    public static async loadColumns(shelf: Shelf) {
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

export interface ExpiryRange {
    from: number;
    to: number;
    label: string;
    color: string;
}

export class Tray {
    id: string;
    parentColumn?: Column;
    customField?: string;
    category?: Category;
    expiry?: ExpiryRange;
    weight?: number;

    private constructor(id: string, parentColumn: Column, category?: Category, expiryRange?: ExpiryRange, weight?: number, customField?:string) {
        this.id = id;
        this.category = category;
        this.weight = weight;
        this.expiry = expiryRange;
        this.customField = customField;
        this.parentColumn = parentColumn;
    }

    public static async loadTrays(column: Column) {
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

export interface Category {
    name: string;
}

