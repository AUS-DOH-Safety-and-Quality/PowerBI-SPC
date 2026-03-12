import rep from "../../src/Functions/rep";

describe("rep", () => {
    it("should repeat a number n times", () => {
        expect(rep(5, 3)).toEqual([5, 5, 5]);
    });

    it("should repeat a string n times", () => {
        expect(rep("a", 3)).toEqual(["a", "a", "a"]);
    });

    it("should return an empty array if n is 0", () => {
        expect(rep(10, 0)).toEqual([]);
    });

    it("should return an array with one element if n is 1", () => {
        expect(rep(10, 1)).toEqual([10]);
    });

    it("should repeat null", () => {
        expect(rep(null, 2)).toEqual([null, null]);
    });

    it("should repeat undefined", () => {
        expect(rep(undefined, 2)).toEqual([undefined, undefined]);
    });

    it("should repeat an object by reference", () => {
        const obj = { id: 1 };
        const result = rep(obj, 2);
        expect(result.length).toBe(2);
        expect(result[0]).toBe(obj);
        expect(result[1]).toBe(obj);

        // Verify reference by modifying original
        obj.id = 2;
        expect(result[0].id).toBe(2);
    });
});
