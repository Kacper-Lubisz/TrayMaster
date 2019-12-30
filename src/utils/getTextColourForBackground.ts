/**
 * Returns whether white or black text is best given a background colour
 * Sources: https://stackoverflow.com/a/5624139 - hex to RGB
 *          https://stackoverflow.com/a/3943023 - decide what colour to use
 * @param hex - the background colour, in shorthand or full hex
 */
export function getTextColourForBackground(hex: string) {
    // This expands shorthand hex colours to full hex e.g. #DEF to #DDEEFF
    const fullHex = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => `#${r}${r}${g}${g}${b}${b}`);

    // This implements the W3C accessibility guidelines for maintaining text contrast
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex)?.slice(1, 4).map((x) => {
        let normalised = parseInt(x, 16) / 255;
        return (normalised <= 0.03928) ? (normalised / 12.92) : (((normalised + 0.055) / 1.055) ** 2.4);
    }) ?? [1, 1, 1];
    const luminance = 0.2126 * result[0] + 0.7152 * result[1] + 0.0722 * result[2];

    return (luminance > 0.1791) ? "#000000" : "#ffffff";
}