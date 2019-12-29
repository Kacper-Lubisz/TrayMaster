import DatabaseObject from "./DatabaseObject";
import {Warehouse} from "./Warehouse";
import {Utils} from "./Utils";
import {ONLINE} from "../WarehouseModel";

const cats = [
    "Baby Care", "Baby Food", "Nappies", "Beans", "Biscuits", "Cereal", "Choc/Sweet", "Coffee", "Cleaning", "Custard",
    "Feminine Hygiene", "Fish", "Fruit", "Fruit Juice", "Hot Choc", "Instant Meals", "Jam", "Meat", "Milk", "Misc",
    "Pasta", "Pasta Sauce", "Pet Food", "Potatoes", "Rice", "Rice Pud.", "Savoury Treats", "Soup", "Spaghetti",
    "Sponge Pud.", "Sugar", "Tea Bags", "Toiletries", "Tomatoes", "Vegetables", "Christmas"
];


export class Category extends DatabaseObject {
    name: string;
    shortName?: string;

    private constructor(path: string, name: string, shortName: string) {
        super(path);
        this.name = name;
        this.shortName = shortName;
    }

    /**
     * Load tray categories.
     * @async
     * @returns A promise which resolves to the list of categories in the warehouse
     */
    public static async loadCategories(warehouse: Warehouse): Promise<Category[]> {
        if (ONLINE)
            return await DatabaseObject.loadChildObjects<Category, Warehouse>(warehouse, "categories", "name");
        else {
            const categories: Category[] = [];
            for (let i = 0; i < cats.length; i++)
                categories.push(new Category(Utils.generateRandomId(), cats[i], cats[i]));
            return categories;
        }
    }
}
