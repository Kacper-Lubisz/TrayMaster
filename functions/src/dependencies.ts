export interface ExpiryRange {
    from: number | null;
    to: number | null;
    label: string;
}

export interface TrayFields {
    categoryId: string;
    expiry: ExpiryRange | null;
    weight: number | null;
    comment: string | null;
}

/**
 * Represents a single tray category
 */
export interface Category {
    index: number;
    name: string;
    shortName: string | null;
    underStockThreshold: number | null;
    overStockThreshold: number | null;
    type: "default" | "custom";
    group: string | null;
}

export const NULL_CATEGORY_STRING = "Unsorted";

/**
 * Join any number of paths together and normalise them
 * @param paths
 * @returns The paths joined as one
 */
export function joinPaths(...paths: string[]): string {
    if (paths.length === 0) {
        return "";
    }
    return normalisePath(paths.reduce((previous, current) => `${previous}/${current}`));
}

/**
 * Normalise a path to a form with no leading, trailing or repeated forward slash
 * @param path - The path to normalise
 * @returns The normalised path
 */
export function normalisePath(path: string): string {
    return path.replace(/^\/*|\/*$/g, "").replace(/\/+/g, "/");
}

/**
 * This method escapes special character in the string making up a cell of a .csv file.
 * @param string the string to escape
 */
export function escapeStringToCSV(string: string): string {
    return `"${string.replace("\"", "\"\"")}"`;
}