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

export class Utils {
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
}