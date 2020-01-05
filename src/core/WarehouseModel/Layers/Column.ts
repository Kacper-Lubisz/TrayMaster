import {MiddleLayer} from "../LayerStructure/MiddleLayer";
import {Bay, Shelf, Tray, TrayCell, TraySize, TraySpace, Warehouse, warehouse, Zone} from "../../WarehouseModel";
import Utils from "../Utils";


interface ColumnFields {
    index: number;
    traySizeId: string;
    maxHeight: number;
}

export class Column extends MiddleLayer<Shelf, Column, ColumnFields, Tray> {
    public readonly collectionName = "columns";
    protected readonly childCollectionName = "trays";

    /**
     * This stores the tray spaces.  The tray spaces must be stored and not rebuild each time because otherwise the two
     * different object would be different keys of the selection map
     */
    private static traySpaces: Map<Column, TraySpace[]> = new Map();

    public static create(index: number, traySize: TraySize, maxHeight: number, parent: Shelf): Column {
        return new Column(Utils.generateRandomId(), {
            index,
            traySizeId: warehouse.getTraySizeId(traySize),
            maxHeight
        }, parent);
    }

    public static createFromFields(id: string, fields: unknown, parent: Shelf): Column {
        return new Column(id, fields as ColumnFields, parent);
    }

    // eslint-disable-next-line @typescript-eslint/unbound-method
    protected createChild = Tray.createFromFields;

    //#region Field Getters and Setters
    public get index(): number {
        return this.fields.index;
    }

    public set index(index: number) {
        this.fields.index = index;
    }

    public get traySize(): TraySize | undefined {
        return warehouse.getTraySizeByID(this.fields.traySizeId);
    }

    public set traySize(traySize: TraySize | undefined) {
        this.fields.traySizeId = warehouse.getTraySizeId(traySize);
    }

    public get maxHeight(): number {
        return this.fields.maxHeight;
    }

    public set maxHeight(maxHeight: number) {
        this.fields.maxHeight = maxHeight;
    }

    //#endregion

    //#region Parent Getters
    get parentShelf(): Shelf | undefined {
        return this.parent;
    }

    get parentBay(): Bay | undefined {
        return this.parentShelf?.parentBay;
    }

    get parentZone(): Zone | undefined {
        return this.parentBay?.parentZone;
    }

    get parentWarehouse(): Warehouse | undefined {
        return this.parentZone?.parentWarehouse;
    }

    //#endregion

    //#region Children Getters
    get trays(): Tray[] {
        return this.children;
    }

    //#endregion

    /**
     * This method pads the tray arrays of a column with TraySpaces such that the the length of the returned array is
     * the max height of the column.  If the column has an undefined max height, it is padded with the specified value.
     * This method stores the tray spaces that are added in the traySpaces field such that the same TraySpace object is
     * always returned.  The same object being returned is important if it is going to be used as the key of a map.
     * @param ifNoMaxHeight The padding to add if maxHeight is empty
     * @return The padded array.
     */
    getPaddedTrays(ifNoMaxHeight = 1): TrayCell[] {

        const missingTrays = this.maxHeight ? Math.max(0, this.maxHeight - this.trays.length)
                                            : 1;

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
                        return ({column: this, index: this.trays.length + index} as TraySpace);
                    }
                ).concat(existing);

                Column.traySpaces.set(this, newSpaces);
                return (this.trays as TrayCell[]).concat(newSpaces);
            }

        } else { // build tray spaces

            const newSpaces = Array(missingTrays).fill(0).map((_, index) => {
                    return {column: this, index: this.trays.length + index};
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
    static purgePaddedSpaces(column?: Column): void {
        if (column) {
            Column.traySpaces.delete(column);
        } else {
            Column.traySpaces.clear();
        }
    }
}