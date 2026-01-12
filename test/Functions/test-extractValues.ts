import extractValues from "../../src/Functions/extractValues";

describe("extractValues", () => {
    it("should extract values from array based on indices", () => {
        const values = ["a", "b", "c", "d", "e"];
        const indices = [0, 2, 4];
        const expected = ["a", "c", "e"];
        expect(extractValues(values, indices)).toEqual(expected);
    });

    it("should extract values reordering them if indices are not sorted", () => {
        const values = [10, 20, 30];
        const indices = [2, 0];
        const expected = [30, 10];
        expect(extractValues(values, indices)).toEqual(expected);
    });

    it("should handle extracting the same index multiple times", () => {
        const values = [1, 2, 3];
        const indices = [0, 0, 1];
        const expected = [1, 1, 2];
        expect(extractValues(values, indices)).toEqual(expected);
    });

    it("should return undefined for out-of-bounds indices", () => {
        const values = [1, 2];
        const indices = [0, 5];
        const expected = [1, undefined];
        expect(extractValues(values, indices)).toEqual(expected);
    });

    it("should return an empty array if valuesArray is null", () => {
        expect(extractValues(null, [0, 1])).toEqual([]);
    });

    it("should return an empty array if valuesArray is undefined", () => {
        expect(extractValues(undefined, [0, 1])).toEqual([]);
    });

    it("should return an empty array if indices array is empty", () => {
        expect(extractValues([1, 2, 3], [])).toEqual([]);
    });
});
