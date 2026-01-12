import diff from "../../src/Functions/diff";

describe("diff", () => {
    it("should return correct differences for an integer array", () => {
        const input = [1, 3, 6, 10];
        const expected = [null, 2, 3, 4];
        expect(diff(input)).toEqual(expected);
    });

    it("should return correct differences for a mixed positive and negative array", () => {
        const input = [1, -1, 1, -1];
        const expected = [null, -2, 2, -2];
        expect(diff(input)).toEqual(expected);
    });

    it("should handle decimal numbers", () => {
        const input = [1.5, 2.5, 4.0];
        const expected = [null, 1.0, 1.5];
        expect(diff(input)).toEqual(expected);
    });

    it("should handle an empty array", () => {
        const input: number[] = [];
        const expected: number[] = [];
        expect(diff(input)).toEqual(expected);
    });

    it("should handle a single element array", () => {
        const input = [10];
        const expected = [null];
        expect(diff(input)).toEqual(expected);
    });

    it("should handle non-changing values", () => {
        const input = [5, 5, 5];
        const expected = [null, 0, 0];
        expect(diff(input)).toEqual(expected);
    });
});
