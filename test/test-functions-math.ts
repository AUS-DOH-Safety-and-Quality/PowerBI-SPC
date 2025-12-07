import {
  rep,
  seq,
  diff,
  between,
  first,
  leastIndex,
  isNullOrUndefined,
  isValidNumber
} from "../src/Functions";

describe("Utility Functions - Core Mathematical Operations", () => {
  
  describe("rep() - Array repetition", () => {
    it("should create array with n copies of a number", () => {
      const result = rep(5, 3);
      expect(result).toEqual([5, 5, 5]);
      expect(result.length).toBe(3);
    });

    it("should create array with n copies of a string", () => {
      const result = rep("test", 4);
      expect(result).toEqual(["test", "test", "test", "test"]);
      expect(result.length).toBe(4);
    });

    it("should create empty array when n is 0", () => {
      const result = rep(10, 0);
      expect(result).toEqual([]);
      expect(result.length).toBe(0);
    });

    it("should create array with null values", () => {
      const result = rep(null, 3);
      expect(result).toEqual([null, null, null]);
    });

    it("should create array with object references", () => {
      const obj = { value: 42 };
      const result = rep(obj, 2);
      expect(result.length).toBe(2);
      expect(result[0]).toBe(obj);
      expect(result[1]).toBe(obj);
    });
  });

  describe("seq() - Sequence generation", () => {
    it("should generate ascending sequence", () => {
      const result = seq(1, 5);
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });

    it("should generate sequence starting from 0", () => {
      const result = seq(0, 3);
      expect(result).toEqual([0, 1, 2, 3]);
    });

    it("should generate single element when start equals end", () => {
      const result = seq(5, 5);
      expect(result).toEqual([5]);
    });

    it("should generate sequence with negative numbers", () => {
      const result = seq(-2, 2);
      expect(result).toEqual([-2, -1, 0, 1, 2]);
    });

    it("should handle large ranges", () => {
      const result = seq(1, 100);
      expect(result.length).toBe(100);
      expect(result[0]).toBe(1);
      expect(result[99]).toBe(100);
    });
  });

  describe("diff() - Consecutive differences", () => {
    it("should calculate differences for positive numbers", () => {
      const result = diff([1, 3, 6, 10]);
      expect(result).toEqual([null, 2, 3, 4]);
    });

    it("should calculate differences with negative values", () => {
      const result = diff([5, 3, 1, -1]);
      expect(result).toEqual([null, -2, -2, -2]);
    });

    it("should return array with single null for single element", () => {
      const result = diff([5]);
      expect(result).toEqual([null]);
    });

    it("should return empty array for empty input", () => {
      const result = diff([]);
      expect(result).toEqual([]);
    });

    it("should handle array with two elements", () => {
      const result = diff([10, 15]);
      expect(result).toEqual([null, 5]);
    });

    it("should handle decimal differences", () => {
      const result = diff([1.5, 2.7, 4.2]);
      expect(result[0]).toBe(null);
      expect(result[1]).toBeCloseTo(1.2, 10);
      expect(result[2]).toBeCloseTo(1.5, 10);
    });
  });

  describe("between() - Range checking", () => {
    it("should return true when value is within range", () => {
      expect(between(5, 1, 10)).toBe(true);
      expect(between(1, 1, 10)).toBe(true);
      expect(between(10, 1, 10)).toBe(true);
    });

    it("should return false when value is outside range", () => {
      expect(between(0, 1, 10)).toBe(false);
      expect(between(11, 1, 10)).toBe(false);
    });

    it("should handle null lower bound (no lower limit)", () => {
      expect(between(5, null, 10)).toBe(true);
      expect(between(-100, null, 10)).toBe(true);
      expect(between(15, null, 10)).toBe(false);
    });

    it("should handle null upper bound (no upper limit)", () => {
      expect(between(5, 1, null)).toBe(true);
      expect(between(100, 1, null)).toBe(true);
      expect(between(0, 1, null)).toBe(false);
    });

    it("should handle both bounds null (always true)", () => {
      expect(between(5, null, null)).toBe(true);
      expect(between(-1000, null, null)).toBe(true);
      expect(between(1000, null, null)).toBe(true);
    });

    it("should handle undefined bounds", () => {
      expect(between(5, undefined, 10)).toBe(true);
      expect(between(5, 1, undefined)).toBe(true);
      expect(between(5, undefined, undefined)).toBe(true);
    });

    it("should work with negative ranges", () => {
      expect(between(-5, -10, -1)).toBe(true);
      expect(between(-15, -10, -1)).toBe(false);
      expect(between(0, -10, -1)).toBe(false);
    });
  });

  describe("first() - Array first element", () => {
    it("should return first element of number array", () => {
      expect(first([1, 2, 3])).toBe(1);
    });

    it("should return first element of string array", () => {
      expect(first(["a", "b", "c"])).toBe("a");
    });

    it("should return scalar value unchanged", () => {
      expect(first(42)).toBe(42);
      expect(first("test")).toBe("test");
    });

    it("should handle single element array", () => {
      expect(first([100])).toBe(100);
    });

    it("should handle null values", () => {
      expect(first([null, 1, 2])).toBe(null);
      expect(first(null)).toBe(null);
    });

    it("should handle empty array", () => {
      expect(first([])).toBe(undefined);
    });
  });

  describe("leastIndex() - Minimum value index", () => {
    it("should find index of smallest number", () => {
      const result = leastIndex([5, 2, 8, 1, 9], (a, b) => a - b);
      expect(result).toBe(3);
    });

    it("should return 0 for first minimum if duplicates", () => {
      const result = leastIndex([5, 2, 8, 2, 9], (a, b) => a - b);
      expect(result).toBe(1);
    });

    it("should return -1 for empty array", () => {
      const result = leastIndex([], (a, b) => a - b);
      expect(result).toBe(-1);
    });

    it("should work with single element", () => {
      const result = leastIndex([42], (a, b) => a - b);
      expect(result).toBe(0);
    });

    it("should work with custom comparator (descending)", () => {
      const result = leastIndex([5, 2, 8, 1, 9], (a, b) => b - a);
      expect(result).toBe(4);
    });

    it("should work with objects using custom comparator", () => {
      const arr = [{ val: 5 }, { val: 2 }, { val: 8 }];
      const result = leastIndex(arr, (a, b) => a.val - b.val);
      expect(result).toBe(1);
    });

    it("should handle negative numbers", () => {
      const result = leastIndex([5, -2, 8, -10, 9], (a, b) => a - b);
      expect(result).toBe(3);
    });
  });

  describe("isNullOrUndefined() - Null checking", () => {
    it("should return true for null", () => {
      expect(isNullOrUndefined(null)).toBe(true);
    });

    it("should return true for undefined", () => {
      expect(isNullOrUndefined(undefined)).toBe(true);
    });

    it("should return false for zero", () => {
      expect(isNullOrUndefined(0)).toBe(false);
    });

    it("should return false for empty string", () => {
      expect(isNullOrUndefined("")).toBe(false);
    });

    it("should return false for false", () => {
      expect(isNullOrUndefined(false)).toBe(false);
    });

    it("should return false for NaN", () => {
      expect(isNullOrUndefined(NaN)).toBe(false);
    });

    it("should return false for valid numbers", () => {
      expect(isNullOrUndefined(42)).toBe(false);
      expect(isNullOrUndefined(-1)).toBe(false);
    });

    it("should return false for valid strings", () => {
      expect(isNullOrUndefined("test")).toBe(false);
    });

    it("should return false for objects", () => {
      expect(isNullOrUndefined({})).toBe(false);
      expect(isNullOrUndefined([])).toBe(false);
    });
  });

  describe("isValidNumber() - Number validation", () => {
    it("should return true for valid positive numbers", () => {
      expect(isValidNumber(42)).toBe(true);
      expect(isValidNumber(3.14)).toBe(true);
    });

    it("should return true for zero", () => {
      expect(isValidNumber(0)).toBe(true);
    });

    it("should return true for negative numbers", () => {
      expect(isValidNumber(-42)).toBe(true);
      expect(isValidNumber(-3.14)).toBe(true);
    });

    it("should return false for NaN", () => {
      expect(isValidNumber(NaN)).toBe(false);
    });

    it("should return false for Infinity", () => {
      expect(isValidNumber(Infinity)).toBe(false);
      expect(isValidNumber(-Infinity)).toBe(false);
    });

    it("should return false for null", () => {
      expect(isValidNumber(null)).toBe(false);
    });

    it("should return false for undefined", () => {
      expect(isValidNumber(undefined)).toBe(false);
    });

    it("should return true for very small numbers", () => {
      expect(isValidNumber(0.0000001)).toBe(true);
      expect(isValidNumber(Number.MIN_VALUE)).toBe(true);
    });

    it("should return true for very large numbers", () => {
      expect(isValidNumber(Number.MAX_VALUE)).toBe(true);
    });
  });
});
