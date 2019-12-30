import DatabaseObject, {DatabaseWriter} from "./DatabaseObject";


/**
 * Represents a layer in the warehouse model
 */
export abstract class Layer<T> extends DatabaseObject<T> {
    protected async save(): Promise<void> {
        await DatabaseWriter.addChange(this.path, this);
        await DatabaseWriter.addChange(`${this.colName}/${this.id}`, this);
    }
}
