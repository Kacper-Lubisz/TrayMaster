import {TrayCell} from "../core/WarehouseModel";
import {Tray} from "../core/WarehouseModel/Layers/Tray";

import {byNullSafe, composeSorts} from "./sortsUtils";

export const trayComparisonFunction = composeSorts<TrayCell>([
    byNullSafe<TrayCell>(cell =>
        (cell instanceof Tray ? cell.parentColumn : cell.column).indexInParent
    ),
    byNullSafe<TrayCell>(cell =>
        (cell instanceof Tray ? cell.indexInParent : cell.index)
    )
]);