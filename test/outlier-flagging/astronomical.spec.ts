import astronomical from "../../src/Outlier Flagging/astronomical";

describe("astronomical", () => {
    it("should return 'none' when all points are within control limits", () => {
        const val = [5, 6, 7, 8, 9];
        const ll99 = [0, 0, 0, 0, 0];
        const ul99 = [10, 10, 10, 10, 10];

        const result = astronomical(val, ll99, ul99);

        expect(result).toEqual(["none", "none", "none", "none", "none"]);
    });

    it("should return 'upper' when points exceed upper control limit", () => {
        const val = [5, 11, 7, 12, 9];
        const ll99 = [0, 0, 0, 0, 0];
        const ul99 = [10, 10, 10, 10, 10];

        const result = astronomical(val, ll99, ul99);

        expect(result).toEqual(["none", "upper", "none", "upper", "none"]);
    });

    it("should return 'lower' when points fall below lower control limit", () => {
        const val = [5, -1, 7, -2, 9];
        const ll99 = [0, 0, 0, 0, 0];
        const ul99 = [10, 10, 10, 10, 10];

        const result = astronomical(val, ll99, ul99);

        expect(result).toEqual(["none", "lower", "none", "lower", "none"]);
    });

    it("should correctly identify both upper and lower outliers in the same dataset", () => {
        const val = [5, 11, -1, 8, 12];
        const ll99 = [0, 0, 0, 0, 0];
        const ul99 = [10, 10, 10, 10, 10];

        const result = astronomical(val, ll99, ul99);

        expect(result).toEqual(["none", "upper", "lower", "none", "upper"]);
    });

    it("should handle points exactly on the control limits as 'none'", () => {
        const val = [0, 5, 10];
        const ll99 = [0, 0, 0];
        const ul99 = [10, 10, 10];

        const result = astronomical(val, ll99, ul99);

        expect(result).toEqual(["none", "none", "none"]);
    });

    it("should work with varying control limits", () => {
        const val = [5, 15, 25, 35, 45];
        const ll99 = [0, 10, 20, 30, 40];
        const ul99 = [10, 20, 30, 40, 50];

        const result = astronomical(val, ll99, ul99);

        expect(result).toEqual(["none", "none", "none", "none", "none"]);
    });

    it("should detect outliers with varying control limits", () => {
        const val = [5, 25, 25, 35, 55];
        const ll99 = [0, 10, 20, 30, 40];
        const ul99 = [10, 20, 30, 40, 50];

        const result = astronomical(val, ll99, ul99);

        expect(result).toEqual(["none", "upper", "none", "none", "upper"]);
    });

    it("should handle empty arrays", () => {
        const val: number[] = [];
        const ll99: number[] = [];
        const ul99: number[] = [];

        const result = astronomical(val, ll99, ul99);

        expect(result).toEqual([]);
    });

    it("should handle single point within limits", () => {
        const val = [5];
        const ll99 = [0];
        const ul99 = [10];

        const result = astronomical(val, ll99, ul99);

        expect(result).toEqual(["none"]);
    });

    it("should handle single point outside limits", () => {
        const val = [15];
        const ll99 = [0];
        const ul99 = [10];

        const result = astronomical(val, ll99, ul99);

        expect(result).toEqual(["upper"]);
    });

    it("should work with negative control limits", () => {
        const val = [-15, -10, -5, 0, 5];
        const ll99 = [-20, -20, -20, -20, -20];
        const ul99 = [0, 0, 0, 0, 0];

        const result = astronomical(val, ll99, ul99);

        expect(result).toEqual(["none", "none", "none", "none", "upper"]);
    });
});
