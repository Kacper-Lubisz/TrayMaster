import {SearchQuery, SortBy} from "../../../pages/SearchPage";
import {byNullSafe, composeSort, composeSorts, partitionBy} from "../../../utils/sortsUtils";
import firebase from "../../Firebase";
import {DatabaseCollection} from "../../Firebase/DatabaseCollection";
import {Bay, Category, Column, Shelf, Tray, WarehouseModel, Zone} from "../../WarehouseModel";
import {TopLayer} from "../LayerStructure/TopLayer";
import Utils from "../Utils";

const defaultCategories: { name: string; group?: string; neverExpires?: boolean }[] = [
    {name: "Baby Care", group: "Baby...", neverExpires: true},
    {name: "Baby Food", group: "Baby..."},
    {name: "Nappies", group: "Baby...", neverExpires: true},
    {name: "Beans"},
    {name: "Biscuits"},
    {name: "Cereal"},
    {name: "Choc/Sweet"},
    {name: "Coffee"},
    {name: "Cleaning"},
    {name: "Custard"},
    {name: "Feminine Hygiene", group: "Toiletries...", neverExpires: true},
    {name: "Fish"},
    {name: "Fruit"},
    {name: "Fruit Juice"},
    {name: "Hot Choc"},
    {name: "Instant Meals"},
    {name: "Jam"},
    {name: "Meat"},
    {name: "Men's Toiletries", group: "Toiletries...", neverExpires: true},
    {name: "Milk"},
    {name: "Misc."},
    {name: "Misc. Toiletries", group: "Toiletries...", neverExpires: true},
    {name: "Pasta"},
    {name: "Pasta Sauce"},
    {name: "Pet Food"},
    {name: "Potatoes"},
    {name: "Rice"},
    {name: "Rice Pudding"},
    {name: "Savoury Treats"},
    {name: "Shampoo", group: "Toiletries...", neverExpires: true},
    {name: "Soup"},
    {name: "Soap & Shower Gel", group: "Toiletries...", neverExpires: true},
    {name: "Spaghetti"},
    {name: "Sponge Pudding"},
    {name: "Sugar", neverExpires: true},
    {name: "Tea Bags"},
    {name: "Toilet Rolls", group: "Toiletries...", neverExpires: true},
    {name: "Tomatoes"},
    {name: "Vegetables"},
    {name: "Christmas"},
    {name: "Mixed"}
];

interface WarehouseFields {
    name: string;
    defaultTraySizeID: string;
    expiryColorMode: "computed" | "hybrid" | "warehouse";
}

export class Warehouse extends TopLayer<WarehouseFields, Zone> {
    public readonly layerID: WarehouseModel = WarehouseModel.warehouse;
    public readonly collectionName = "warehouses";
    public readonly childCollectionName = "zones";

    private readonly categoryCollection: DatabaseCollection<Category>;

    private constructor(id: string, fields: WarehouseFields) {
        super(id, fields);
        this.categoryCollection = new DatabaseCollection<Category>(Utils.joinPaths(this.path, "categories"), true);
    }

    /**
     * Create a warehouse instance
     * @param id - The database ID of the warehouse
     * @param name - The name of the warehouse
     * @returns The newly created warehouse
     */
    public static create(id?: string, name?: string): Warehouse {
        return new Warehouse(id ?? Utils.generateRandomId(), {
            name: name ?? "",
            defaultTraySizeID: "",
            expiryColorMode: "hybrid"
        });
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
            const query = firebase.database.db.collection(this.topLevelChildCollectionPath);
            this.children = (await firebase.database.loadQuery<unknown>(query))
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
        await this.categoryCollection.load(forceLoad, "index");

        if (this.categoryCollection.size === 0) {
            for (let i = 0; i < defaultCategories.length; i++) {
                this.categoryCollection.add({
                    index: i,
                    name: "Unnamed",
                    shortName: null,
                    underStockThreshold: null,
                    overStockThreshold: null,
                    type: "default",
                    group: null,
                    neverExpires: false,
                    ...defaultCategories[i],
                });
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

    public editCategory(id: string, category: Category): void {
        this.categoryCollection.set(id, category);
    }

    public removeCategory(category: Category): void {
        this.categoryCollection.remove(category);
    }

    //#endregion

    protected async stageLayer(forceStage = false): Promise<void> {
        await this.categoryCollection.stage(forceStage);

        if (this.changed || forceStage) {
            firebase.database.set(this.topLevelPath, this.fields);
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

    public get expiryColorMode(): "computed" | "hybrid" | "warehouse" {
        return this.fields.expiryColorMode;
    }

    public set expiryColorMode(expiryColorMode: "computed" | "hybrid" | "warehouse") {
        this.fields.expiryColorMode = expiryColorMode;
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

    //region search
    public async traySearch(query: SearchQuery): Promise<Tray[]> {

        return await new Promise((resolve, _) => {
            //todo make this feature full, it's actually a complete mess right now, needs a redoing

            const filteredTrays = this.trays.filter(tray =>
                query.categories === null ||
                (query.categories === "set" && tray.category) ||
                (query.categories === "unset" && !tray.category) ||
                (query.categories instanceof Set && tray.category && query.categories.has(tray.category))
            ).filter(tray => {
                if (query.weight === null) {
                    return true;
                } else if (query.weight === "set") {
                    return tray.weight;
                } else if (query.weight === "unset") {
                    return !tray.weight;
                } else {
                    return tray.weight && query.weight.from <= tray.weight && tray.weight <= query.weight.to;
                }
            }).filter(tray => {
                if (!query.commentSubstring || tray.comment) {
                    return true;
                } else {
                    return query.commentSubstring.includes(query.commentSubstring);
                }
            }).filter(tray => {
                return !query.excludePickingArea || !tray.parentShelf.isPickingArea;
            });

            const defaultSort = composeSorts<Tray>([
                partitionBy<Tray>((a) => !!(a.expiry)), // draw a diagram to understand this
                partitionBy<Tray>((a) => !(!a.expiry?.from && a.expiry?.to)),
                partitionBy<Tray>((a) => (!a.expiry?.from && !a.expiry?.to)),

                byNullSafe<Tray>((a) => a.expiry?.from, true),
                byNullSafe<Tray>((a) => a.expiry?.to, false, false),
                byNullSafe<Tray>((a) => a.category?.name, false, true),
                byNullSafe<Tray>((a) => a.weight, false, true),
            ]);

            const sort = (() => {
                if (query.sort.type === SortBy.category) {
                    return composeSort(
                        byNullSafe<Tray>((a) => a.category?.name, false, true),
                        defaultSort
                    );
                } else if (query.sort.type === SortBy.location) {
                    return composeSort(
                        byNullSafe<Tray>((a) => a.locationString, false, true),
                        defaultSort
                    );
                } else if (query.sort.type === SortBy.weight) {
                    return composeSort(
                        byNullSafe<Tray>((a) => a.weight, false, true),
                        defaultSort
                    );
                } else { // none or SortBy.expiry
                    return defaultSort;
                }
            })();

            resolve(filteredTrays.sort(sort));

        });

    }

    //endregion
}