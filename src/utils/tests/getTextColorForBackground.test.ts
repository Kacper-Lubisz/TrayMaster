import {getTextColorForBackground} from "../getTextColorForBackground";
import ColorContrastChecker from "color-contrast-checker";

// fixme I've got everything except this to work using the definition in src/@types/color-contrast-checker.d.ts
const ccc = new ColorContrastChecker();

describe("Function outputs colour combinations that meet accessibility guidelines:", () => {
    it("outputs values that meet guidelines for randomised colours", () => {
        for (let i = 0; i < 20; i++) {
            const bg = `#${Math.floor(Math.random() * 16 ** 6).toString(16).padStart(6, "0")}`;

            if (!ccc.isLevelAA(bg, getTextColorForBackground(bg))) {
                throw Error("Colour does not meet guidelines!");
            }
        }
    });
});