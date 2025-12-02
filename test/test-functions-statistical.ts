import truncate from "../src/Functions/truncate";
import calculateTrendLine from "../src/Functions/calculateTrendLine";

describe("Utility Functions - Statistical Operations", () => {
  
  describe("truncate() - Value truncation", () => {
    
    describe("Scalar truncation", () => {
      it("should truncate value above upper limit", () => {
        const result = truncate(15, { upper: 10 });
        expect(result).toBe(10);
      });

      it("should truncate value below lower limit", () => {
        const result = truncate(5, { lower: 10 });
        expect(result).toBe(10);
      });

      it("should not modify value within limits", () => {
        const result = truncate(7, { lower: 5, upper: 10 });
        expect(result).toBe(7);
      });

      it("should handle value at exact lower limit", () => {
        const result = truncate(5, { lower: 5, upper: 10 });
        expect(result).toBe(5);
      });

      it("should handle value at exact upper limit", () => {
        const result = truncate(10, { lower: 5, upper: 10 });
        expect(result).toBe(10);
      });

      it("should handle only lower limit", () => {
        const result = truncate(3, { lower: 5 });
        expect(result).toBe(5);
        const result2 = truncate(7, { lower: 5 });
        expect(result2).toBe(7);
      });

      it("should handle only upper limit", () => {
        const result = truncate(12, { upper: 10 });
        expect(result).toBe(10);
        const result2 = truncate(8, { upper: 10 });
        expect(result2).toBe(8);
      });

      it("should handle lower limit of zero", () => {
        const result = truncate(-5, { lower: 0 });
        expect(result).toBe(0);
      });

      it("should handle no limits (returns original value)", () => {
        const result = truncate(7, {});
        expect(result).toBe(7);
      });

      it("should handle negative values", () => {
        const result = truncate(-15, { lower: -10, upper: -5 });
        expect(result).toBe(-10);
      });

      it("should handle decimal values", () => {
        const result = truncate(3.7, { lower: 2.5, upper: 5.5 });
        expect(result).toBeCloseTo(3.7, 10);
        const result2 = truncate(6.2, { lower: 2.5, upper: 5.5 });
        expect(result2).toBeCloseTo(5.5, 10);
      });
    });

    describe("Array truncation (broadcasting)", () => {
      it("should truncate array values above upper limit", () => {
        const result = truncate([5, 15, 8, 20], { upper: 10 });
        expect(result).toEqual([5, 10, 8, 10]);
      });

      it("should truncate array values below lower limit", () => {
        const result = truncate([5, 15, 8, 20], { lower: 10 });
        expect(result).toEqual([10, 15, 10, 20]);
      });

      it("should truncate array with both limits", () => {
        const result = truncate([2, 8, 5, 15, 1, 12], { lower: 3, upper: 10 });
        expect(result).toEqual([3, 8, 5, 10, 3, 10]);
      });

      it("should handle mixed values within and outside limits", () => {
        const result = truncate([1, 5, 10, 15], { lower: 3, upper: 12 });
        expect(result).toEqual([3, 5, 10, 12]);
      });

      it("should handle empty array", () => {
        const result = truncate([], { lower: 0, upper: 10 });
        expect(result).toEqual([]);
      });

      it("should handle array with single element", () => {
        const result = truncate([15], { upper: 10 });
        expect(result).toEqual([10]);
      });

      it("should handle negative values in array", () => {
        const result = truncate([-10, -5, 0, 5, 10], { lower: -3, upper: 3 });
        expect(result).toEqual([-3, -3, 0, 3, 3]);
      });
    });
  });

  describe("calculateTrendLine() - Linear regression", () => {
    
    it("should calculate trend line for ascending values", () => {
      const values = [1, 2, 3, 4, 5];
      const result = calculateTrendLine(values);
      
      expect(result.length).toBe(5);
      // Perfect linear trend: y = x, so trend line should match input
      expect(result[0]).toBeCloseTo(1, 10);
      expect(result[1]).toBeCloseTo(2, 10);
      expect(result[2]).toBeCloseTo(3, 10);
      expect(result[3]).toBeCloseTo(4, 10);
      expect(result[4]).toBeCloseTo(5, 10);
    });

    it("should calculate trend line for descending values", () => {
      const values = [5, 4, 3, 2, 1];
      const result = calculateTrendLine(values);
      
      expect(result.length).toBe(5);
      // Perfect descending trend
      expect(result[0]).toBeCloseTo(5, 10);
      expect(result[1]).toBeCloseTo(4, 10);
      expect(result[2]).toBeCloseTo(3, 10);
      expect(result[3]).toBeCloseTo(2, 10);
      expect(result[4]).toBeCloseTo(1, 10);
    });

    it("should calculate trend line for constant values", () => {
      const values = [5, 5, 5, 5, 5];
      const result = calculateTrendLine(values);
      
      expect(result.length).toBe(5);
      // Constant trend: slope = 0, all values should be 5
      result.forEach(val => {
        expect(val).toBeCloseTo(5, 10);
      });
    });

    it("should calculate trend line for two points", () => {
      const values = [1, 3];
      const result = calculateTrendLine(values);
      
      expect(result.length).toBe(2);
      expect(result[0]).toBeCloseTo(1, 10);
      expect(result[1]).toBeCloseTo(3, 10);
    });

    it("should handle single point", () => {
      const values = [5];
      const result = calculateTrendLine(values);
      
      expect(result.length).toBe(1);
      // With n=1, the slope calculation results in division by zero (0/0 = NaN)
      // This is an edge case in the implementation
      expect(isNaN(result[0])).toBe(true);
    });

    it("should return empty array for empty input", () => {
      const result = calculateTrendLine([]);
      expect(result).toEqual([]);
    });

    it("should calculate trend for noisy data", () => {
      const values = [1, 3, 2, 4, 3, 5, 4, 6, 5, 7];
      const result = calculateTrendLine(values);
      
      expect(result.length).toBe(10);
      // Should show upward trend despite noise
      expect(result[0]).toBeLessThan(result[9]);
      // First value should be close to actual first value
      expect(Math.abs(result[0] - values[0])).toBeLessThan(2);
    });

    it("should calculate correct slope and intercept", () => {
      // Test with known linear relationship: y = 2x + 1
      // For x = 1,2,3,4,5: y = 3,5,7,9,11
      const values = [3, 5, 7, 9, 11];
      const result = calculateTrendLine(values);
      
      expect(result.length).toBe(5);
      // Should match the input perfectly
      for (let i = 0; i < values.length; i++) {
        expect(result[i]).toBeCloseTo(values[i], 10);
      }
    });

    it("should handle negative values", () => {
      const values = [-5, -4, -3, -2, -1];
      const result = calculateTrendLine(values);
      
      expect(result.length).toBe(5);
      for (let i = 0; i < values.length; i++) {
        expect(result[i]).toBeCloseTo(values[i], 10);
      }
    });

    it("should handle decimal values", () => {
      const values = [1.5, 2.7, 3.9, 5.1, 6.3];
      const result = calculateTrendLine(values);
      
      expect(result.length).toBe(5);
      // Should approximate the trend
      expect(result[0]).toBeCloseTo(1.5, 1);
      expect(result[4]).toBeCloseTo(6.3, 1);
    });

    it("should handle alternating pattern (should show flat trend)", () => {
      const values = [1, 2, 1, 2, 1, 2, 1, 2];
      const result = calculateTrendLine(values);
      
      expect(result.length).toBe(8);
      // Trend should be relatively flat (slope near 0)
      const slope = (result[7] - result[0]) / 7;
      expect(Math.abs(slope)).toBeLessThan(0.5);
    });

    it("should calculate trend for larger dataset", () => {
      const values = Array.from({ length: 100 }, (_, i) => i + 1);
      const result = calculateTrendLine(values);
      
      expect(result.length).toBe(100);
      // Perfect linear trend
      expect(result[0]).toBeCloseTo(1, 5);
      expect(result[99]).toBeCloseTo(100, 5);
    });

    it("should handle zero values", () => {
      const values = [0, 1, 2, 3, 4];
      const result = calculateTrendLine(values);
      
      expect(result.length).toBe(5);
      for (let i = 0; i < values.length; i++) {
        expect(result[i]).toBeCloseTo(values[i], 10);
      }
    });

    it("should calculate trend with offset", () => {
      const values = [10, 11, 12, 13, 14];
      const result = calculateTrendLine(values);
      
      expect(result.length).toBe(5);
      for (let i = 0; i < values.length; i++) {
        expect(result[i]).toBeCloseTo(values[i], 10);
      }
    });
  });

  describe("Edge cases and performance", () => {
    it("should handle truncate with extreme values", () => {
      const result = truncate(Number.MAX_VALUE, { upper: 100 });
      expect(result).toBe(100);
      
      const result2 = truncate(Number.MIN_VALUE, { lower: 1 });
      expect(result2).toBe(1);
    });

    it("should handle trend line calculation with large variance", () => {
      const values = [1, 100, 2, 99, 3, 98, 4, 97, 5];
      const result = calculateTrendLine(values);
      
      expect(result.length).toBe(9);
      expect(isFinite(result[0])).toBe(true);
      expect(isFinite(result[8])).toBe(true);
    });

    it("should handle truncate with inverted limits gracefully", () => {
      // This is an edge case - what happens if lower > upper?
      // Based on implementation, both checks are independent
      const result = truncate(5, { lower: 10, upper: 3 });
      // Lower check makes it 10, then upper check makes it 3
      expect(result).toBe(3);
    });
  });
});
