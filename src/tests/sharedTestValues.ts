import {User} from "../core/Firebase";
import {Warehouse, WarehouseManager} from "../core/WarehouseModel";

export const mockSetup: Promise<[Warehouse, User]> = Promise.all([
    WarehouseManager.loadWarehouses().then((warehouse) => warehouse[0]),
    new User("MOCK_USER").load()
]);