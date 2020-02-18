import {compareVersions} from "../compareVersions";

describe("Function returns correct values", () => {

    it("Identifies identical version numbers", () => {
        expect(compareVersions("1.8", "1.8")).toBe(0);
    });

    it("Identifies ordered version numbers", () => {
        expect(compareVersions("0.3", "0.4")).toBe(1);
    });

    it("Identifies backwards version numbers", () => {
        expect(compareVersions("5.3.8", "5.3.7")).toBe(-1);
    });

    it("Identifies longer version names as later", () => {
        expect(compareVersions("1.5.2.4.2.3.2.4.5", "1.5")).toBe(-1);
    });

    it("Works for single-digit version numbers", () => {
        expect(compareVersions("0", "1")).toBe(1);
        expect(compareVersions("5", "2")).toBe(-1);
        expect(compareVersions("3", "3")).toBe(0);
    });

    it("Can compare version numbers with more than one digit between points", () => {
        expect(compareVersions("1.56", "1.75")).toBe(1);
        expect(compareVersions("154.23821673", "154.23821674")).toBe(1);
        expect(compareVersions("2713.4", "2713.1")).toBe(-1);
        expect(compareVersions("912732138", "912732138")).toBe(0);
        expect(compareVersions("74.23.1213.412312.1412", "74.23.1213.412312.1414")).toBe(1);
        expect(compareVersions("891273.123721.24", "891273.123721.21")).toBe(-1);
    });
});