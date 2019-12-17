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


/*
abstract class Layer {
    readonly id: string;

    constructor(id: string) {
        this.id = id;
    }

    protected abstract get dbName(): string;
}

abstract class TopLayer<TL> extends Layer {
    loaded: boolean = false;
    children: TL[] = [];

    public async loadChildren() {
        if (!this.loaded) {
            this.loaded = true;
        }
    }
}

abstract class MiddleLayer<TU, TL> extends Layer {
    parent?: TU;
    children: TL[] = [];

    public get firebasePath(): string {
        let path = "";
        if (this.parent) {
            let current: TU = this.parent;
            while (current instanceof MiddleLayer) {
                path += `/${current.dbName}/${current?.id}`;
                current = current.parent;
            }
        }
        return path;
    }
}

abstract class BottomLayer<TU> extends Layer {
    parent?: TU;
}


export class Warehouse extends TopLayer<Zone> {
    protected get dbName(): string {
        return "warehouses";
    }
}

export interface Warehouse {
    whProperty1: string;
    whProperty2: string;
    whProperty3: string;
}

export class Zone extends MiddleLayer<Warehouse, Bay> {
    protected get dbName(): string {
        return "warehouses";
    }
}

export interface Zone {
    zProperty1: string;
    zProperty2: string;
    zProperty3: string;
}

export class Bay extends MiddleLayer<Zone, Tray> {
    protected get dbName(): string {
        return "warehouses";
    }
}

export interface Bay {
    bProperty1: string;
    bProperty2: string;
    bProperty3: string;
}

export class Tray extends BottomLayer<Bay> {
    protected get dbName(): string {
        return "trays";
    }
}

export interface Tray {
    tProperty1: string;
    tProperty2: string;
    tProperty3: string;
}
*/
