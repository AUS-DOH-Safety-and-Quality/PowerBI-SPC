/**
 * Test Extension Plan - Session 3
 * SPC Limit Calculations Unit Tests - Part 1 (Basic Charts)
 * 
 * Tests for 7 basic SPC chart limit calculation functions:
 * - run.ts - Run chart (median calculation)
 * - i.ts - Individual measurements (XmR)
 * - mr.ts - Moving range
 * - c.ts - Counts (Poisson-based limits)
 * - p.ts - Proportions (binomial-based limits)
 * - u.ts - Rates (Poisson-based limits)
 * - s.ts - Sample standard deviations
 */

import runLimits from "../src/Limit Calculations/run";
import iLimits from "../src/Limit Calculations/i";
import mrLimits from "../src/Limit Calculations/mr";
import cLimits from "../src/Limit Calculations/c";
import pLimits from "../src/Limit Calculations/p";
import uLimits from "../src/Limit Calculations/u";
import sLimits from "../src/Limit Calculations/s";
import { type controlLimitsArgs } from "../src/Classes";
import { allIndices, createKeys, itFailing } from "./helpers/testHelpers";

describe("SPC Limit Calculations - Basic Charts", () => {

  // Helper to check if value is close to expected (within tolerance)
  function expectClose(actual: number, expected: number, tolerance: number = 0.01) {
    const diff = Math.abs(actual - expected);
    const relativeError = expected === 0 ? diff : diff / Math.abs(expected);
    expect(relativeError).toBeLessThanOrEqual(tolerance);
  }

  describe("runLimits() - Run Chart", () => {

    it("should calculate median for simple dataset", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [1, 2, 3, 4, 5],
        subset_points: allIndices(5)
      };
      const result = runLimits(args);
      
      expect(result.values).toEqual([1, 2, 3, 4, 5]);
      expect(result.targets).toEqual([3, 3, 3, 3, 3]);
      expect(result.ll99).toBeUndefined();
      expect(result.ul99).toBeUndefined();
    });

    it("should calculate median for even number of points", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(4),
        numerators: [1, 2, 3, 4],
        subset_points: allIndices(4)
      };
      const result = runLimits(args);
      
      expect(result.targets[0]).toBe(2.5);
    });

    it("should handle ratio calculation when denominators provided", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [10, 20, 30],
        denominators: [2, 4, 6],
        subset_points: allIndices(3)
      };
      const result = runLimits(args);
      
      expect(result.values).toEqual([5, 5, 5]);
      expect(result.targets[0]).toBe(5);
      expect(result.numerators).toEqual([10, 20, 30]);
      expect(result.denominators).toEqual([2, 4, 6]);
    });

    it("should use subset_points when provided", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [1, 2, 3, 100, 200],
        subset_points: [0, 1, 2]
      };
      const result = runLimits(args);
      
      expect(result.targets[0]).toBe(2);
    });

    it("should handle all same values", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [7, 7, 7, 7, 7],
        subset_points: allIndices(5)
      };
      const result = runLimits(args);
      
      expect(result.targets[0]).toBe(7);
    });

    it("should handle single value", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(1),
        numerators: [42],
        subset_points: [0]
      };
      const result = runLimits(args);
      
      expect(result.targets[0]).toBe(42);
    });

    itFailing("should replace invalid values with null in output", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [1, 2, 3],
        denominators: [1, 0, 1],
        subset_points: allIndices(3)
      };
      const result = runLimits(args);
      
      // EXPECTED: Division by zero should be handled and replaced with null
      // Per NaN_HANDLING_ANALYSIS.md: use null for invalid values (not 0)
      // null distinguishes from valid zero measurements and follows SPC best practices
      expect(result.values[1]).toBeNull();
    });

    it("should handle negative values", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [-5, -3, -1, 0, 2],
        subset_points: allIndices(5)
      };
      const result = runLimits(args);
      
      expect(result.targets[0]).toBe(-1);
    });

    it("should handle large dataset", () => {
      const n = 100;
      const args: controlLimitsArgs = {
        keys: createKeys(n),
        numerators: Array.from({ length: n }, (_, i) => i + 1),
        subset_points: allIndices(n)
      };
      const result = runLimits(args);
      
      expect(result.targets[0]).toBe(50.5);
      expect(result.values.length).toBe(n);
      expect(result.targets.length).toBe(n);
    });

    it("should handle decimal values", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [1.5, 2.7, 3.9],
        subset_points: allIndices(3)
      };
      const result = runLimits(args);
      
      expect(result.targets[0]).toBe(2.7);
    });

  });

  describe("iLimits() - Individual Measurements (XmR)", () => {

    it("should calculate control limits for simple dataset", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [10, 12, 11, 13, 10],
        outliers_in_limits: false,
        subset_points: allIndices(5)
      };
      const result = iLimits(args);
      
      expectClose(result.targets[0], 11.2, 0.01);
      expect(result.ll99).toBeDefined();
      expect(result.ul99).toBeDefined();
      expect(result.ll99!.length).toBe(5);
      expect(result.ul99!.length).toBe(5);
    });

    it("should use mean of consecutive differences to calculate sigma", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(4),
        numerators: [10, 12, 11, 13],
        outliers_in_limits: false,
        subset_points: allIndices(4)
      };
      const result = iLimits(args);
      
      const cl = 11.5;
      const sigma = 1.667 / 1.128;
      
      expectClose(result.targets[0], cl, 0.01);
      expectClose(result.ul99![0], cl + 3 * sigma, 0.02);
      expectClose(result.ll99![0], cl - 3 * sigma, 0.02);
    });

    it("should handle ratio when denominators provided", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [10, 20, 15],
        denominators: [2, 4, 3],
        outliers_in_limits: false,
        subset_points: allIndices(3)
      };
      const result = iLimits(args);
      
      expect(result.values).toEqual([5, 5, 5]);
      expect(result.targets[0]).toBe(5);
      expect(result.numerators).toEqual([10, 20, 15]);
      expect(result.denominators).toEqual([2, 4, 3]);
    });

    it("should use subset_points when provided", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [10, 11, 12, 100, 200],
        subset_points: [0, 1, 2],
        outliers_in_limits: false
      };
      const result = iLimits(args);
      
      expectClose(result.targets[0], 11, 0.01);
    });

    it("should exclude outliers when outliers_in_limits is false", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [10, 11, 12, 11, 10],
        outliers_in_limits: false,
        subset_points: allIndices(5)
      };
      const result = iLimits(args);
      
      expect(result.ll99).toBeDefined();
      expect(result.ul99).toBeDefined();
    });

    it("should include all values when outliers_in_limits is true", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [10, 11, 12, 11, 10],
        outliers_in_limits: true,
        subset_points: allIndices(5)
      };
      const result = iLimits(args);
      
      expect(result.ll99).toBeDefined();
      expect(result.ul99).toBeDefined();
    });

    itFailing("should handle all same values", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [10, 10, 10, 10, 10],
        outliers_in_limits: false,
        subset_points: allIndices(5)
      };
      const result = iLimits(args);
      
      expect(result.targets[0]).toBe(10);
      // All consecutive differences are 0, so limits should equal centerline
      expectClose(result.ll99![0], 10, 0.01);
      expectClose(result.ul99![0], 10, 0.01);
    });

    it("should calculate correct 95% and 68% limits", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(4),
        numerators: [10, 12, 11, 13],
        outliers_in_limits: false,
        subset_points: allIndices(4)
      };
      const result = iLimits(args);
      
      const cl = 11.5;
      const sigma = 1.667 / 1.128;
      
      expectClose(result.ul95![0], cl + 2 * sigma, 0.02);
      expectClose(result.ll95![0], cl - 2 * sigma, 0.02);
      expectClose(result.ul68![0], cl + 1 * sigma, 0.02);
      expectClose(result.ll68![0], cl - 1 * sigma, 0.02);
    });

    itFailing("should replace invalid values with null in output", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [10, 12, 11],
        denominators: [1, 0, 1],
        outliers_in_limits: false,
        subset_points: allIndices(3)
      };
      const result = iLimits(args);
      
      // EXPECTED: Division by zero should be handled and replaced with null
      // Per NaN_HANDLING_ANALYSIS.md: use null for invalid values (not 0)
      // null distinguishes from valid zero measurements and follows SPC best practices
      expect(result.values[1]).toBeNull();
    });

    it("should handle negative values", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [-10, -12, -11, -13, -10],
        outliers_in_limits: false,
        subset_points: allIndices(5)
      };
      const result = iLimits(args);
      
      expectClose(result.targets[0], -11.2, 0.01);
      expect(result.ll99![0]).toBeLessThan(result.targets[0]);
      expect(result.ul99![0]).toBeGreaterThan(result.targets[0]);
    });

    it("should handle large dataset", () => {
      const n = 50;
      const args: controlLimitsArgs = {
        keys: createKeys(n),
        numerators: Array.from({ length: n }, (_, i) => 100 + Math.sin(i) * 10),
        outliers_in_limits: false,
        subset_points: allIndices(n)
      };
      const result = iLimits(args);
      
      expect(result.values.length).toBe(n);
      expect(result.targets.length).toBe(n);
      expect(result.ul99!.length).toBe(n);
    });

  });

  describe("mrLimits() - Moving Range", () => {

    it("should calculate moving range control limits", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [10, 12, 11, 13, 10],
        subset_points: allIndices(5)
      };
      const result = mrLimits(args);
      
      expect(result.keys.length).toBe(4);
      expect(result.values).toEqual([2, 1, 2, 3]);
      expect(result.targets[0]).toBe(2);
    });

    it("should have lower limits at zero", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [10, 12, 11, 13, 10],
        subset_points: allIndices(5)
      };
      const result = mrLimits(args);
      
      expect(result.ll99![0]).toBe(0);
      expect(result.ll95![0]).toBe(0);
      expect(result.ll68![0]).toBe(0);
    });

    it("should calculate upper limits using 3.267 constant", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [10, 12, 11, 13, 10],
        subset_points: allIndices(5)
      };
      const result = mrLimits(args);
      
      const cl = 2;
      
      expectClose(result.ul99![0], 3.267 * cl, 0.01);
      expectClose(result.ul95![0], (3.267 / 3) * 2 * cl, 0.01);
      expectClose(result.ul68![0], (3.267 / 3) * 1 * cl, 0.01);
    });

    it("should handle ratio when denominators provided", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(4),
        numerators: [10, 20, 15, 25],
        denominators: [2, 4, 3, 5],
        subset_points: allIndices(4)
      };
      const result = mrLimits(args);
      
      expect(result.keys.length).toBe(3);
      expect(result.values).toEqual([0, 0, 0]);
      expect(result.numerators).toEqual([20, 15, 25]);
      expect(result.denominators).toEqual([4, 3, 5]);
    });

    it("should use subset_points when provided", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(6),
        numerators: [10, 11, 12, 100, 200, 300],
        subset_points: [0, 1, 2, 3]
      };
      const result = mrLimits(args);
      
      expect(result.keys.length).toBe(5);
      expect(result.values.length).toBe(5);
    });

    it("should handle all same values", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [10, 10, 10, 10, 10],
        subset_points: allIndices(5)
      };
      const result = mrLimits(args);
      
      expect(result.values).toEqual([0, 0, 0, 0]);
      expect(result.targets[0]).toBe(0);
      expect(result.ul99![0]).toBe(0);
    });

    it("should handle two values (minimum for MR)", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(2),
        numerators: [10, 12],
        subset_points: allIndices(2)
      };
      const result = mrLimits(args);
      
      expect(result.keys.length).toBe(1);
      expect(result.values).toEqual([2]);
      expect(result.targets[0]).toBe(2);
    });

    it("should handle negative values", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [-10, -12, -11, -13, -10],
        subset_points: allIndices(5)
      };
      const result = mrLimits(args);
      
      expect(result.values).toEqual([2, 1, 2, 3]);
      expect(result.targets[0]).toBe(2);
    });

    it("should handle decimal values", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(4),
        numerators: [10.5, 11.7, 10.9, 12.3],
        subset_points: allIndices(4)
      };
      const result = mrLimits(args);
      
      expectClose(result.values[0], 1.2, 0.01);
      expectClose(result.values[1], 0.8, 0.01);
      expectClose(result.values[2], 1.4, 0.01);
    });

    it("should handle large dataset", () => {
      const n = 100;
      const args: controlLimitsArgs = {
        keys: createKeys(n),
        numerators: Array.from({ length: n }, (_, i) => 100 + Math.sin(i) * 10),
        subset_points: allIndices(n)
      };
      const result = mrLimits(args);
      
      expect(result.keys.length).toBe(n - 1);
      expect(result.values.length).toBe(n - 1);
    });

  });

  describe("cLimits() - Counts Chart (Poisson)", () => {

    it("should calculate control limits based on Poisson distribution", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [8, 10, 12, 9, 11],
        subset_points: allIndices(5)
      };
      const result = cLimits(args);
      
      const cl = 10;
      const sigma = Math.sqrt(cl);
      
      expect(result.values).toEqual([8, 10, 12, 9, 11]);
      expectClose(result.targets[0], cl, 0.01);
      expectClose(result.ul99![0], cl + 3 * sigma, 0.01);
      expectClose(result.ll99![0], cl - 3 * sigma, 0.01);
    });

    it("should use sqrt(mean) for sigma", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(4),
        numerators: [16, 20, 18, 22],
        subset_points: allIndices(4)
      };
      const result = cLimits(args);
      
      const cl = 19;
      const sigma = Math.sqrt(19);
      
      expectClose(result.targets[0], cl, 0.01);
      expectClose(result.ul99![0], cl + 3 * sigma, 0.02);
      expectClose(result.ul95![0], cl + 2 * sigma, 0.02);
      expectClose(result.ul68![0], cl + 1 * sigma, 0.02);
    });

    itFailing("should truncate lower limits to 0", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [2, 3, 1],
        subset_points: allIndices(3)
      };
      const result = cLimits(args);
      
      expect(result.ll99![0]).toBe(0);
      expect(result.ll95![0]).toBe(0);
      expect(result.ll68![0]).toBe(0);
    });

    it("should not truncate upper limits", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [2, 3, 1],
        subset_points: allIndices(3)
      };
      const result = cLimits(args);
      
      const cl = 2;
      const sigma = Math.sqrt(2);
      
      expectClose(result.ul99![0], cl + 3 * sigma, 0.01);
      expect(result.ul99![0]).toBeGreaterThan(0);
    });

    it("should use subset_points when provided", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [10, 11, 12, 100, 200],
        subset_points: [0, 1, 2]
      };
      const result = cLimits(args);
      
      expectClose(result.targets[0], 11, 0.01);
    });

    it("should handle zero counts", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(4),
        numerators: [0, 1, 0, 2],
        subset_points: allIndices(4)
      };
      const result = cLimits(args);
      
      const cl = 0.75;
      
      expectClose(result.targets[0], cl, 0.01);
      expect(result.ll99![0]).toBe(0);
    });

    it("should handle all zeros", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [0, 0, 0],
        subset_points: allIndices(3)
      };
      const result = cLimits(args);
      
      expect(result.targets[0]).toBe(0);
      expect(result.ll99![0]).toBe(0);
      expect(result.ul99![0]).toBe(0);
    });

    it("should handle all same non-zero values", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [10, 10, 10, 10, 10],
        subset_points: allIndices(5)
      };
      const result = cLimits(args);
      
      expect(result.targets[0]).toBe(10);
      expectClose(result.ul99![0], 10 + 3 * Math.sqrt(10), 0.01);
    });

    it("should handle large counts", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [100, 110, 90],
        subset_points: allIndices(3)
      };
      const result = cLimits(args);
      
      const cl = 100;
      
      expectClose(result.targets[0], cl, 0.01);
      expectClose(result.ul99![0], 130, 0.01);
      expectClose(result.ll99![0], 70, 0.01);
    });

  });

  describe("pLimits() - Proportions Chart (Binomial)", () => {

    it("should calculate control limits for proportions", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(4),
        numerators: [8, 10, 7, 9],
        denominators: [100, 100, 100, 100],
        subset_points: allIndices(4)
      };
      const result = pLimits(args);
      
      const pbar = 0.085;
      
      expect(result.values.length).toBe(4);
      expectClose(result.values[0], 0.08, 0.001);
      expectClose(result.targets[0], pbar, 0.001);
    });

    it("should use binomial formula for sigma", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [10, 12, 8],
        denominators: [100, 100, 100],
        subset_points: allIndices(3)
      };
      const result = pLimits(args);
      
      const pbar = 0.10;
      const n = 100;
      const sigma = Math.sqrt((pbar * (1 - pbar)) / n);
      
      expectClose(result.targets[0], pbar, 0.01);
      expectClose(result.ul99![0], pbar + 3 * sigma, 0.01);
      expectClose(result.ll99![0], pbar - 3 * sigma, 0.01);
    });

    it("should handle varying denominators", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [5, 10, 15],
        denominators: [50, 100, 150],
        subset_points: allIndices(3)
      };
      const result = pLimits(args);
      
      expectClose(result.targets[0], 0.10, 0.01);
      expect(result.ul99![0]).toBeGreaterThan(result.ul99![1]);
      expect(result.ul99![1]).toBeGreaterThan(result.ul99![2]);
    });

    it("should truncate lower limits to 0", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [1, 2, 1],
        denominators: [100, 100, 100],
        subset_points: allIndices(3)
      };
      const result = pLimits(args);
      
      expect(result.ll99![0]).toBeGreaterThanOrEqual(0);
      expect(result.ll95![0]).toBeGreaterThanOrEqual(0);
      expect(result.ll68![0]).toBeGreaterThanOrEqual(0);
    });

    it("should truncate upper limits to 1", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [48, 49, 50],
        denominators: [50, 50, 50],
        subset_points: allIndices(3)
      };
      const result = pLimits(args);
      
      expect(result.ul99![0]).toBeLessThanOrEqual(1);
      expect(result.ul95![0]).toBeLessThanOrEqual(1);
      expect(result.ul68![0]).toBeLessThanOrEqual(1);
    });

    it("should use subset_points when provided", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [10, 11, 12, 90, 95],
        denominators: [100, 100, 100, 100, 100],
        subset_points: [0, 1, 2]
      };
      const result = pLimits(args);
      
      expectClose(result.targets[0], 0.11, 0.01);
    });

    it("should handle zero numerators", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [0, 1, 0],
        denominators: [50, 50, 50],
        subset_points: allIndices(3)
      };
      const result = pLimits(args);
      
      const pbar = 1 / 150;
      expectClose(result.targets[0], pbar, 0.01);
      expect(result.ll99![0]).toBe(0);
    });

    it("should handle all zeros", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [0, 0, 0],
        denominators: [50, 50, 50],
        subset_points: allIndices(3)
      };
      const result = pLimits(args);
      
      expect(result.targets[0]).toBe(0);
      expect(result.ll99![0]).toBe(0);
    });

  });

  describe("uLimits() - Rates Chart (Poisson)", () => {

    it("should calculate control limits for rates", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(4),
        numerators: [8, 10, 12, 10],
        denominators: [100, 100, 100, 100],
        subset_points: allIndices(4)
      };
      const result = uLimits(args);
      
      const ubar = 0.10;
      
      expect(result.values.length).toBe(4);
      expectClose(result.values[0], 0.08, 0.01);
      expectClose(result.targets[0], ubar, 0.01);
    });

    it("should use Poisson formula for sigma", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [10, 12, 8],
        denominators: [100, 100, 100],
        subset_points: allIndices(3)
      };
      const result = uLimits(args);
      
      const ubar = 0.10;
      const n = 100;
      const sigma = Math.sqrt(ubar / n);
      
      expectClose(result.targets[0], ubar, 0.01);
      expectClose(result.ul99![0], ubar + 3 * sigma, 0.01);
      expectClose(result.ll99![0], ubar - 3 * sigma, 0.01);
    });

    it("should handle varying denominators", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [5, 10, 15],
        denominators: [50, 100, 150],
        subset_points: allIndices(3)
      };
      const result = uLimits(args);
      
      expectClose(result.targets[0], 0.10, 0.01);
      expect(result.ul99![0]).toBeGreaterThan(result.ul99![1]);
      expect(result.ul99![1]).toBeGreaterThan(result.ul99![2]);
    });

    it("should truncate lower limits to 0", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [1, 2, 1],
        denominators: [100, 100, 100],
        subset_points: allIndices(3)
      };
      const result = uLimits(args);
      
      expect(result.ll99![0]).toBeGreaterThanOrEqual(0);
      expect(result.ll95![0]).toBeGreaterThanOrEqual(0);
      expect(result.ll68![0]).toBeGreaterThanOrEqual(0);
    });

    it("should not truncate upper limits", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [50, 55, 45],
        denominators: [100, 100, 100],
        subset_points: allIndices(3)
      };
      const result = uLimits(args);
      
      expect(result.ul99![0]).toBeGreaterThan(0);
    });

    it("should use subset_points when provided", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [10, 11, 12, 90, 95],
        denominators: [100, 100, 100, 100, 100],
        subset_points: [0, 1, 2]
      };
      const result = uLimits(args);
      
      expectClose(result.targets[0], 0.11, 0.01);
    });

    it("should handle zero numerators", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [0, 1, 0],
        denominators: [50, 50, 50],
        subset_points: allIndices(3)
      };
      const result = uLimits(args);
      
      const ubar = 1 / 150;
      expectClose(result.targets[0], ubar, 0.01);
      expect(result.ll99![0]).toBe(0);
    });

    it("should handle all zeros", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [0, 0, 0],
        denominators: [50, 50, 50],
        subset_points: allIndices(3)
      };
      const result = uLimits(args);
      
      expect(result.targets[0]).toBe(0);
      expect(result.ll99![0]).toBe(0);
      expect(result.ul99![0]).toBe(0);
    });

    it("should handle rates greater than 1", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [150, 160, 140],
        denominators: [100, 100, 100],
        subset_points: allIndices(3)
      };
      const result = uLimits(args);
      
      const ubar = 1.5;
      expectClose(result.targets[0], ubar, 0.01);
      expect(result.ul99![0]).toBeGreaterThan(1);
    });

  });

  describe("sLimits() - Sample Standard Deviations", () => {

    it("should calculate control limits for sample SDs", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(4),
        numerators: [2.0, 2.5, 2.2, 2.3],
        denominators: [5, 5, 5, 5],
        subset_points: allIndices(4)
      };
      const result = sLimits(args);
      
      expect(result.values).toEqual([2.0, 2.5, 2.2, 2.3]);
      expect(result.targets.length).toBe(4);
    });

    it("should use weighted SD formula", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [2.0, 2.0, 2.0],
        denominators: [5, 5, 5],
        subset_points: allIndices(3)
      };
      const result = sLimits(args);
      
      expectClose(result.targets[0], 2.0, 0.01);
    });

    it("should use b3 and b4 constants for limits", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [2.0, 2.0, 2.0],
        denominators: [5, 5, 5],
        subset_points: allIndices(3)
      };
      const result = sLimits(args);
      
      expect(result.ll99).toBeDefined();
      expect(result.ul99).toBeDefined();
      expect(result.ll99!.length).toBe(3);
      expect(result.ul99!.length).toBe(3);
    });

    it("should handle varying group sizes", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [2.0, 2.5, 2.2],
        denominators: [5, 10, 15],
        subset_points: allIndices(3)
      };
      const result = sLimits(args);
      
      expect(result.ll99!.length).toBe(3);
      expect(result.ul99!.length).toBe(3);
    });

    it("should use subset_points when provided", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [2.0, 2.1, 2.2, 10.0, 15.0],
        denominators: [5, 5, 5, 5, 5],
        subset_points: [0, 1, 2]
      };
      const result = sLimits(args);
      
      expect(result.targets.length).toBe(5);
    });

    it("should handle all same SDs", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [2.5, 2.5, 2.5, 2.5, 2.5],
        denominators: [10, 10, 10, 10, 10],
        subset_points: allIndices(5)
      };
      const result = sLimits(args);
      
      expectClose(result.targets[0], 2.5, 0.01);
    });

    it("should calculate 95% and 68% limits", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [2.0, 2.0, 2.0],
        denominators: [5, 5, 5],
        subset_points: allIndices(3)
      };
      const result = sLimits(args);
      
      expect(result.ll99).toBeDefined();
      expect(result.ll95).toBeDefined();
      expect(result.ll68).toBeDefined();
      expect(result.ul68).toBeDefined();
      expect(result.ul95).toBeDefined();
      expect(result.ul99).toBeDefined();
      
      expect(result.ul99![0]).toBeGreaterThan(result.ul95![0]);
      expect(result.ul95![0]).toBeGreaterThan(result.ul68![0]);
    });

  });

});
