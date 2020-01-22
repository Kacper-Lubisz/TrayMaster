import Utils from "../core/WarehouseModel/Utils";


test("Test characteristics of Utils.joinPaths", () => {
    expect(Utils.joinPaths("")).toBe("");
    expect(Utils.joinPaths("", "")).toBe("");
    expect(Utils.joinPaths("a", "")).toBe("a");
    expect(Utils.joinPaths("a", "b")).toBe("a/b");
    expect(Utils.joinPaths("/a/", "b")).toBe("a/b");
    expect(Utils.joinPaths("a", "/b/")).toBe("a/b");
    expect(Utils.joinPaths("/a/", "/b/")).toBe("a/b");
    expect(Utils.joinPaths("/a", "/b/", "c/d", "e/")).toBe("a/b/c/d/e");
});


test("Test characteristics of Utils.isWhiteSpace", () => {
    expect(Utils.isWhiteSpace("")).toBe(true);
    expect(Utils.isWhiteSpace(" ")).toBe(true);
    expect(Utils.isWhiteSpace("\t")).toBe(true);
    expect(Utils.isWhiteSpace("\t \t")).toBe(true);
    expect(Utils.isWhiteSpace("a")).toBe(false);
    expect(Utils.isWhiteSpace("\ta\t ")).toBe(false);
    expect(Utils.isWhiteSpace("             a           ")).toBe(false);
});

test("Test characteristics of Utils.normalisePath", () => {
    expect(Utils.normalisePath("")).toBe("");
    expect(Utils.normalisePath("////////")).toBe("");
    expect(Utils.normalisePath("a/b/c/d")).toBe("a/b/c/d");
    expect(Utils.normalisePath("/a//")).toBe("a");
    expect(Utils.normalisePath("a//b///////c//d")).toBe("a/b/c/d");
    expect(Utils.normalisePath("/a/b/c/d/")).toBe("a/b/c/d");
});

test("Test characteristics of Utils.getPath", () => {
    expect(Utils.getID("")).toBe("");
    expect(Utils.getID("a/b/c/d/e")).toBe("e");
    expect(Utils.getID("/a/b/c/d/e/")).toBe("e");
    expect(Utils.getID("e")).toBe("e");
    expect(Utils.getID("/e//")).toBe("e");
});

test("Test characteristics of Utils.joinPaths", () => {
    expect(Utils.getPath("")).toBe("");
    expect(Utils.getPath("a/b/c/d/e")).toBe("a/b/c/d");
    expect(Utils.getPath("/a//b/c/d/e//")).toBe("a/b/c/d");
    expect(Utils.getPath("a")).toBe("");
});