import "./database";

import {db} from "./database";
import {firestore} from "firebase";


export class Warehouse {

  ref: firestore.DocumentReference;
  name: string;
  zones: Zone[];

  categories: Category[];

  private constructor(ref: firestore.DocumentReference, name: string, zones: Zone[], categories: Category[]) {
    this.ref = ref;
    this.name = name;
    this.zones = zones;
    this.categories = categories;

  }

  static async loadWarehouse(documentPath: string = "fvv0iPeordXYBEbvxP8U") {

    let options: { source: "cache" | "default" } = {source: "cache"};

    const warehouseRef: firestore.DocumentReference = db.collection("warehouses").doc(documentPath);

    const [
      warehouseQuery,
      categoriesQuery,
      zonesQuery,
      test
    ] = await Promise.all([
      warehouseRef.get(options),
      warehouseRef.collection("categories").get(options),
      warehouseRef.collection("zones").get(options),
      warehouseRef.collection("zones/").get(options)
    ]);

    test.forEach(doc => {
      console.log(doc);
    })

    const warehouseData = warehouseQuery.data();
    if (warehouseData === undefined) {
      throw Error("Failed to load warehouse")
    }

    const categories: Category[] = [];
    categoriesQuery.forEach(doc => {
      categories.push(doc.data() as Category);
    });

    const zones: Zone[] = [];
    zonesQuery.forEach(doc => {
      zones.push(doc.data() as Zone);
    });

    return new Warehouse(warehouseRef, warehouseData.name, zones, categories)

  }

}

/**
 * @property color The color of the zone as a hex string eg. '#ff0000'
 */
export interface Zone {
  name: string;
  color: string;

  parentWarehouse: Warehouse;
  bays: Bay[];
}

/**
 * @property index The index of this bay within the parent zone (from 0, left to right)
 */
export interface Bay {
  name: string;

  index: number;
  parentZone: Zone;
  shelves: Shelf[];

}

export interface Shelf {
  name: string;

  index: number;
  parentBay: Bay;
  trays: Tray[];

}

export interface Column {

  index: number;
  parentShelf: Shelf;

  trays: Tray[];
}

interface Category {
  name: string;
}


export interface Tray {

  customField: string | undefined;
  category?: Category;

}

/*const cats = [
  "Baby Care",
  "Baby Food",
  "Nappies",
  "Beans",
  "Biscuits",
  "Cereal",
  "Choc/Sweet",
  "Coffee",
  "Cleaning",
  "Custard",
  "Feminine Hygiene",
  "Fish",
  "Fruit",
  "Fruit Juice",
  "Hot Choc",
  "Instant Meals",
  "Jam",
  "Meat",
  "Milk",
  "Misc",
  "Pasta",
  "Pasta Sauce",
  "Pet Food",
  "Potatoes",
  "Rice",
  "Rice Pud.",
  "Savoury Treats",
  "Soup",
  "Spaghetti",
  "Sponge Pud.",
  "Sugar",
  "Tea Bags",
  "Toiletries",
  "Tomatoes",
  "Vegetables",
  "Christmas"
];

await Promise.all(cats.map(cat => {
  const data = {
    "name": cat
  };
  return warehouseRef.collection("categories").doc().set(data)
}));*/