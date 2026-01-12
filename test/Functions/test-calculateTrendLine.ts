import calculateTrendLine from "../../src/Functions/calculateTrendLine";

describe("calculateTrendLine", () => {
    it("should return an empty array if input is empty", () => {
        expect(calculateTrendLine([])).toEqual([]);
    });

    it("should calculate trend line for perfectly linear data", () => {
        const values = [1, 2, 3, 4, 5];
        const result = calculateTrendLine(values);
        // y = x. Slope = 1, Intercept = 0.
        // x values are 1-based indices: 1, 2, 3, 4, 5
        // Expected: [1, 2, 3, 4, 5]
        expect(result).toEqual(values);
    });

    it("should calculate trend line for constant data", () => {
        const values = [5, 5, 5];
        const result = calculateTrendLine(values);
        // y = 5. Slope = 0, Intercept = 5.
        const expected = [5, 5, 5];
        expect(result).toEqual(expected);
    });

    it("should calculate trend line for valid data points", () => {
        const values = [1, 3, 2];
        // x: 1, 2, 3
        // y: 1, 3, 2
        // n = 3
        // sumX = 6, sumY = 6
        // sumXY = 1*1 + 2*3 + 3*2 = 1 + 6 + 6 = 13
        // sumX2 = 1 + 4 + 9 = 14
        // slope = (3*13 - 6*6) / (3*14 - 6*6) = (39 - 36) / (42 - 36) = 3 / 6 = 0.5
        // intercept = (6 - 0.5*6) / 3 = 3 / 3 = 1
        // y = 0.5x + 1
        // x=1 => 1.5
        // x=2 => 2.0
        // x=3 => 2.5
        const result = calculateTrendLine(values);
        expect(result[0]).toBeCloseTo(1.5);
        expect(result[1]).toBeCloseTo(2.0);
        expect(result[2]).toBeCloseTo(2.5);
    });

    // For n=1, the denominator is 0, so slope is NaN/Infinity.
    // It's acceptable if it returns NaNs or handles it gracefully by returning the point itself if desired (though current implementation will likely return NaN).
    // Let's verify what it does simply.
    it("should return NaN for single element array due to undefined slope", () => {
         const values = [10];
         const result = calculateTrendLine(values);
         expect(result.length).toBe(1);
         expect(result[0]).toBeNaN();
    });
});
