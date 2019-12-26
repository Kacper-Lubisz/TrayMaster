import DatabaseObject from "./DatabaseObject";


export class OnlineCategory extends DatabaseObject {
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
    public static async loadCategories(path: string): Promise<OnlineCategory[]> {
        return await DatabaseObject.loadObjects<OnlineCategory>(path, "name");
    }
}
