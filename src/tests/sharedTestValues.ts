import {Warehouse} from "../core/WarehouseModel/Layers/Warehouse";

export const routeProps = {
    history: {
        push: jest.fn()
    }
};

export const mockWarehouse = Warehouse.create("wh1", "Tha big zone");

export const mockUser = {
    isAdmin: true,
    name: "Geraldinho",
    lastWarehouseID: "wh1",
    enableAutoAdvance: false,
    onlySingleAutoAdvance: false,
    showPreviousShelfButton: true,
    accessibleWarehouses: [mockWarehouse]
};