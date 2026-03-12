import repIfScalar from "../../src/Functions/repIfScalar";

describe("repIfScalar", () => {
    it("should return the array as is if input is an array", () => {
        const arr = [1, 2, 3];
        expect(repIfScalar(arr, 5)).toBe(arr); // Expecting same reference or at least same content
    });

    it("should repeat scalar value n times", () => {
        expect(repIfScalar(10, 3)).toEqual([10, 10, 10]);
    });

    it("should repeat string scalar n times", () => {
        expect(repIfScalar("test", 2)).toEqual(["test", "test"]);
    });

    it("should repeat object scalar n times", () => {
        const obj = { a: 1 };
        const result = repIfScalar(obj, 2);
        expect(result).toEqual([obj, obj]);
    });

    it("should handle array inside array correctly (should treat it as array and return as is)", () => {
        // The type definition says T extends (infer U)[] ? U[] : T[]
        // If T is number[], it returns number[].
        const arr = [1, 2];
        expect(repIfScalar(arr, 3)).toEqual([1, 2]);
    });
});
