// SOURCE: https://campushippo.com/lessons/how-to-convert-rgb-colors-to-hexadecimal-with-javascript-78219fdb
/**
 * Converts a single member of an rgb(x, x, x) color value into two hex digits
 * @param rgb - one of the three r, g, b, values constituting a color
 */
function rgbToHex(rgb: number): string {
    let hex = Math.round(Number(rgb)).toString(16);
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
 * Returns whether black or white text is best given a background color
 * Sources: https://stackoverflow.com/a/5624139 - hex to RGB
 *          https://stackoverflow.com/a/3943023 - decide what color to use
 * @param hex - the background color, in shorthand or full hex
 */
export function getTextColorForBackground(hex: string): ("#000000" | "#ffffff") {
    // This expands shorthand hex colors to full hex e.g. #DEF to #DDEEFF
    const fullHex = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (_, r, g, b) => `#${r}${r}${g}${g}${b}${b}`);

    // This implements the W3C accessibility guidelines for maintaining text contrast
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex)?.slice(1, 4).map((x) => {
        const normalised = parseInt(x, 16) / 255;
        return (normalised <= 0.03928) ? (normalised / 12.92) : (((normalised + 0.055) / 1.055) ** 2.4);
    }) ?? [1, 1, 1];
    const luminance = 0.2126 * result[0] + 0.7152 * result[1] + 0.0722 * result[2];

    return (luminance > 0.1791) ? "#000000" : "#ffffff";
}

/**
 * Interpolates between the given colour and the given grey colour by the given ratio
 * @param color - the colour to retain the hue of
 * @param grey - the grey to move towards
 * @param ratio - the ratio towards the grey to move
 */
export function interpolateTowardsGrey(color: string, grey: string, ratio: number): string {
    let r: number = parseInt(color.substring(1, 3), 16);
    let g: number = parseInt(color.substring(3, 5), 16);
    let b: number = parseInt(color.substring(5, 7), 16);

    const greyIndex: number = parseInt(grey.substring(1, 3), 16);

    r += (greyIndex - r) * ratio;
    g += (greyIndex - g) * ratio;
    b += (greyIndex - b) * ratio;

    return `#${rgbToHex(r)}${rgbToHex(g)}${rgbToHex(b)}`;
}