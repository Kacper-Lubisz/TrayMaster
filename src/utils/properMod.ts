/**
 * Proper modulo function (gives a non-negative remainder as per mathematical definition)
 * @param dividend - the number that is being divided
 * @param divisor - the number to divide by
 * @returns the non-negative remainder
 */
export function properMod(dividend: number, divisor: number): number {
    return ((dividend % divisor) + divisor) % divisor;
}