import ColorContrastChecker from "color-contrast-checker";
import {getTextColorForBackground} from "../colorUtils";

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