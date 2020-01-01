declare module "color-contrast-checker" {
    export interface ColorContrastChecker {
        isLevelAAA(colorA: string, colorB: string, fontSize?: number): boolean;

        isLevelAA(colorA: string, colorB: string, fontSize?: number): boolean;
    }
}