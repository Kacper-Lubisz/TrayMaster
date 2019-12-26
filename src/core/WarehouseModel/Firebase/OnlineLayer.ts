import DatabaseObject from "./DatabaseObject";


/**
 * Represents a layer in the warehouse model
 */
export abstract class OnlineLayer extends DatabaseObject {
    abstract saveLayer(): Promise<void>;

    protected constructor(path: string) {
        super(path);
    }
}
