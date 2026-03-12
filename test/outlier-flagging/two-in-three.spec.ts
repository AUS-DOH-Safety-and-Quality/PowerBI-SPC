import twoInThree from "../../src/Outlier Flagging/twoInThree";

describe("twoInThree", () => {
    it("should return 'none' when no points are outside 95% limits", () => {
        const val = [5, 6, 7, 8, 9];
        const ll95 = [0, 0, 0, 0, 0];
        const ul95 = [10, 10, 10, 10, 10];
        const highlight_series = false;

        const result = twoInThree(val, ll95, ul95, highlight_series);

        expect(result).toEqual(["none", "none", "none", "none", "none"]);
    });

    it("should detect two-in-three upper violations (2 out of 3 above upper limit)", () => {
        const val = [5, 11, 11, 5, 5, 5];
        const ll95 = [0, 0, 0, 0, 0, 0];
        const ul95 = [10, 10, 10, 10, 10, 10];
        const highlight_series = false;

        const result = twoInThree(val, ll95, ul95, highlight_series);

        expect(result).toEqual(["none", "upper", "upper", "none", "none", "none"]);
    });

    it("should detect two-in-three lower violations (2 out of 3 below lower limit)", () => {
        const val = [5, -1, -1, 5, 5, 5];
        const ll95 = [0, 0, 0, 0, 0, 0];
        const ul95 = [10, 10, 10, 10, 10, 10];
        const highlight_series = false;

        const result = twoInThree(val, ll95, ul95, highlight_series);

        expect(result).toEqual(["none", "lower", "lower", "none", "none", "none"]);
    });

    it("should detect pattern: outside, outside, inside (3 consecutive with 2 outside)", () => {
        const val = [5, 11, 11, 5, 5, 5];
        const ll95 = [0, 0, 0, 0, 0, 0];
        const ul95 = [10, 10, 10, 10, 10, 10];
        const highlight_series = false;

        const result = twoInThree(val, ll95, ul95, highlight_series);

        expect(result).toEqual(["none", "upper", "upper", "none", "none", "none"]);
    });

    it("should detect pattern: outside, inside, outside (3 consecutive with 2 outside)", () => {
        const val = [11, 5, 11, 5, 5];
        const ll95 = [0, 0, 0, 0, 0];
        const ul95 = [10, 10, 10, 10, 10];
        const highlight_series = false;

        const result = twoInThree(val, ll95, ul95, highlight_series);

        // By default, only points outside 95% are highlighted
        expect(result).toEqual(["upper", "none", "upper", "none", "none"]);
    });

    it("should detect pattern: inside, outside, outside (3 consecutive with 2 outside)", () => {
        const val = [5, 11, 11, 5, 5];
        const ll95 = [0, 0, 0, 0, 0];
        const ul95 = [10, 10, 10, 10, 10];
        const highlight_series = false;

        const result = twoInThree(val, ll95, ul95, highlight_series);

        expect(result).toEqual(["none", "upper", "upper", "none", "none"]);
    });

    it("should highlight all points in sequence when highlight_series is true", () => {
        const val = [11, 5, 11, 5, 5];
        const ll95 = [0, 0, 0, 0, 0];
        const ul95 = [10, 10, 10, 10, 10];
        const highlight_series = true;

        const result = twoInThree(val, ll95, ul95, highlight_series);

        // With highlight_series=true, all 3 points are flagged
        expect(result).toEqual(["upper", "upper", "upper", "none", "none"]);
    });

    it("should not detect when only 1 out of 3 points is outside limits", () => {
        const val = [11, 5, 5, 5, 5];
        const ll95 = [0, 0, 0, 0, 0];
        const ul95 = [10, 10, 10, 10, 10];
        const highlight_series = false;

        const result = twoInThree(val, ll95, ul95, highlight_series);

        expect(result).toEqual(["none", "none", "none", "none", "none"]);
    });

    it("should detect when all 3 out of 3 points are outside limits", () => {
        const val = [5, 11, 11, 11, 5, 5];
        const ll95 = [0, 0, 0, 0, 0, 0];
        const ul95 = [10, 10, 10, 10, 10, 10];
        const highlight_series = false;

        const result = twoInThree(val, ll95, ul95, highlight_series);

        expect(result).toEqual(["none", "upper", "upper", "upper", "none", "none"]);
    });

    it("should handle mixed upper and lower violations separately", () => {
        const val = [5, 11, 11, -1, 5, 5];
        const ll95 = [0, 0, 0, 0, 0, 0];
        const ul95 = [10, 10, 10, 10, 10, 10];
        const highlight_series = false;

        const result = twoInThree(val, ll95, ul95, highlight_series);

        // Upper violations in positions 1-2, lower violation is isolated
        expect(result).toEqual(["none", "upper", "upper", "none", "none", "none"]);
    });

    it("should detect consecutive two-in-three patterns", () => {
        const val = [5, 11, 11, 5, 11, 11, 5];
        const ll95 = [0, 0, 0, 0, 0, 0, 0];
        const ul95 = [10, 10, 10, 10, 10, 10, 10];
        const highlight_series = false;

        const result = twoInThree(val, ll95, ul95, highlight_series);

        expect(result).toEqual(["none", "upper", "upper", "none", "upper", "upper", "none"]);
    });

    it("should handle empty arrays", () => {
        const val: number[] = [];
        const ll95: number[] = [];
        const ul95: number[] = [];
        const highlight_series = false;

        const result = twoInThree(val, ll95, ul95, highlight_series);

        expect(result).toEqual([]);
    });

    it("should handle single point", () => {
        const val = [11];
        const ll95 = [0];
        const ul95 = [10];
        const highlight_series = false;

        const result = twoInThree(val, ll95, ul95, highlight_series);

        // Need 2 out of 3, so single point cannot trigger
        expect(result).toEqual(["none"]);
    });

    it("should handle three points with exactly 2 outside", () => {
        const val = [5, 11, 11, 5];
        const ll95 = [0, 0, 0, 0];
        const ul95 = [10, 10, 10, 10];
        const highlight_series = false;

        const result = twoInThree(val, ll95, ul95, highlight_series);

        // 2 out of 3 points outside limits
        expect(result).toEqual(["none", "upper", "upper", "none"]);
    });

    it("should work with varying control limits", () => {
        const val = [5, 25, 25, 35, 45];
        const ll95 = [0, 10, 20, 30, 40];
        const ul95 = [10, 20, 30, 40, 50];
        const highlight_series = false;

        const result = twoInThree(val, ll95, ul95, highlight_series);

        // Only index 1 is outside its limit (25 > 20), not enough for 2-in-3
        expect(result).toEqual(["none", "none", "none", "none", "none"]);
    });

    it("should not flag points on the 95% limits", () => {
        const val = [10, 10, 5, 5, 5];
        const ll95 = [0, 0, 0, 0, 0];
        const ul95 = [10, 10, 10, 10, 10];
        const highlight_series = false;

        const result = twoInThree(val, ll95, ul95, highlight_series);

        // Points exactly on limit are not outside
        expect(result).toEqual(["none", "none", "none", "none", "none"]);
    });

    it("should detect lower two-in-three pattern", () => {
        const val = [5, -1, -1, 5, 5];
        const ll95 = [0, 0, 0, 0, 0];
        const ul95 = [10, 10, 10, 10, 10];
        const highlight_series = false;

        const result = twoInThree(val, ll95, ul95, highlight_series);

        expect(result).toEqual(["none", "lower", "lower", "none", "none"]);
    });

    it("should handle rolling window correctly (continuous pattern)", () => {
        const val = [5, 11, 11, 5, 11, 5, 5];
        const ll95 = [0, 0, 0, 0, 0, 0, 0];
        const ul95 = [10, 10, 10, 10, 10, 10, 10];
        const highlight_series = false;

        const result = twoInThree(val, ll95, ul95, highlight_series);

        // Indices 0,1,2: 2/3 outside -> flag 1,2
        // Indices 2,3,4: 2/3 outside -> flag 2,4
        expect(result).toEqual(["none", "upper", "upper", "none", "upper", "none", "none"]);
    });
});
