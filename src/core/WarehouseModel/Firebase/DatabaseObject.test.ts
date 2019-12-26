import React from "react";
import DatabaseObject from "./DatabaseObject";

class TestObj extends DatabaseObject {
    public constructor(path: string) {
        super(path);
    }

    public getPath() {
        return this.path;
    }

    public getChildPath(childId: string): string {
        return super.getChildPath(childId);
    }
}

test("DB path manipulation", () => {
    const testObj: TestObj = new TestObj("testLocation");
    expect(testObj.getPath()).toBe("testLocation");
    expect(testObj.getChildPath("test")).toBe("testLocation/test");
});
