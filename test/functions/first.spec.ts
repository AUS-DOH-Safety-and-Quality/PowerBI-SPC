import first from "../../src/Functions/first";

describe("first", () => {
    it("should return the first element of an array", () => {
        expect(first([1, 2, 3])).toBe(1);
    });

    it("should return the first element of a string array", () => {
        expect(first(["a", "b"])).toBe("a");
    });

    it("should return undefined if the array is empty", () => {
        expect(first([])).toBeUndefined();
    });

    it("should return the value itself if it is a number scalar", () => {
        expect(first(42)).toBe(42);
    });

    it("should return the value itself if it is a string scalar", () => {
        expect(first("hello")).toBe("hello");
    });

    it("should return null if input is null", () => {
        expect(first(null)).toBeNull();
    });

    it("should return undefined if input is undefined", () => {
        expect(first(undefined)).toBeUndefined();
    });
});
