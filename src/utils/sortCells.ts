import {TrayCell} from "../core/WarehouseModel";

import {byNullSafe, composeSorts} from "./sortsUtils";

export const trayComparisonFunction = composeSorts<TrayCell>([
    byNullSafe<TrayCell>(cell => cell.parentColumn.index),
    byNullSafe<TrayCell>(cell => cell.index, false, false)
]);