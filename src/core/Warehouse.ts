import {db} from "./database";
import {firestore} from "firebase";


// export class Warehouse {
//
//     ref: firestore.DocumentReference;
//     name: string;
//     zones: Zone[];
//
//     categories: Category[];
//
//     private constructor(ref: firestore.DocumentReference, name: string, zones: Zone[], categories: Category[]) {
//         this.ref = ref;
//         this.name = name;
//         this.zones = zones;
//         this.categories = categories;
//
//     }
//
//     static async loadWarehouse(documentPath: string = "fvv0iPeordXYBEbvxP8U") {
//
//         let options: { source: "cache" | "default" } = {source: "cache"};
//
//         const warehouseRef: firestore.DocumentReference = db.collection("warehouses").doc(documentPath);
//
//         const [
//             warehouseQuery,
//             categoriesQuery,
//             zonesQuery,
//             test
//         ] = await Promise.all([
//             warehouseRef.get(options),
//             warehouseRef.collection("categories").get(options),
//             warehouseRef.collection("zones").get(options),
//             warehouseRef.collection("zones/").get(options)
//         ]);
//
//         test.forEach(doc => {
//             console.log(doc);
//         });
//
//         const warehouseData = warehouseQuery.data();
//         if (warehouseData === undefined) {
//             throw Error("Failed to load warehouse");
//         }
//
//         const categories: Category[] = [];
//         categoriesQuery.forEach(doc => {
//             categories.push(doc.data() as Category);
//         });
//
//         const zones: Zone[] = [];
//         zonesQuery.forEach(doc => {
//             zones.push(doc.data() as Zone);
//         });
//
//         return new Warehouse(warehouseRef, warehouseData.name, zones, categories);
//
//     }
//
//     static async createTestWarehouse() {
//         const warehouseRef = db.collection("warehouses");
//         const warehouseSnapshot = await warehouseRef.add({name: `Warehouse ${Math.random()}`});
//
//         let categorySnapshot = [];
//         for (let i: number = 0; i < 25; i++)
//             categorySnapshot.push(await warehouseRef.doc(warehouseSnapshot.id).collection("categories")
//                 .add({name: `Category ${Math.random()}`}));
//
//         let traySnapshots = [];
//         const colours = [
//             {label: "Red", hex: "#FF0000"},
//             {label: "Green", hex: "#00FF00"},
//             {label: "Blue", hex: "#0000FF"},
//             {label: "White", hex: "#FFFFFF"},
//             {label: "Black", hex: "#000000"}
//         ];
//         const zonesRef = warehouseRef.doc(warehouseSnapshot.id).collection("zones");
//         for (let i: number = 0; i < colours.length; i++) {
//             let zoneSnapshot = await zonesRef.add({colour: colours[i]});
//             let zoneRef = zonesRef.doc(zoneSnapshot.id);
//
//             const baysRef = zoneRef.collection("bays");
//             for (let j: number = 0; j < 5; j++) {
//                 let baySnapshot = await baysRef.add({name: `Bay ${Math.random()}`});
//                 let bayRef = baysRef.doc(baySnapshot.id);
//
//                 const shelvesRef = bayRef.collection("shelves");
//                 for (let k: number = 0; k < 25; k++) {
//                     let shelfSnapshot = await shelvesRef.add({
//                         name: `Shelf ${Math.random()}`,
//                         maxWeight: 100 + Math.trunc(500 * Math.random())
//                     });
//                     let shelfRef = shelvesRef.doc(shelfSnapshot.id);
//
//                     const columnsRef = shelfRef.collection("columns");
//                     for (let k: number = 0; k < 4; k++) {
//                         let maxHeight = 2 + Math.trunc(3 * Math.random());
//                         let columnSnapshot = await columnsRef.add({maxHeight: maxHeight});
//                         let columnRef = columnsRef.doc(columnSnapshot.id);
//
//                         const traysRef = columnRef.collection("trays");
//                         for (let l: number = 0; l < Math.floor(maxHeight * Math.random()); l++) {
//                             let fromDate = new firestore.Timestamp(1576591600 + Math.trunc(157766400 * Math.random()), 0);
//                             let tray = {
//                                 category: categorySnapshot[Math.trunc(categorySnapshot.length * Math.random())].path,
//                                 customField: `${Math.random()}`,
//                                 expiry: {
//                                     from: fromDate,
//                                     to: new firestore.Timestamp(fromDate.seconds + 31536000, 0),
//                                     label: `${Math.random()} time`
//                                 }
//                             };
//                             let trayRef = await traysRef.add(tray);
//                             let traySearchReference = {
//                                 category: tray.category,
//                                 customField: tray.customField,
//                                 expiry: tray.expiry,
//                                 location: trayRef.path
//                             };
//                             traySnapshots.push(await warehouseRef.doc(warehouseSnapshot.id).collection("trays")
//                                 .add(traySearchReference));
//                         }
//                     }
//                 }
//             }
//         }
//     }
//
// }
//
// /**
//  * @property color The color of the zone as a hex string eg. '#ff0000'
//  */
// export class Zone {
//     name: string;
//     color: string;
//
//     parentWarehouse: Warehouse;
//     bays: Bay[];
//
//     private constructor(parentWarehouse: Warehouse) {
//         this.name = "";
//         this.color = "";
//
//         this.parentWarehouse = parentWarehouse;
//         this.bays = [];
//     }
// }
//
// /**
//  * @property index The index of this bay within the parent zone (from 0, left to right)
//  */
// export class Bay {
//     name: string;
//     index: number;
//
//     parentZone: Zone;
//     shelves: Shelf[];
//
//     private constructor(parentZone: Zone) {
//         this.name = "";
//         this.index = -1;
//
//         this.parentZone = parentZone;
//         this.shelves = [];
//     }
// }
//
// export class Shelf {
//     name: string;
//     index: number;
//
//     parentBay: Bay;
//     trays: Tray[];
//
//     private constructor(parentBay: Bay) {
//         this.name = "";
//         this.index = -1;
//
//         this.parentBay = parentBay;
//         this.trays = [];
//     }
// }
//
// export class Column {
//     index: number;
//
//     parentShelf: Shelf;
//     trays: Tray[];
//
//     private constructor(parentShelf: Shelf, trays: Tray[]) {
//         this.index = -1;
//
//         this.parentShelf = parentShelf;
//         this.trays = trays;
//     }
// }
//
// export interface Category {
//     name: string;
// }
//
// export interface ExpiryRange {
//     from: number;
//     to: number;
//     label: string;
//     color: string;
// }
//
// export class Tray {
//     customField?: string;
//     category?: Category;
//     expiry?: ExpiryRange;
//     weight?: number;
//
//     private constructor(category: Category, expiryRange: ExpiryRange, weight: number, customField?:string) {
//         this.category = category;
//         this.weight = weight;
//         this.expiry = expiryRange;
//         this.customField = customField;
//     }
// }

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