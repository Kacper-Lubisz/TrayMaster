// SOURCE: https://campushippo.com/lessons/how-to-convert-rgb-colors-to-hexadecimal-with-javascript-78219fdb
function rgbToHex(rgb) {
    let hex = Number(rgb).toString(16);
    if (hex.length < 2) {
        hex = `0${hex}`;
    }
    return hex;
}

// SOURCE: https://gist.github.com/mjackson/5311256#gistcomment-2789005
/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 *
 * @param   h       The hue, in [0-360]
 * @param   s       The saturation, in [0-1]
 * @param   l       The lightness, in [0-1]
 * @return  string           The
 */
export function hslToRgb(h, s, l) {
    let hprime = h / 60;
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
        b = 0
    }
    if (hprime >= 1 && hprime < 2) {
        r = x;
        g = c;
        b = 0
    }
    if (hprime >= 2 && hprime < 3) {
        r = 0;
        g = c;
        b = x
    }
    if (hprime >= 3 && hprime < 4) {
        r = 0;
        g = x;
        b = c
    }
    if (hprime >= 4 && hprime < 5) {
        r = x;
        g = 0;
        b = c
    }
    if (hprime >= 5 && hprime < 6) {
        r = c;
        g = 0;
        b = x
    }

    r = Math.round((r + m) * 255);
    g = Math.round((g + m) * 255);
    b = Math.round((b + m) * 255);

    return `#${[r, g, b].map(rgbToHex).join("")}`;
}