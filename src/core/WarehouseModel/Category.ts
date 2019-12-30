import DatabaseObject, {DatabaseWriter} from "./DatabaseObject";
import {Warehouse} from "./Warehouse";
import Utils from "./Utils";
import {ONLINE} from "../WarehouseModel";

const cats = [
    "Baby Care", "Baby Food", "Nappies", "Beans", "Biscuits", "Cereal", "Choc/Sweet", "Coffee", "Cleaning", "Custard",
    "Feminine Hygiene", "Fish", "Fruit", "Fruit Juice", "Hot Choc", "Instant Meals", "Jam", "Meat", "Milk", "Misc",
    "Pasta", "Pasta Sauce", "Pet Food", "Potatoes", "Rice", "Rice Pud.", "Savoury Treats", "Soup", "Spaghetti",
    "Sponge Pud.", "Sugar", "Tea Bags", "Toiletries", "Tomatoes", "Vegetables", "Christmas"
];


interface CategoryFields {
    name: string;
    shortName?: string;
}


export class Category extends DatabaseObject<CategoryFields> {
    private constructor(path: string, name: string, shortName: string) {
        super({name: name, shortName: shortName}, path);
    }

    public get name(): string {
        return this.fields.name;
    }

    public get shortName(): string | undefined {
        return this.fields.shortName;
    }

    public set name(name: string) {
        this.fields.name = name;
        this.fieldChange();
    }

    public set shortName(shortName: string | undefined) {
        this.fields.shortName = shortName;
        this.fieldChange();
    }

    public async save(): Promise<void> {
        await DatabaseWriter.addChange(this.path, this);
    }

    /**
     * Load tray categories.
     * @async
     * @returns A promise which resolves to the list of categories in the warehouse
     */
    public static async loadCategories(warehouse: Warehouse): Promise<Category[]> {
        if (ONLINE)
            return await DatabaseObject.loadChildObjects<Category, CategoryFields, Warehouse>(warehouse, "categories", "name");
        else {
            const categories: Category[] = [];
            for (let i = 0; i < cats.length; i++)
                categories.push(new Category(Utils.generateRandomId(), cats[i], cats[i]));
            return categories;
        }
    }
}
