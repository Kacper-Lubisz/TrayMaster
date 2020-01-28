/**
 * This method composes a sequence of sorts to build one multi-level sort
 * @param comparators
 */
export function composeSorts<T>(
    comparators: ((a: T, b: T) => number)[],
): (a: T, b: T) => number {
    return comparators.reduce(composeSort, () => 0);
}

/**
 * This method composes two sorts into a multi-level sort
 * @param first The comparison to be performed first
 * @param second The comparison to be performed second
 */
export function composeSort<T>(
    first: (a: T, b: T) => number,
    second: (a: T, b: T) => number
): (a: T, b: T) => number {
    return (a, b) => {
        const firstResult = first(a, b);
        if (firstResult === 0) {
            return second(a, b);
        } else {
            return firstResult;
        }
    };
}

/**
 * This method creates a comparison function which partitions when sorting based on the key such that true comes
 * after those which are false
 * @param key The key to partition by
 */
export function partitionBy<T>(
    key: (a: T) => boolean,
): (a: T, b: T) => number {

    return (a: T, b: T): number => {
        const keyA = key(a);
        const keyB = key(b);

        if (keyA === keyB) {
            return 0;
        } else if (keyB) {
            return -1;
        } else {
            return 1;
        }
    };
}

/**
 * This method creates a comparison function which sorts by a key, it either puts all the nulls before or after
 * @param key The key to sort by
 * @param before If the nulls should come before (or after otherwise)
 * @param ascending If the order of the sort should be ascending
 */
export function byNullSafe<T>(
    key: (a: T) => any | null | undefined,
    before = true,
    ascending = true
): (a: T, b: T) => number {

    const smaller = ascending ? -1 : 1;

    return (a: T, b: T): number => {
        const keyA = key(a);
        const keyB = key(b);

        const bIsUndefined = (keyB ?? null) === null;
        const aIsUndefined = (keyA ?? null) === null;

        if (keyA === keyB || (bIsUndefined && aIsUndefined)) {
            return 0;

        } else if (aIsUndefined) {
            return before ? -1 : 1;

        } else if (bIsUndefined) {
            return before ? 1 : -1;

        } else {
            return keyA < keyB ? smaller : -smaller;
        }
    };
}