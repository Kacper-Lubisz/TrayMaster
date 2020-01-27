import dayjs, {Dayjs} from "dayjs";
import {ExpiryRange} from "../core/WarehouseModel";


/**
 * Period to use for a complete cycle around the hue color wheel
 * Using 8 currently because that's the number on the expiry keyboard (and what common food lasts longer than 8 years??)
 */
const YEAR_PERIOD = 8;

// SOURCE: https://campushippo.com/lessons/how-to-convert-rgb-colors-to-hexadecimal-with-javascript-78219fdb
/**
 * Converts a single member of an rgb(x, x, x) color value into two hex digits
 * @param rgb - one of the three r, g, b, values constituting a color
 */
function rgbToHex(rgb: number): string {
    let hex = Number(rgb).toString(16);
    if (hex.length < 2) {
        hex = `0${hex}`;
    }
    return hex;
}

// SOURCE: https://gist.github.com/mjackson/5311256#gistcomment-2789005
/**
 * Converts an HSL color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 *
 * @param   h       The hue, in [0-360]
 * @param   s       The saturation, in [0-1]
 * @param   l       The lightness, in [0-1]
 * @return  string  The hex code corresponding to the given HSL value
 */
export function hslToHex(h: number, s: number, l: number): string {
    const hprime = h / 60;
    const c = l * s;
    const x = c * (1 - Math.abs(hprime % 2 - 1));
    const m = l - c;
    let r, g, b;
    if (!hprime) {
        r = 0;
        g = 0;
        b = 0;
    }
    if (hprime >= 0 && hprime < 1) {
        r = c;
        g = x;
        b = 0;
    }
    if (hprime >= 1 && hprime < 2) {
        r = x;
        g = c;
        b = 0;
    }
    if (hprime >= 2 && hprime < 3) {
        r = 0;
        g = c;
        b = x;
    }
    if (hprime >= 3 && hprime < 4) {
        r = 0;
        g = x;
        b = c;
    }
    if (hprime >= 4 && hprime < 5) {
        r = x;
        g = 0;
        b = c;
    }
    if (hprime >= 5 && hprime < 6) {
        r = c;
        g = 0;
        b = x;
    }

    r = Math.round(((r ? r : 0) + m) * 255);
    g = Math.round(((g ? g : 0) + m) * 255);
    b = Math.round(((b ? b : 0) + m) * 255);

    return `#${[r, g, b].map(rgbToHex).join("")}`;
}

/**
 * Takes in the length of an expiry range in days (1-366 inclusive) and returns a saturation value to use
 * Used inside getExpiryColor
 * @see getExpiryColor
 * @param days - the length of an expiry range in days
 * @return number - the saturation to use for that range
 */
function getSaturation(days: number): number {
    if (days <= 0) {
        return 0;
    }        // not a valid range
    if (days <= 40) {
        return 1;       // month
    } else if (days <= 100) {
        return 0.75;    // quarter
    } else if (days <= 183) {
        return 0.6;     // 6 months
    } else if (days <= 366) {
        return 0.5;     // year
    }
    return 0;           // more than a year
}

/**
 * Takes in an ExpiryRange object and returns a hex color to use for that range
 * Hue depends on the start time of the expiry range in an 8 year cycle
 * Saturation depends on the length of the range (more precision = more intense color)
 * @param range {ExpiryRange} - the expiry range to return a color for
 * @return string - the 7-digit hex value to use for that expiry range
 */
export function getExpiryColor(range: ExpiryRange): string {

    if (range.from === null) {
        return "#000000"; //todo fixme special colour for indefinite

    } else {
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
        //todo eval this <-- what does this mean?
        const saturation = range.to ? getSaturation(dayjs(range.to).diff(djsDate, "day")) : 1;
        return hslToHex(ratioPeriod * 360, saturation, 1);
    }

}