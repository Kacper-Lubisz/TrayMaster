import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import {Category, escapeStringToCSV, joinPaths, NULL_CATEGORY_STRING, TrayFields} from "./dependencies";

admin.initializeApp();

export const exportToCSV: functions.HttpsFunction =
    functions.region("europe-west1").https.onRequest(async (request, response) => {
        const warehouseId: string | undefined = request.query.id;
        if (warehouseId && (await admin.firestore().doc(joinPaths("warehouses", warehouseId)).get()).exists) {
            const firestoreResponses = await Promise.all([
                await admin.firestore().collection(joinPaths("warehouses", warehouseId, "trays")).get(),
                await admin.firestore().collection(joinPaths("warehouses", warehouseId, "categories")).get()
            ]);

            const [trayDocs, categoryDocs] = firestoreResponses;

            const trays: TrayFields[] = [];
            trayDocs.forEach(trayDoc => trays.push(trayDoc.data() as TrayFields));
            const categories: Map<string, Category> = new Map<string, Category>();
            categoryDocs.forEach(categoryDoc => categories.set(categoryDoc.id, categoryDoc.data() as Category));

            const content: string = trays.map(tray => {
                const line: string[] = [
                    categories.get(tray.categoryId)?.name ?? NULL_CATEGORY_STRING,
                    tray.expiry?.label ?? "",
                    tray.expiry?.from?.toString() ?? "",
                    tray.expiry?.to?.toString() ?? "",
                    tray.weight?.toString() ?? "",
                    tray.locationName,
                    tray.comment ?? ""
                ];

                return `${line.map(element => escapeStringToCSV(element))
                              .reduce((acc, cur) => `${acc}${cur},`, "")}\n`;

            }).reduce((acc, cur) => acc + cur) ?? null;

            const csvHeader: string = "Category, Expiry, Expiry From (Unix Timestamp), Expiry To (Unix Timestamp), Weight (kg), Location, Comment\n";

            response.statusCode = 200;
            response.setHeader("content-type", "text/plain");
            response.send(content ? csvHeader + content : "");
        } else {
            response.statusCode = 404;
            response.setHeader("content-type", "text/plain");
            response.send("Warehouse not found.");
        }
    });