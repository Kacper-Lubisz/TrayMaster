import {Tray} from "../core/WarehouseModel/Layers/Tray";
import {TrayCell} from "../core/WarehouseModel";

export const trayComparisonFunction = (a: TrayCell, b: TrayCell): number => {

    // this is a multi level sort

    const aColumnIndex = (a instanceof Tray ? a.parentColumn : a.column).indexInParent;
    const bColumnIndex = (b instanceof Tray ? b.parentColumn : b.column).indexInParent;

    const aTrayIndex = (a instanceof Tray ? a.indexInParent : a.index);
    const bTrayIndex = (b instanceof Tray ? b.indexInParent : b.index);

    if (aColumnIndex !== bColumnIndex) {
        return aColumnIndex > bColumnIndex ? 1 : -1;
    } else if (aTrayIndex !== bTrayIndex) {
        return aTrayIndex > bTrayIndex ? -1 : 1;
    } else {
        return 0;
    }

};