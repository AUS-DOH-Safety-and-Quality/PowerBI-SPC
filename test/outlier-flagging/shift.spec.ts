import shift from "../../src/Outlier Flagging/shift";

describe("shift", () => {
    it("should return 'none' when no shift is detected (n=7)", () => {
        const val = [5, 6, 4, 5, 6, 4, 5];
        const targets = [5, 5, 5, 5, 5, 5, 5];
        const n = 7;

        const result = shift(val, targets, n);

        expect(result).toEqual(["none", "none", "none", "none", "none", "none", "none"]);
    });

    it("should detect upper shift when n consecutive points are above target (n=5)", () => {
        const val = [5, 6, 6, 6, 6, 6, 5];
        const targets = [5, 5, 5, 5, 5, 5, 5];
        const n = 5;

        const result = shift(val, targets, n);

        expect(result).toEqual(["none", "upper", "upper", "upper", "upper", "upper", "none"]);
    });

    it("should detect lower shift when n consecutive points are below target (n=5)", () => {
        const val = [5, 4, 4, 4, 4, 4, 5];
        const targets = [5, 5, 5, 5, 5, 5, 5];
        const n = 5;

        const result = shift(val, targets, n);

        expect(result).toEqual(["none", "lower", "lower", "lower", "lower", "lower", "none"]);
    });

    it("should detect shift exactly at n points (n=3)", () => {
        const val = [5, 6, 6, 6, 5];
        const targets = [5, 5, 5, 5, 5];
        const n = 3;

        const result = shift(val, targets, n);

        expect(result).toEqual(["none", "upper", "upper", "upper", "none"]);
    });

    it("should not detect shift when n-1 consecutive points are on same side (n=4)", () => {
        const val = [5, 6, 6, 6, 5];
        const targets = [5, 5, 5, 5, 5];
        const n = 4;

        const result = shift(val, targets, n);

        expect(result).toEqual(["none", "none", "none", "none", "none"]);
    });

    it("should reset when shift is interrupted", () => {
        const val = [6, 6, 6, 5, 6, 6, 6, 6];
        const targets = [5, 5, 5, 5, 5, 5, 5, 5];
        const n = 4;

        const result = shift(val, targets, n);

        expect(result).toEqual(["none", "none", "none", "none", "upper", "upper", "upper", "upper"]);
    });

    it("should work with varying targets", () => {
        const val = [6, 7, 8, 9, 10];
        const targets = [5, 6, 7, 8, 9];
        const n = 3;

        const result = shift(val, targets, n);

        // All points are consistently 1 above target, so 3+ consecutive detected
        expect(result).toEqual(["upper", "upper", "upper", "upper", "upper"]);
    });

    it("should handle points exactly on target as no shift", () => {
        const val = [5, 5, 5, 5, 5];
        const targets = [5, 5, 5, 5, 5];
        const n = 3;

        const result = shift(val, targets, n);

        // Points exactly on target have sign 0, so no shift detected
        expect(result).toEqual(["none", "none", "none", "none", "none"]);
    });

    it("should handle empty arrays", () => {
        const val: number[] = [];
        const targets: number[] = [];
        const n = 5;

        const result = shift(val, targets, n);

        expect(result).toEqual([]);
    });

    it("should detect shift with n=1 (any point different from target)", () => {
        const val = [5, 6, 5, 4, 5];
        const targets = [5, 5, 5, 5, 5];
        const n = 1;

        const result = shift(val, targets, n);

        expect(result).toEqual(["none", "upper", "none", "lower", "none"]);
    });

    it("should detect multiple consecutive shifts", () => {
        const val = [6, 6, 6, 6, 4, 4, 4, 4, 5];
        const targets = [5, 5, 5, 5, 5, 5, 5, 5, 5];
        const n = 3;

        const result = shift(val, targets, n);

        // Upper shift continues through index 3, lower shift starts at index 4
        expect(result).toEqual(["upper", "upper", "upper", "upper", "lower", "lower", "lower", "lower", "none"]);
    });

    it("should backfill all points in a long shift sequence (n=7)", () => {
        const val = [6, 6, 6, 6, 6, 6, 6, 5];
        const targets = [5, 5, 5, 5, 5, 5, 5, 5];
        const n = 7;

        const result = shift(val, targets, n);

        expect(result).toEqual(["upper", "upper", "upper", "upper", "upper", "upper", "upper", "none"]);
    });

    it("should handle alternating values around target (no shift)", () => {
        const val = [6, 4, 6, 4, 6, 4];
        const targets = [5, 5, 5, 5, 5, 5];
        const n = 3;

        const result = shift(val, targets, n);

        expect(result).toEqual(["none", "none", "none", "none", "none", "none"]);
    });

    it("should work with negative values", () => {
        const val = [-2, -2, -2, -2];
        const targets = [-3, -3, -3, -3];
        const n = 3;

        const result = shift(val, targets, n);

        expect(result).toEqual(["upper", "upper", "upper", "upper"]);
    });
});
