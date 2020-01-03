import DatabaseObject from "../core/WarehouseModel/DatabaseObject";

interface TestObjFields {

}


class TestObj extends DatabaseObject<TestObjFields> {
    public constructor();
    public constructor(fullPath: string);
    public constructor(path: string, id: string);
    public constructor(path?: string, id?: string) {
        if (path && id) super({}, path, id);
        else if (path) super({}, path);
        else super({});
    }

    public getColPath() {
        return this.colPath;
    }

    public getId() {
        return this.id;
    }

    public getPath() {
        return this.path;
    }

    public getColName() {
        return this.colName;
    }

    protected async save(): Promise<void> {
    }
}

test("DB path manipulation consistency and normalisation", () => {
    const testObjA: TestObj = new TestObj("/testLocation/ABC");
    expect(testObjA.getPath()).toBe("testLocation/ABC");
    expect(testObjA.getColPath()).toBe("testLocation");
    expect(testObjA.getId()).toBe("ABC");
    expect(testObjA.getColName()).toBe("testLocation");

    const testObjB: TestObj = new TestObj("/test/location/ABC/");
    expect(testObjB.getColPath()).toBe("test/location");
    expect(testObjB.getId()).toBe("ABC");

    const testObjC: TestObj = new TestObj("/test/location/", "ABC");
    expect(testObjC.getColPath()).toBe("test/location");
    expect(testObjC.getId()).toBe("ABC");
});
