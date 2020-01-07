import {db} from "./database";
import {firestore} from "firebase";


/**
 * Generate a random warehouse in the firebase database
 * @async
 */
export async function createTestWarehouse(): Promise<void> {
    const warehouseRef = db.collection("warehouses");
    const warehouseSnapshot = await warehouseRef.add({name: `Warehouse ${Math.random()}`});

    const categorySnapshot = [];
    for (let i = 0; i < 25; i++) {
        categorySnapshot.push(await warehouseRef.doc(warehouseSnapshot.id).collection("categories")
                                                .add({name: `Category ${Math.random()}`}));
    }

    const traySnapshots = [];
    const colors = [
        {label: "Red", hex: "#ff0000"},
        {label: "Green", hex: "#00ff00"},
        {label: "Blue", hex: "#0000ff"},
        {label: "White", hex: "#ffffff"},
        {label: "Black", hex: "#000000"}
    ];
    const zonesRef = warehouseRef.doc(warehouseSnapshot.id).collection("zones");
    for (const color of colors) {
        const zoneSnapshot = await zonesRef.add({color: color});
        const zoneRef = zonesRef.doc(zoneSnapshot.id);

        const baysRef = zoneRef.collection("bays");
        for (let j = 0; j < 5; j++) {
            const baySnapshot = await baysRef.add({name: `Bay ${Math.random()}`});
            const bayRef = baysRef.doc(baySnapshot.id);

            const shelvesRef = bayRef.collection("shelves");
            for (let k = 0; k < 25; k++) {
                const shelfSnapshot = await shelvesRef.add({
                    name: `Shelf ${Math.random()}`,
                    maxWeight: 100 + Math.trunc(500 * Math.random())
                });
                const shelfRef = shelvesRef.doc(shelfSnapshot.id);

                const columnsRef = shelfRef.collection("columns");
                for (let k = 0; k < 4; k++) {
                    const maxHeight = 2 + Math.trunc(3 * Math.random());
                    const columnSnapshot = await columnsRef.add({maxHeight: maxHeight});
                    const columnRef = columnsRef.doc(columnSnapshot.id);

                    const traysRef = columnRef.collection("trays");
                    for (let l = 0; l < Math.floor(maxHeight * Math.random()); l++) {
                        const fromDate = new firestore.Timestamp(1576591600 +
                            Math.trunc(157766400 * Math.random()), 0);
                        const tray = {
                            category: categorySnapshot[Math.trunc(categorySnapshot.length * Math.random())].path,
                            customField: `${Math.random()}`,
                            expiry: {
                                from: fromDate,
                                to: new firestore.Timestamp(fromDate.seconds + 31536000, 0),
                                label: `${Math.random()} time`
                            }
                        };
                        const trayRef = await traysRef.add(tray);
                        const traySearchReference = {
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
