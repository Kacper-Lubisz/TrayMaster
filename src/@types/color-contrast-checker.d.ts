declare module "color-contrast-checker" {
    class ColorContrastChecker {
        constructor();

        isLevelAAA(colorA: string, colorB: string, fontSize?: number): boolean;

        isLevelAA(colorA: string, colorB: string, fontSize?: number): boolean;
    }

    export = ColorContrastChecker;
}