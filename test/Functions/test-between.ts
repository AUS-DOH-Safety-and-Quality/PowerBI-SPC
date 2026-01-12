import between from "../../src/Functions/between";

describe("between", () => {
    it("should return true when value is strictly between lower and upper bounds", () => {
        expect(between(5, 0, 10)).toBe(true);
    });

    it("should return true when value is equal to lower bound", () => {
        expect(between(0, 0, 10)).toBe(true);
    });

    it("should return true when value is equal to upper bound", () => {
        expect(between(10, 0, 10)).toBe(true);
    });

    it("should return false when value is less than lower bound", () => {
        expect(between(-1, 0, 10)).toBe(false);
    });

    it("should return false when value is greater than upper bound", () => {
        expect(between(11, 0, 10)).toBe(false);
    });

    it("should handle null lower bound as no lower limit", () => {
        expect(between(-100, null, 10)).toBe(true);
        expect(between(11, null, 10)).toBe(false);
    });

    it("should handle null upper bound as no upper limit", () => {
        expect(between(100, 0, null)).toBe(true);
        expect(between(-1, 0, null)).toBe(false);
    });

    it("should return true if both bounds are null", () => {
        expect(between(100, null, null)).toBe(true);
    });

    it("should work with strings", () => {
        expect(between("c", "a", "z")).toBe(true);
        expect(between("a", "b", "z")).toBe(false);
    });
});
