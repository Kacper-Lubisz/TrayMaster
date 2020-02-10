import {Bay, Shelf, Tray, TrayCell, TraySize, TraySpace, Warehouse, WarehouseModel, Zone} from "../../WarehouseModel";
import {LayerFields} from "../LayerStructure/Layer";
import {MiddleLayer} from "../LayerStructure/MiddleLayer";
import Utils from "../Utils";

interface ColumnFields extends LayerFields {
    traySizeId: string;
    maxHeight: number;
}

export class Column extends MiddleLayer<Shelf, ColumnFields, Tray> {
    public readonly layerID: WarehouseModel = WarehouseModel.column;
    public readonly collectionName = "columns";
    public readonly childCollectionName = "trays";

    /**
     * This stores the tray spaces.  The tray spaces must be stored and not rebuild each time because otherwise the two
     * different object would be different keys of the selection map
     */
    private static traySpaces: Map<Column, TraySpace[]> = new Map<Column, TraySpace[]>();

    /**
     * @param traySize - The size of the tray
     * @param maxHeight - The maximum number of trays that can be placed in this column
     * @param parent - The parent shelf
     */
    public static create(traySize: TraySize, maxHeight: number, parent: Shelf): Column {
        return new Column(Utils.generateRandomId(), {
            lastModified: Date.now(),
            blame: "",
            traySizeId: parent.parentWarehouse.getTraySizeId(traySize),
            maxHeight
        }, parent);
    }

    /**
     * @param id - The database ID for the column
     * @param fields - The column fields
     * @param parent - The parent shelf
     */
    public static createFromFields = (id: string, fields: unknown, parent: Shelf): Column =>
        new Column(id, fields as ColumnFields, parent);

    public createChild = Tray.createFromFields;

    public toString(): string {
        return `Column(${this.parentShelf.toString()}, ${this.index}, ${this.traySize?.label}, ${this.maxHeight})`;
    }

    //#region Field Getters and Setters
    public get traySize(): TraySize | undefined {
        return this.parentWarehouse.getTraySizeByID(this.fields.traySizeId);
    }

    public set traySize(traySize: TraySize | undefined) {
        this.fields.traySizeId = this.parentWarehouse.getTraySizeId(traySize);
    }

    public get maxHeight(): number {
        return this.fields.maxHeight;
    }

    public set maxHeight(maxHeight: number) {
        this.fields.maxHeight = maxHeight;
    }

    //#endregion

    //#region Parent Getters
    public get parentShelf(): Shelf {
        return this.parent;
    }

    public get parentBay(): Bay {
        return this.parentShelf.parentBay;
    }

    public get parentZone(): Zone {
        return this.parentBay.parentZone;
    }

    public get parentWarehouse(): Warehouse {
        return this.parentZone.parentWarehouse;
    }

    //#endregion

    //#region Children Getters
    public get trays(): Tray[] {
        return this.children;
    }

    //#endregion

    /**
     * This method pads the tray arrays of a column with TraySpaces such that the the length of the returned array is
     * the max height of the column.  If the column has an undefined max height, it is padded with the specified value.
     * This method stores the tray spaces that are added in the traySpaces field such that the same TraySpace object is
     * always returned.  The same object being returned is important if it is going to be used as the key of a map.
     * @return The padded array.
     */
    public getPaddedTrays(): TrayCell[] {

        const missingTrays = Math.max(0, this.maxHeight - this.trays.length);

        const existing: TraySpace[] | undefined = Column.traySpaces.get(this);
        if (existing) {
            if (existing.length === missingTrays) {
                return (this.trays as TrayCell[]).concat(existing);
            } else if (existing.length > missingTrays) { // there are too many missing trays
                const newSpaces = existing.filter(space => space.index >= this.trays.length);

                Column.traySpaces.set(this, newSpaces);
                return (this.trays as TrayCell[]).concat(newSpaces);
            } else { // there are not enough tray spaces
                const traysToAdd = missingTrays - existing.length;
                const newSpaces = Array(traysToAdd).fill(0).map((_, index) => {
                    return ({parentColumn: this, index: this.trays.length + index} as TraySpace);
                    }
                ).concat(existing);

                Column.traySpaces.set(this, newSpaces);
                return (this.trays as TrayCell[]).concat(newSpaces);
            }
        } else { // build tray spaces
            const newSpaces = Array(missingTrays).fill(0).map((_, index) => {
                return {parentColumn: this, index: this.trays.length + index};
                }
            );
            Column.traySpaces.set(this, newSpaces);

            return (this.trays as TrayCell[]).concat(newSpaces);
        }
    }

    /**
     * This method clears the padded spaces, this can be used to reset empty spaces or otherwise to clear up memory
     * which will no longer be used.  If a column is passed then only that column is purged otherwise all columns are.
     */
    public static purgePaddedSpaces(column?: Column): void {
        if (column) {
            Column.traySpaces.delete(column);
        } else {
            Column.traySpaces.clear();
        }
    }
}