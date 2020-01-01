import DatabaseObject, {DatabaseWriter} from "./DatabaseObject";


export interface TopLevelFields {
    fullPath: string;
}


/**
 * Represents a layer in the warehouse model
 */
export abstract class Layer<TF> extends DatabaseObject<TF> {
    protected constructor(defaultFields: TF);
    protected constructor(defaultFields: TF, fullPath: string);
    protected constructor(defaultFields: TF, path: string, id: string);
    protected constructor(defaultFields: TF, path?: string, id?: string) {
        if (path && id) super(defaultFields, path, id);
        else if (path) super(defaultFields, path);
        else super(defaultFields);
    }

    protected async save(): Promise<void> {
        await DatabaseWriter.addChange(this.path, this.fields);
        let topLevelFields: TF & TopLevelFields = this.fields as TF & TopLevelFields;
        topLevelFields.fullPath = this.path;
        await DatabaseWriter.addChange<TopLevelFields & TF>(`${this.colName}/${this.id}`, topLevelFields);
    }
}
