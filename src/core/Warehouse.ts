import {db} from "./database";
import {firestore} from "firebase";


/**
 * Generate a random warehouse in the firebase database
 * @async
 */
export async function createTestWarehouse() {
    const warehouseRef = db.collection("warehouses");
    const warehouseSnapshot = await warehouseRef.add({name: `Warehouse ${Math.random()}`});

    let categorySnapshot = [];
    for (let i: number = 0; i < 25; i++)
        categorySnapshot.push(await warehouseRef.doc(warehouseSnapshot.id).collection("categories")
                                                .add({name: `Category ${Math.random()}`}));

    let traySnapshots = [];
    const colors = [
        {label: "Red", hex: "#FF0000"},
        {label: "Green", hex: "#00FF00"},
        {label: "Blue", hex: "#0000FF"},
        {label: "White", hex: "#FFFFFF"},
        {label: "Black", hex: "#000000"}
    ];
    const zonesRef = warehouseRef.doc(warehouseSnapshot.id).collection("zones");
    for (let i: number = 0; i < colors.length; i++) {
        let zoneSnapshot = await zonesRef.add({color: colors[i]});
        let zoneRef = zonesRef.doc(zoneSnapshot.id);

        const baysRef = zoneRef.collection("bays");
        for (let j: number = 0; j < 5; j++) {
            let baySnapshot = await baysRef.add({name: `Bay ${Math.random()}`});
            let bayRef = baysRef.doc(baySnapshot.id);

            const shelvesRef = bayRef.collection("shelves");
            for (let k: number = 0; k < 25; k++) {
                let shelfSnapshot = await shelvesRef.add({
                    name: `Shelf ${Math.random()}`,
                    maxWeight: 100 + Math.trunc(500 * Math.random())
                });
                let shelfRef = shelvesRef.doc(shelfSnapshot.id);

                const columnsRef = shelfRef.collection("columns");
                for (let k: number = 0; k < 4; k++) {
                    let maxHeight = 2 + Math.trunc(3 * Math.random());
                    let columnSnapshot = await columnsRef.add({maxHeight: maxHeight});
                    let columnRef = columnsRef.doc(columnSnapshot.id);

                    const traysRef = columnRef.collection("trays");
                    for (let l: number = 0; l < Math.floor(maxHeight * Math.random()); l++) {
                        let fromDate = new firestore.Timestamp(1576591600 +
                            Math.trunc(157766400 * Math.random()), 0);
                        let tray = {
                            category: categorySnapshot[Math.trunc(categorySnapshot.length * Math.random())].path,
                            customField: `${Math.random()}`,
                            expiry: {
                                from: fromDate,
                                to: new firestore.Timestamp(fromDate.seconds + 31536000, 0),
                                label: `${Math.random()} time`
                            }
                        };
                        let trayRef = await traysRef.add(tray);
                        let traySearchReference = {
                            category: tray.category,
                            customField: tray.customField,
                            expiry: tray.expiry,
                            location: trayRef.path
                        };
                        traySnapshots.push(await warehouseRef.doc(warehouseSnapshot.id).collection("trays")
                                                             .add(traySearchReference));
                    }
                }
            }
        }
    }
}
