import {FindQuery, SortBy} from "../../../pages/FindPage";
import {byNullSafe, composeSort, composeSorts, partitionBy} from "../../../utils/sortsUtils";
import firebase from "../../Firebase";
import {DatabaseCollection} from "../../Firebase/DatabaseCollection";
import {Bay, Category, Column, Shelf, Tray, WarehouseModel, Zone} from "../../WarehouseModel";
import {LayerFields} from "../LayerStructure/Layer";
import {TopLayer} from "../LayerStructure/TopLayer";
import Utils, {defaultCategories} from "../Utils";
import {TrayFields} from "./Tray";
import * as fb from "firebase/app";
import "firebase/firestore";

interface WarehouseFields extends LayerFields {
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
            lastModified: Date.now(),
            blame: "",
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

    public async load(forceLoad = false, minLayer: WarehouseModel = this.layerID): Promise<this> {
        await this.loadCollections(forceLoad);
        if ((!this.loaded || (!this.childrenLoaded && this.layerID > minLayer)) || forceLoad) {
            return super.load(forceLoad, minLayer);
        }
        return this;
    }

    private async loadCollections(forceLoad: boolean): Promise<void> {
        await this.categoryCollection.load(forceLoad, "index");

        if (this.categoryCollection.size === 0) {
            for (let i = 0; i < defaultCategories.length; i++) {
                this.categoryCollection.add({
                    ...defaultCategories[i],
                    index: i
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

    //region find
    public async trayFind(query: FindQuery): Promise<TrayFields[]> {
        const orderByFields = new Map<SortBy, string | undefined>([
            [SortBy.expiry, "expiry.from"],
            [SortBy.location, "locationName"],
            [SortBy.weight, "weight"]
        ]);

        //todo make this feature full, it's actually a complete mess right now, needs a redoing

        const orderByField = orderByFields.get(query.sort.type);

        let firebaseQuery: fb.firestore.Query = firebase.database.db.collection(Utils.joinPaths("warehouses", this.id, "trays")) as fb.firestore.Query;
        if (orderByField) {
            firebaseQuery = firebaseQuery.orderBy(orderByField);
        }
        if (query.categories instanceof Set) {
            firebaseQuery = firebaseQuery.where("categoryId", "in", Array.from(query.categories).map(category => this.getCategoryID(category)).slice(0, 10));
        }
        const trays: TrayFields[] = (await firebase.database.loadQuery<TrayFields>(firebaseQuery)).map(trayDoc => trayDoc.fields);

        const filteredTrays = trays.filter(tray =>
            query.categories === null ||
            (query.categories === "set" && tray.categoryId) ||
            (query.categories === "unset" && !tray.categoryId) ||
            (query.categories instanceof Set && tray.categoryId && query.categories.has(this.getCategoryByID(tray.categoryId) ?? defaultCategories[0]))
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
        });//.filter(tray => {
        //     return !query.excludePickingArea || !tray.parentShelf.isPickingArea;
        // });

        const defaultSort = composeSorts<TrayFields>([
            partitionBy<TrayFields>((a) => !!(a.expiry)), // draw a diagram to understand this
            partitionBy<TrayFields>((a) => !(!a.expiry?.from && a.expiry?.to)),
            partitionBy<TrayFields>((a) => (!a.expiry?.from && !a.expiry?.to)),

            byNullSafe<TrayFields>((a) => a.expiry?.from, true),
            byNullSafe<TrayFields>((a) => a.expiry?.to, false, false),
            byNullSafe<TrayFields>((a) => this.getCategoryByID(a.categoryId)?.name, false, true),
            byNullSafe<TrayFields>((a) => a.weight, false, true),
        ]);

        const sort = (() => {
            if (query.sort.type === SortBy.category) {
                return composeSort(
                    byNullSafe<TrayFields>((a) => this.getCategoryByID(a.categoryId)?.name, false, true),
                    defaultSort
                );
                // } else if (query.sort.type === SortBy.location) {
                //     return composeSort(
                //         byNullSafe<TrayFields>((a) => a.locationString, false, true),
                //         defaultSort
                //     );
            } else if (query.sort.type === SortBy.weight) {
                return composeSort(
                    byNullSafe<TrayFields>((a) => a.weight, false, true),
                    defaultSort
                );
            } else { // none or SortBy.expiry
                return defaultSort;
            }
        })();

        return filteredTrays;//filteredTrays.sort(sort);
    }

    //endregion
}