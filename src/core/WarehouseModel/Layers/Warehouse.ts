import {Bay, Category, Column, Shelf, Tray, TraySize, WarehouseModel, Zone} from "../../WarehouseModel";
import Utils from "../Utils";
import {TopLayer} from "../LayerStructure/TopLayer";
import database, {DatabaseCollection} from "../Database";
import {SearchQuery} from "../../../pages/SearchPage";

const defaultCategories: string[] = [
    "Baby Care", "Baby Food", "Nappies", "Beans", "Biscuits", "Cereal", "Choc/Sweet", "Coffee", "Cleaning", "Custard",
    "Feminine Hygiene", "Fish", "Fruit", "Fruit Juice", "Hot Choc", "Instant Meals", "Jam", "Meat", "Milk", "Misc",
    "Pasta", "Pasta Sauce", "Pet Food", "Potatoes", "Rice", "Rice Pud.", "Savoury Treats", "Soup", "Spaghetti",
    "Sponge Pud.", "Sugar", "Tea Bags", "Toiletries", "Tomatoes", "Vegetables", "Christmas", "Mixed"
];

const defaultTraySizes: TraySize[] = [
    {label: "small", sizeRatio: 1.5},
    {label: "normal", sizeRatio: 2.5},
    {label: "big", sizeRatio: 3.5},
];


interface WarehouseFields {
    name: string;
}

export class Warehouse extends TopLayer<WarehouseFields, Zone> {
    public readonly layerID: WarehouseModel = WarehouseModel.warehouse;
    public readonly collectionName = "warehouses";
    public readonly childCollectionName = "zones";

    private readonly categoryCollection: DatabaseCollection<Category>;
    private readonly traySizeCollection: DatabaseCollection<TraySize>;

    private constructor(id: string, fields: WarehouseFields) {
        super(id, fields);
        this.categoryCollection = new DatabaseCollection<Category>(Utils.joinPaths(this.path, "categories"));
        this.traySizeCollection = new DatabaseCollection<TraySize>(Utils.joinPaths(this.path, "traySizes"));
    }

    /**
     * Create a warehouse instance
     * @param id - The database ID of the warehouse
     * @param name - The name of the warehouse
     * @returns The newly created warehouse
     */
    public static create(id?: string, name?: string): Warehouse {
        return new Warehouse(id ?? Utils.generateRandomId(), {name: name ?? ""});
    }

    /**
     * @param id - The database ID for the warehouse
     * @param fields - The column fields
     */
    public static createFromFields = (id: string, fields: unknown): Warehouse =>
        new Warehouse(id, fields as WarehouseFields);

    public createChild = Zone.createFromFields;

    public async loadChildren(forceLoad = false): Promise<void> {
        if (!this.childrenLoaded || forceLoad) {
            const query = database.db.collection(this.topLevelChildCollectionPath);
            this.children = (await database.loadQuery<unknown>(query))
                .map(document => this.createChild(document.id, document.fields, this));
            this.childrenLoaded = true;
        }
    }

    public async loadDepthFirst(forceLoad = false, minLayer: WarehouseModel = this.layerID): Promise<this> {
        await this.loadCollections(forceLoad);
        return super.loadDepthFirst(forceLoad, minLayer);
    }

    public async load(minLayer = this.layerID, forceLoad = false): Promise<this> {
        await this.loadCollections(forceLoad);
        if ((!this.loaded || (!this.childrenLoaded && this.layerID > minLayer)) || forceLoad) {
            return super.load(minLayer);
        }
        return this;
    }

    private async loadCollections(forceLoad: boolean): Promise<void> {
        await this.categoryCollection.load(forceLoad);
        await this.traySizeCollection.load(forceLoad);

        if (this.categoryCollection.size === 0) {
            for (const defaultCategory of defaultCategories) {
                this.categoryCollection.add({name: defaultCategory, shortName: defaultCategory});
            }
        }

        if (this.traySizeCollection.size === 0) {
            for (const defaultTraySize of defaultTraySizes) {
                this.traySizeCollection.add(Object.assign({}, defaultTraySize));
            }
        }
    }

    public toString(): string {
        return this.name;
    }

    //#region Categories
    public get categories(): Category[] {
        return this.categoryCollection.itemList;
    }

    public getCategoryID(category?: Category): string {
        return this.categoryCollection.getItemId(category);
    }

    public getCategoryByID(id: string): Category | undefined {
        return this.categoryCollection.get(id);
    }

    public addCategory(category: Category): void {
        this.categoryCollection.add(category);
    }

    public removeCategory(category: Category): void {
        this.categoryCollection.remove(category);
    }

    //#endregion

    //#region Tray Sizes
    public get traySizes(): TraySize[] {
        return this.traySizeCollection.itemList;
    }

    public getTraySizeId(traySize?: TraySize): string {
        return this.traySizeCollection.getItemId(traySize);
    }

    public getTraySizeByID(id: string): TraySize | undefined {
        return this.traySizeCollection.get(id);
    }

    public addTraySize(traySize: TraySize): void {
        this.traySizeCollection.add(traySize);
    }

    public removeTraySize(traySize: TraySize): void {
        this.traySizeCollection.remove(traySize);
    }

    //#endregion

    protected async stageLayer(forceStage = false): Promise<void> {
        await this.categoryCollection.stage(forceStage);
        await this.traySizeCollection.stage(forceStage);

        if (this.changed || forceStage) {
            database.set(this.path, this.fields);
            this.fieldsSaved();
        }
    }

    //#region Field Getters and Setters
    public get name(): string {
        return this.fields.name;
    }

    public set name(name: string) {
        this.fields.name = name;
    }

    //#endregion

    //#region Children Getters
    public get zones(): Zone[] {
        return this.children;
    }

    public get bays(): Bay[] {
        return this.zones.flatMap(zone => zone.bays);
    }

    public get shelves(): Shelf[] {
        return this.bays.flatMap(bay => bay.shelves);
    }

    public get columns(): Column[] {
        return this.shelves.flatMap(shelf => shelf.columns);
    }

    public get trays(): Tray[] {
        return this.columns.flatMap(column => column.trays);
    }

    //#endregion

    private composeSorts<T>(
        comparators: ((a: T, b: T) => number)[],
    ): (a: T, b: T) => number {
        return comparators.reduce(this.composeSort.bind(this), () => 0);
    }

    // todo add tests to these
    private composeSort<T>(
        first: (a: T, b: T) => number,
        second: (a: T, b: T) => number
    ): (a: T, b: T) => number {
        return (a, b) => {
            const firstResult = first(a, b);
            if (firstResult === 0) {
                return second(a, b);
            } else {
                return firstResult;
            }
        };
    }

    byNullSafe<T>(key: (a: T) => any | null | undefined, before = true): (a: T, b: T) => number {
        return (a: T, b: T): number => {
            const keyA = key(a);
            const keyB = key(b);
            if (keyA && keyB) {
                return keyA < keyB ? -1 : 1;
            } else if (keyA) {
                return before ? -1 : 1;
            } else if (keyB) {
                return before ? 1 : -1;
            } else {
                return 0;
            }
        };
    }

    //region search
    public traySearch(query: SearchQuery): Tray[] {

        //todo make this feature full, it's actually a complete mess right now, needs a redoing

        const filteredTrays = this.trays.filter(tray =>
            query.categories === null ||
            (query.categories === "set" && tray.category) ||
            (query.categories === "unset" && !tray.category) ||
            (query.categories instanceof Set && tray.category && query.categories.has(tray.category))
        );

        const defaultSort = this.composeSorts<Tray>([
            this.byNullSafe<Tray>((a) => a.expiry?.from, true),
            // this.byNullSafe<Tray>((a) => a.expiry?.to, false),
            // tray => tray.expiry?.to,
            // tray => tray.category?.name,
        ]);

        // const sort = (() => {
        //     if (query.sort.type === SortBy.category) {
        //         return defaultSort;
        //     } else if (query.sort.type === SortBy.expiry) {
        //         return defaultSort;
        //     } else if (query.sort.type === SortBy.location) {
        //         return defaultSort;
        //     } else if (query.sort.type === SortBy.weight) {
        //         return defaultSort;
        //     } else { // none
        //         return defaultSort;
        //     }
        // })();

        return filteredTrays.sort(defaultSort);

    }

    //endregion
}