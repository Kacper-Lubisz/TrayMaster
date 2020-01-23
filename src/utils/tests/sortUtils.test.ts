import {byNullSafe, composeSort, composeSorts, partitionBy} from "../sortsUtils";

const data: { foo: string; bar: string }[] = [
    {foo: "a", bar: "d"},
    {foo: "a", bar: "e"},
    {foo: "b", bar: "d"},
    {foo: "b", bar: "e"},
    {foo: "c", bar: "d"},
    {foo: "d", bar: "e"}
];

describe("byNullSafe", () => {
    it("Ascending", () => {
        const sorted = data.sort(byNullSafe(item => item.foo, false, false));
        expect(sorted.map(item => item.foo))
            .toStrictEqual(["d", "c", "b", "b", "a", "a"]);
    });
    it("Descending", () => {
        const sorted = data.sort(byNullSafe(item => item.foo, false, true));
        expect(sorted.map(item => item.foo))
            .toStrictEqual(["a", "a", "b", "b", "c", "d"]);
    });
    it("Null Before", () => {
        const sorted = data.map(item => item.foo === "a" ? null : item.foo)
                           .sort(byNullSafe(item => item, true, true));
        expect(sorted).toStrictEqual([null, null, "b", "b", "c", "d"]);
    });
    it("Null After", () => {
        const sorted = data.map(item => item.foo === "a" ? null : item.foo)
                           .sort(byNullSafe(item => item, false, true));
        expect(sorted).toStrictEqual(["b", "b", "c", "d", null, null]);
    });
});
describe("partitionBy", () => {
    it("False First", () => {
        const sorted = data.sort(partitionBy(item => item.foo < "b"));

        expect(sorted).toStrictEqual([
            {foo: "b", bar: "d"},
            {foo: "b", bar: "e"},
            {foo: "c", bar: "d"},
            {foo: "d", bar: "e"},
            {foo: "a", bar: "d"},
            {foo: "a", bar: "e"},
        ]);
    });
});
describe("composeSort", () => {
    it("Ascending", () => {
        const sorted = data.sort(
            composeSort(
                byNullSafe(item => item.foo, false, true),
                byNullSafe(item => item.bar, false, true)
            )
        );

        expect(sorted).toStrictEqual([
            {foo: "a", bar: "d"},
            {foo: "a", bar: "e"},
            {foo: "b", bar: "d"},
            {foo: "b", bar: "e"},
            {foo: "c", bar: "d"},
            {foo: "d", bar: "e"}
        ]);

    });
});
describe("composeSorts", () => {
    it("Ascending", () => {
        const items = data.map(item => ({
            ...item,
            sum: item.foo + item.bar
        }));

        const sortedA = items.sort(composeSorts([
            byNullSafe(item => item.foo, false, true),
            byNullSafe(item => item.bar, false, true),
        ]));

        const sortedB = items.sort(composeSorts([
            byNullSafe(item => item.sum, false, true),
        ]));

        expect(sortedA).toStrictEqual(sortedB);
    });
});