const cats = [
    "Baby Care", "Baby Food", "Nappies", "Beans", "Biscuits", "Cereal", "Choc/Sweet", "Coffee", "Cleaning", "Custard",
    "Feminine Hygiene", "Fish", "Fruit", "Fruit Juice", "Hot Choc", "Instant Meals", "Jam", "Meat", "Milk", "Misc",
    "Pasta", "Pasta Sauce", "Pet Food", "Potatoes", "Rice", "Rice Pud.", "Savoury Treats", "Soup", "Spaghetti",
    "Sponge Pud.", "Sugar", "Tea Bags", "Toiletries", "Tomatoes", "Vegetables", "Christmas"
];


export class MockCategory {
    name: string;
    shortName?: string;

    private constructor(name: string, shortName: string) {
        this.name = name;
        this.shortName = shortName;
    }

    /**
     * Load tray categories.
     * @async
     * @returns A promise which resolves to the list of categories in the warehouse
     */
    public static async loadCategories(): Promise<MockCategory[]> {
        const categories: MockCategory[] = [];
        for (let i = 0; i < cats.length; i++)
            categories.push(new MockCategory(cats[i], cats[i]));
        return categories;
    }
}