import "./database"
import {databaseRef} from "./database";

export class Warehouse {
  uid: string;
  name: string;
  zones: Zone[];

  private constructor() {

  }

  static async loadWarehouse() {

    databaseRef.child()

    new Warehouse()

  }

}

/**
 * @property color The color of the zone as a hex string eg. '#ff0000'
 */
export interface Zone {
  name: string;
  color: string;

  parentWarehouse: Warehouse;
  bays: Bay[];
}

/**
 * @property index The index of this bay within the parent zone (from 0, left to right)
 */
export interface Bay {
  name: string;

  index: number;
  parentZone: Zone;
  shelves: Shelf[];

}

export interface Shelf {
  name: string;

  index: number;
  parentBay: Bay;
  trays: Tray[];

}

export interface Column {

  index: number;
  parentShelf: Shelf;

  trays: Tray[];
}

class Category {
}


export interface Tray {

  customField: string | undefined;
  category?: Category;

}