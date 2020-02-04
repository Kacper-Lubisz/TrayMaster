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
>   Bays
>   Shelves
>   Columns
>   Trays
 */

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
}