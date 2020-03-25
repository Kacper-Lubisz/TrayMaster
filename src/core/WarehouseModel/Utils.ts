/*
Warehouse
>   Settings
>   Categories
>   TraySizes
>   Zones
>   Bays
>   Shelves
>   Columns
>   Trays
 */

import {Category} from "../WarehouseModel";

export abstract class Collection<T> {
    protected items: T[];

    public constructor(items?: T[]) {
        this.items = items ?? [];
    }

    public get length(): number {
        return this.items.length;
    }

    public get empty(): boolean {
        return this.length === 0;
    }

    public abstract add(item: T): void;

    public abstract remove(): T | undefined;
}

/**
 * Generic queue
 */
export class Queue<T> extends Collection<T> {

    public enqueue(item: T): void {
        this.items.push(item);
    }

    public dequeue(): T | undefined {
        return this.items.shift();
    }

    public clear(): void {
        this.items = [];
    }

    public add(item: T): void {
        this.enqueue(item);
    }

    public remove(): T | undefined {
        return this.dequeue();
    }
}

/**
 * Generic stack
 */
export class Stack<T> extends Collection<T> {
    public push(item: T): void {
        this.items.push(item);
    }

    public pop(): T | undefined {
        return this.items.pop();
    }

    public clear(): void {
        this.items = [];
    }

    public add(item: T): void {
        this.push(item);
    }

    public remove(): T | undefined {
        return this.pop();
    }
}

export default abstract class Utils {
    /**
     * Generate a pseudorandom firebase ID
     * @returns string - A randomly generated ID
     */
    public static generateRandomId(): string {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let id = "";
        for (let i = 0; i < 20; i++) {
            id += chars[Math.floor(chars.length * Math.random())];
        }
        return id;
    }

    /**
     * Normalise a path to a form with no leading, trailing or repeated forward slash
     * @param path - The path to normalise
     * @returns The normalised path
     */
    public static normalisePath(path: string): string {
        return path.replace(/^\/*|\/*$/g, "").replace(/\/+/g, "/");
    }

    /**
     * Join any number of paths together and normalise them
     * @param paths
     * @returns The paths joined as one
     */
    public static joinPaths(...paths: string[]): string {
        if (paths.length === 0) {
            return "";
        }
        return this.normalisePath(paths.reduce((previous, current) => `${previous}/${current}`));
    }

    /**
     * Extract the bottom-level document ID from a document path
     * @param docPath - The document path to get the document ID for
     * @returns The ID of the referenced document
     */
    public static getID(docPath: string): string {
        return this.normalisePath(docPath).split("/").pop() ?? "";
    }

    /**
     * Extract the collection path from a document path
     * @param docPath - The document path to get the collection path for
     * @returns The collection path of the referenced document
     */
    public static getPath(docPath: string): string {
        return this.normalisePath(docPath).split("/").slice(0, -1).join("/");
    }

    /**
     * Pick a random item from a list of items
     * @param items - The items to pick randomly from
     * @returns A random item from the supplied list
     */
    public static randItem<T>(items: T[]): T {
        return items[Math.floor(items.length * Math.random())];
    }

    /**
     * RFC 5322 email regex courtesy https://emailregex.com/
     * @email - The email to check the validity of
     * @returns true if the email is valid, false if not
     */
    public static isEmailValid(email: string): boolean {
        return /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(email);
    }

    /**
     * Check if a string is whitespace
     * @param text - The text to check for whitespace
     * @returns true if the string is only whitespace
     */
    public static isWhiteSpace(text: string): boolean {
        return !/\S/.test(text);
    }

    /**
     * This method escapes special character in the string making up a cell of a .csv file.
     * @param string the string to escape
     */
    public static escapeStringToCSV(string: string): string {
        return `"${string.replace("\"", "\"\"")}"`;
    }
}

export const NEVER_EXPIRY = {
    from: null, to: null,
    label: "Never"
};

export const defaultCategories: Category[] = [
    {
        index: 0,
        defaultExpiry: NEVER_EXPIRY,
        group: "Baby",
        shortName: null,
        underStockThreshold: null,
        overStockThreshold: null,
        name: "Baby Care"
    },
    {
        index: 0,
        defaultExpiry: null,
        group: "Baby",
        shortName: null,
        underStockThreshold: null,
        overStockThreshold: null,
        name: "Baby Food"
    },
    {
        index: 0,
        defaultExpiry: NEVER_EXPIRY,
        group: "Baby",
        shortName: null,
        underStockThreshold: null,
        overStockThreshold: null,
        name: "Nappies"
    },
    {
        index: 0,
        defaultExpiry: null,
        group: null,
        shortName: null,
        underStockThreshold: 36,
        overStockThreshold: 120,
        name: "Beans"
    },
    {
        index: 0,
        defaultExpiry: null,
        group: null,
        shortName: null,
        underStockThreshold: null,
        overStockThreshold: null,
        name: "Biscuits"
    },
    {
        index: 0,
        defaultExpiry: null,
        group: null,
        shortName: null,
        underStockThreshold: 20,
        overStockThreshold: 180,
        name: "Cereal"
    },
    {
        index: 0,
        defaultExpiry: null,
        group: null,
        shortName: null,
        underStockThreshold: 10,
        overStockThreshold: 30,
        name: "Choc/Sweet"
    },
    {
        index: 0,
        defaultExpiry: null,
        group: null,
        shortName: null,
        underStockThreshold: 3,
        overStockThreshold: 10,
        name: "Coffee",
    },
    {
        index: 0,
        defaultExpiry: null,
        group: null,
        shortName: null,
        underStockThreshold: null,
        overStockThreshold: null,
        name: "Cleaning"
    },
    {
        index: 0,
        defaultExpiry: null,
        group: null,
        shortName: null,
        underStockThreshold: 1,
        overStockThreshold: 12,
        name: "Custard"
    },
    {
        index: 0,
        defaultExpiry: NEVER_EXPIRY,
        group: "Toiletries",
        shortName: null,
        underStockThreshold: 2,
        overStockThreshold: 15,
        name: "Feminine Hygiene"
    },
    {
        index: 0,
        defaultExpiry: null,


        group: null,
        shortName: null,
        underStockThreshold: 20,
        overStockThreshold: 120,
        name: "Fish"
    },
    {
        index: 0,
        defaultExpiry: null,
        group: null,
        shortName: null,
        underStockThreshold: 24,
        overStockThreshold: 60,
        name: "Fruit"
    },
    {
        index: 0,
        defaultExpiry: null,
        group: null,
        shortName: null,
        underStockThreshold: 24,
        overStockThreshold: 48,
        name: "Fruit Juice"
    },
    {
        index: 0,
        defaultExpiry: null,
        group: null,
        shortName: "Hot Choc",
        underStockThreshold: 1,
        overStockThreshold: 4,
        name: "Hot Chocolate"
    },
    {
        index: 0,
        defaultExpiry: null,
        group: null,
        shortName: null,
        underStockThreshold: 6,
        overStockThreshold: 36,
        name: "Instant Meals"
    },
    {
        index: 0,
        defaultExpiry: null,
        group: null,
        shortName: null,
        underStockThreshold: 10,
        overStockThreshold: 24,
        name: "Jam"
    },
    {
        index: 0,
        defaultExpiry: null,
        group: null,
        shortName: null,
        underStockThreshold: 36,
        overStockThreshold: 120,
        name: "Meat"
    },
    {
        index: 0,
        defaultExpiry: NEVER_EXPIRY,
        group: "Toiletries",
        shortName: null,
        underStockThreshold: 1,
        overStockThreshold: 5,
        name: "Men's Toiletries"
    },
    {
        index: 0,
        defaultExpiry: null,
        group: null,
        shortName: null,
        underStockThreshold: 30,
        overStockThreshold: 80,
        name: "Milk"
    },
    {
        index: 0,
        defaultExpiry: null,
        group: null,
        shortName: null,
        underStockThreshold: 1,
        overStockThreshold: 18,
        name: "Misc."
    },
    {
        index: 0,
        defaultExpiry: NEVER_EXPIRY,
        group: "Toiletries",
        shortName: null,
        underStockThreshold: 2,
        overStockThreshold: 15,
        name: "Misc. Toiletries"
    },
    {
        index: 0,
        defaultExpiry: null,
        group: null,
        shortName: null,
        underStockThreshold: 36,
        overStockThreshold: 120,
        name: "Pasta"
    },
    {
        index: 0,
        defaultExpiry: null,
        group: null,
        shortName: null,
        underStockThreshold: 24,
        overStockThreshold: 72,
        name: "Pasta Sauce"
    },
    {
        index: 0,
        defaultExpiry: null,
        group: null,
        shortName: null,
        underStockThreshold: 3,
        overStockThreshold: 12,
        name: "Pet Food"
    },
    {
        index: 0,
        defaultExpiry: null,
        group: null,
        shortName: null,
        underStockThreshold: 10,
        overStockThreshold: 36,
        name: "Potatoes"
    },
    {
        index: 0,
        defaultExpiry: null,
        group: null,
        shortName: null,
        underStockThreshold: 5,
        overStockThreshold: 15,
        name: "Rice"
    },
    {
        index: 0,
        defaultExpiry: null,
        group: null,
        shortName: null,
        underStockThreshold: 31,
        overStockThreshold: 10,
        name: "Rice Pudding"
    },
    {
        index: 0,
        defaultExpiry: null,
        group: null,
        shortName: null,
        underStockThreshold: 10,
        overStockThreshold: 36,
        name: "Savoury Treats"
    },
    {
        index: 0,
        defaultExpiry: NEVER_EXPIRY,
        group: "Toiletries",
        shortName: null,
        underStockThreshold: 1,
        overStockThreshold: 8,
        name: "Shampoo"
    },
    {
        index: 0,
        defaultExpiry: null,
        group: null,
        shortName: null,
        underStockThreshold: 36,
        overStockThreshold: 120,
        name: "Soup"
    },
    {
        index: 0,
        defaultExpiry: NEVER_EXPIRY,
        group: "Toiletries",
        shortName: null,
        underStockThreshold: 1,
        overStockThreshold: 10,
        name: "Soap & Shower Gel"
    },
    {
        index: 0,
        defaultExpiry: null,
        group: null,
        shortName: null,
        underStockThreshold: 12,
        overStockThreshold: 120,
        name: "Spaghetti"
    },
    {
        index: 0,
        defaultExpiry: null,
        group: null,
        shortName: null,
        underStockThreshold: 1,
        overStockThreshold: 12,
        name: "Sponge Pudding"
    },
    {
        index: 0,
        defaultExpiry: NEVER_EXPIRY,
        group: null,
        shortName: null,
        underStockThreshold: 10,
        overStockThreshold: 36,
        name: "Sugar"
    },
    {
        index: 0,
        defaultExpiry: null,
        group: null,
        shortName: null,
        underStockThreshold: 31,
        overStockThreshold: 60,
        name: "Tea Bags"
    },
    {
        index: 0,
        defaultExpiry: NEVER_EXPIRY,
        group: "Toiletries",
        shortName: null,
        underStockThreshold: null,
        overStockThreshold: null,
        name: "Toilet Rolls"
    },
    {
        index: 0,
        defaultExpiry: null,
        group: null,
        shortName: null,
        underStockThreshold: 24,
        overStockThreshold: 75,
        name: "Tomatoes"
    },
    {
        index: 0,
        defaultExpiry: null,
        group: null,
        shortName: null,
        underStockThreshold: 36,
        overStockThreshold: 100,
        name: "Vegetables"
    },
    {
        index: 0,
        defaultExpiry: null,
        group: null,
        shortName: null,
        underStockThreshold: 2,
        overStockThreshold: 12,
        name: "Pop/Squash"
    },
    {
        index: 0,
        defaultExpiry: null,
        group: null,
        shortName: null,
        underStockThreshold: 4,
        overStockThreshold: 75,
        name: "Biscuits"
    },
    {
        index: 0,
        defaultExpiry: null,
        group: "Household",
        shortName: null,
        underStockThreshold: 1,
        overStockThreshold: 10,
        name: "Household Cleaning"
    },
    {
        index: 0,
        defaultExpiry: null,
        group: null,
        shortName: null,
        underStockThreshold: null,
        overStockThreshold: null,
        name: "Christmas"
    },
    {
        index: 0,
        defaultExpiry: null,
        group: null,
        shortName: null,
        underStockThreshold: null,
        overStockThreshold: null,
        name: "Mixed"
    }
];