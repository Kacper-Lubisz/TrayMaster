import "./database"

export class Warehouse {
    uid: string;
    name: string;
    zones: Zone[];

    private constructor(zones: Zone[]) {
        this.uid = "";
        this.name = "";
        this.zones = zones;
    }

    static async loadWarehouse() {
        new Warehouse([]);
    }
}

/**
 * @property color The color of the zone as a hex string eg. '#ff0000'
 */
export class Zone {
    name: string;
    color: string;

    parentWarehouse: Warehouse;
    bays: Bay[];

    private constructor(parentWarehouse: Warehouse) {
        this.name = "";
        this.color = "";

        this.parentWarehouse = parentWarehouse;
        this.bays = [];
    }
}

/**
 * @property index The index of this bay within the parent zone (from 0, left to right)
 */
export class Bay {
    name: string;
    index: number;

    parentZone: Zone;
    shelves: Shelf[];

    private constructor(parentZone: Zone) {
        this.name = "";
        this.index = -1;

        this.parentZone = parentZone;
        this.shelves = [];
    }
}

export class Shelf {
    name: string;
    index: number;

    parentBay: Bay;
    trays: Tray[];

    private constructor(parentBay: Bay) {
        this.name = "";
        this.index = -1;

        this.parentBay = parentBay;
        this.trays = [];
    }
}

export class Column {
    index: number;

    parentShelf: Shelf;
    trays: Tray[];

    private constructor(parentShelf: Shelf) {
        this.index = -1;

        this.parentShelf = parentShelf;
        this.trays = [];
    }
}

export interface Category {
    name: string;
}

export class Tray {
    customField: string | undefined;
    category?: Category;

    private constructor(category: Category) {
        this.category = category;
        this.customField = "";
    }
}