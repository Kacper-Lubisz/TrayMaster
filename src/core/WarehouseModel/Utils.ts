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


export class Queue<T> {
    private items: T[];

    public constructor() {
        this.items = [];
    }

    public get length(): number {
        return this.items.length;
    }

    public get empty(): boolean {
        return this.length === 0;
    }

    public enqueue(item: T): void {
        this.items.push(item);
    }

    public dequeue(): T | undefined {
        return this.items.shift();
    }
}


export class Stack<T> {
    private items: T[];

    public constructor() {
        this.items = [];
    }

    public get length(): number {
        return this.items.length;
    }

    public get empty(): boolean {
        return this.length === 0;
    }

    public push(item: T): void {
        this.items.push(item);
    }

    public pop(): T | undefined {
        return this.items.pop();
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
        for (let i = 0; i < 20; i++)
            id += chars[Math.floor(chars.length * Math.random())];
        return id;
    }

    public static normalisePath(path: string): string {
        return path.replace(/^\/*|\/*$/g, "").replace(/\/+/g, "/");
    }

    public static joinPaths(...paths: string[]): string {
        return this.normalisePath(paths.reduce((previous, current) => `${previous}/${current}`));
    }

    public static getID(docPath: string): string {
        return this.normalisePath(docPath).split("/").pop() || "";
    }

    public static getPath(docPath: string): string {
        return this.normalisePath(docPath).split("/").slice(0, -1).join("/");
    }
}