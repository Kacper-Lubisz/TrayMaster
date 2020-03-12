import dayjs, {Dayjs} from "dayjs";
import {ExpiryRange} from "../core/WarehouseModel";
import {hslToHex} from "./colorUtils";


/**
 *  interface specifying an ExpiryRange with non-null from and to
 */
interface SafeExpiryRange {
    from: number;
    to: number;
    label: string;
}


/**
 * Period to use for a complete cycle around the hue color wheel
 * Using 8 currently because that's the number on the expiry keyboard (and what common food lasts longer than 8 years??)
 */
const YEAR_PERIOD = 8;

/**
 * Takes in the length of an expiry range in days (1-366 inclusive) and returns a saturation value to use
 * Used inside getExpiryColor
 * @see getExpiryColor
 * @param days - the length of an expiry range in days
 * @return number - the saturation to use for that range
 */
function getSaturation(days: number): number {
    if (days <= 0) { // not a valid range
        return 0;
    } else if (days <= 40) { // month
        return 1;
    } else if (days <= 100) { // quarter
        return 0.6;
    } else if (days <= 366) { // year
        return 0.5;
    } else { // more than a year
        return 0;
    }
}


/**
 * Takes in an ExpiryRange object and returns a hex color to use for that range
 * Hue depends on the start time of the expiry range in an 8 year cycle
 * Saturation depends on the length of the range (more precision = more intense color)
 * @param range {ExpiryRange} - the expiry range to return a color for
 * @return string - the 7-digit hex value to use for that expiry range
 */
function computeColorFromRange(range: SafeExpiryRange): string {
    // get a dayjs date corresponding to the from property of the range, to use later
    const djsDate: Dayjs = dayjs(range.from);

    // Year modulo YEAR_PERIOD
    const modYear: number = djsDate.year() % YEAR_PERIOD;

    // Ratio of the way through the month
    const ratioMonth: number = (djsDate.date()) / djsDate.date(-1).date();

    // Ratio of the way through the year
    const ratioYear: number = ((djsDate.month()) + ratioMonth) / 12;

    // Ratio of the way through the period
    const ratioPeriod = (modYear + ratioYear) / YEAR_PERIOD;

    // get saturation from difference between from and to and return hex value
    const saturation = getSaturation(dayjs(range.to).diff(djsDate, "day"));
    return hslToHex(ratioPeriod * 360, saturation, 1);
}

/**
 * Computes 'hybrid' colour:
 * - hue derived from standard warehouse 5-year colour cycle
 * - saturation derived from expiry range length
 * @param range {ExpiryRange} - the expiry range to return a color for
 * @return string - the 7-digit hex value to use for that expiry range
 */
function computeHybridColorFromRange(range: SafeExpiryRange): string {
    const yearHueCycle = [
        60,
        180,
        320,
        290,
        120
    ];

    const djsDate: Dayjs = dayjs(range.from);

    const saturation = getSaturation(dayjs(range.to).diff(djsDate, "day"));
    return hslToHex(yearHueCycle[djsDate.year() % 5], saturation, 1);
}

/**
 * Computes 'warehouse' colour, derived from standard warehouse 5-year colour cycle
 * @param range {ExpiryRange} - the expiry range to return a color for
 * @return string - the 7-digit hex value to use for that expiry range
 */
function getWarehouseColor(range: SafeExpiryRange): string {
    // todo consider making this a setting
    const yearCycle = [
        "#fff44d",
        "#0ea5ff",
        "#ff97cc",
        "#d597ff",
        "#49ff55"
    ];

    return yearCycle[dayjs(range.from).year() % 5];
}


/**
 * Takes in an ExpiryRange and chooses the colour to use for it, based on current settings
 * @param range {ExpiryRange} - the expiry range to return a color for
 * @param mode - The mode detailing how colouring should be done, either 'computed', 'hybrid or, 'warehouse'
 * @return string - the 7-digit hex value to use for that expiry range
 */
export function getExpiryColor(range: ExpiryRange, mode: "computed" | "hybrid" | "warehouse"): string {
    if (range.from === null || range.to === null) {
        return "#ffffff00";
    } else if (mode === "computed") {
        return computeColorFromRange(range as SafeExpiryRange);
    } else if (mode === "hybrid") {
        return computeHybridColorFromRange(range as SafeExpiryRange);
    } else {
        return getWarehouseColor(range as SafeExpiryRange);
    }
}