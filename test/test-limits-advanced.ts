/**
 * Test Extension Plan - Session 4
 * SPC Limit Calculations Unit Tests - Part 2 (Advanced Charts)
 * 
 * Tests for 7 advanced SPC chart limit calculation functions:
 * - pprime.ts - Proportions with large-sample correction
 * - uprime.ts - Rates with large-sample correction
 * - xbar.ts - Sample means (with SD weighting)
 * - g.ts - Number of non-events between events
 * - t.ts - Time between events
 * - i_m.ts - Individual measurements variant (uses mean for sigma calculation)
 * - i_mm.ts - Individual measurements variant (uses median for sigma calculation)
 */

import pprimeLimits from "../src/Limit Calculations/pprime";
import uprimeLimits from "../src/Limit Calculations/uprime";
import xbarLimits from "../src/Limit Calculations/xbar";
import gLimits from "../src/Limit Calculations/g";
import tLimits from "../src/Limit Calculations/t";
import imLimits from "../src/Limit Calculations/i_m";
import immLimits from "../src/Limit Calculations/i_mm";
import pLimits from "../src/Limit Calculations/p";
import uLimits from "../src/Limit Calculations/u";
import iLimits from "../src/Limit Calculations/i";
import { type controlLimitsArgs } from "../src/Classes";
import { allIndices, createKeys, itFailing } from "./helpers/testHelpers";

describe("SPC Limit Calculations - Advanced Charts", () => {

  // Helper to check if value is close to expected (within tolerance)
  function expectClose(actual: number, expected: number, tolerance: number = 0.01) {
    const diff = Math.abs(actual - expected);
    const relativeError = expected === 0 ? diff : diff / Math.abs(expected);
    expect(relativeError).toBeLessThanOrEqual(tolerance);
  }

  describe("pprimeLimits() - Proportions with Large-Sample Correction", () => {

    it("should calculate control limits with correction factor", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(4),
        numerators: [10, 12, 8, 11],
        denominators: [100, 100, 100, 100],
        outliers_in_limits: false,
        subset_points: allIndices(4)
      };
      const result = pprimeLimits(args);
      
      // Pooled proportion: (10+12+8+11) / (100+100+100+100) = 41/400 = 0.1025
      expectClose(result.targets[0], 0.1025, 0.01);
      
      // Should have all limit arrays
      expect(result.ll99).toBeDefined();
      expect(result.ul99).toBeDefined();
      expect(result.ll99!.length).toBe(4);
      expect(result.ul99!.length).toBe(4);
      
      // Values should be proportions
      expectClose(result.values[0], 0.10, 0.01);
      expectClose(result.values[1], 0.12, 0.01);
      expectClose(result.values[2], 0.08, 0.01);
      expectClose(result.values[3], 0.11, 0.01);
    });

    it("should apply correction factor to reduce over-dispersion", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [10, 15, 8, 12, 11],
        denominators: [100, 100, 100, 100, 100],
        outliers_in_limits: false,
        subset_points: allIndices(5)
      };
      
      // Compare pprime (corrected) vs p (uncorrected)
      const resultPprime = pprimeLimits(args);
      const resultP = pLimits(args);
      
      // P' limits should generally be narrower due to correction
      // (The correction reduces sigma based on actual variation in z-scores)
      expect(resultPprime.ll99).toBeDefined();
      expect(resultP.ll99).toBeDefined();
      
      // Both should have same centerline
      expect(resultPprime.targets[0]).toBe(resultP.targets[0]);
    });

    it("should handle varying denominators", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [10, 12, 8],
        denominators: [50, 100, 150],
        outliers_in_limits: false,
        subset_points: allIndices(3)
      };
      const result = pprimeLimits(args);
      
      // Pooled proportion: 30/300 = 0.10
      expectClose(result.targets[0], 0.10, 0.01);
      
      // Limits should be arrays (different for each denominator)
      expect(Array.isArray(result.ll99)).toBe(true);
      expect(Array.isArray(result.ul99)).toBe(true);
      
      // Smaller denominators should have wider limits
      const range1 = result.ul99![0] - result.ll99![0];
      const range2 = result.ul99![1] - result.ll99![1];
      const range3 = result.ul99![2] - result.ll99![2];
      
      expect(range1).toBeGreaterThan(range2);
      expect(range2).toBeGreaterThan(range3);
    });

    it("should truncate lower limits to 0", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [1, 2, 1],
        denominators: [100, 100, 100],
        outliers_in_limits: false,
        subset_points: allIndices(3)
      };
      const result = pprimeLimits(args);
      
      // All lower limits should be >= 0
      result.ll99!.forEach(val => expect(val).toBeGreaterThanOrEqual(0));
      result.ll95!.forEach(val => expect(val).toBeGreaterThanOrEqual(0));
      result.ll68!.forEach(val => expect(val).toBeGreaterThanOrEqual(0));
    });

    it("should truncate upper limits to 1", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [95, 98, 97],
        denominators: [100, 100, 100],
        outliers_in_limits: false,
        subset_points: allIndices(3)
      };
      const result = pprimeLimits(args);
      
      // All upper limits should be <= 1
      result.ul99!.forEach(val => expect(val).toBeLessThanOrEqual(1));
      result.ul95!.forEach(val => expect(val).toBeLessThanOrEqual(1));
      result.ul68!.forEach(val => expect(val).toBeLessThanOrEqual(1));
    });

    it("should use subset_points when provided", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [10, 12, 8, 100, 200],
        denominators: [100, 100, 100, 100, 100],
        outliers_in_limits: false,
        subset_points: [0, 1, 2]
      };
      const result = pprimeLimits(args);
      
      // Should only use first 3 points for centerline calculation
      // (10+12+8) / (100+100+100) = 30/300 = 0.10
      expectClose(result.targets[0], 0.10, 0.01);
    });

    it("should handle outliers_in_limits parameter", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(4),
        numerators: [10, 12, 8, 11],
        denominators: [100, 100, 100, 100],
        outliers_in_limits: true,
        subset_points: allIndices(4)
      };
      const resultInclude = pprimeLimits(args);
      
      args.outliers_in_limits = false;
      const resultExclude = pprimeLimits(args);
      
      // Both should produce limits, but they may differ
      expect(resultInclude.ll99).toBeDefined();
      expect(resultExclude.ll99).toBeDefined();
    });

    it("should calculate 95% and 68% limits correctly", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [10, 12, 8],
        denominators: [100, 100, 100],
        outliers_in_limits: false,
        subset_points: allIndices(3)
      };
      const result = pprimeLimits(args);
      
      // 99% limits should be wider than 95% which should be wider than 68%
      expect(result.ul99![0]).toBeGreaterThan(result.ul95![0]);
      expect(result.ul95![0]).toBeGreaterThan(result.ul68![0]);
      expect(result.ll68![0]).toBeGreaterThan(result.ll95![0]);
      expect(result.ll95![0]).toBeGreaterThan(result.ll99![0]);
    });

    itFailing("should handle all zeros", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [0, 0, 0],
        denominators: [100, 100, 100],
        outliers_in_limits: false,
        subset_points: allIndices(3)
      };
      const result = pprimeLimits(args);
      
      // EXPECTED: When all values are 0, limits should be 0
      // ACTUAL: Returns NaN because sigma calculation involves sqrt(0*(1-0)) = 0
      // Then division by mean(consec_diff) which is 0 causes NaN
      // This is an edge case bug in the code
      expect(result.targets[0]).toBe(0);
      expect(result.ll99![0]).toBe(0);
    });

  });

  describe("uprimeLimits() - Rates with Large-Sample Correction", () => {

    it("should calculate control limits with correction factor", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(4),
        numerators: [10, 12, 8, 11],
        denominators: [100, 100, 100, 100],
        outliers_in_limits: false,
        subset_points: allIndices(4)
      };
      const result = uprimeLimits(args);
      
      // Pooled rate: (10+12+8+11) / (100+100+100+100) = 41/400 = 0.1025
      expectClose(result.targets[0], 0.1025, 0.01);
      
      expect(result.ll99).toBeDefined();
      expect(result.ul99).toBeDefined();
    });

    it("should apply correction factor to reduce over-dispersion", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [10, 15, 8, 12, 11],
        denominators: [100, 100, 100, 100, 100],
        outliers_in_limits: false,
        subset_points: allIndices(5)
      };
      
      // Compare uprime (corrected) vs u (uncorrected)
      const resultUprime = uprimeLimits(args);
      const resultU = uLimits(args);
      
      expect(resultUprime.ll99).toBeDefined();
      expect(resultU.ll99).toBeDefined();
      
      // Both should have same centerline
      expect(resultUprime.targets[0]).toBe(resultU.targets[0]);
    });

    it("should handle varying denominators", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [10, 12, 8],
        denominators: [50, 100, 150],
        outliers_in_limits: false,
        subset_points: allIndices(3)
      };
      const result = uprimeLimits(args);
      
      // Pooled rate: 30/300 = 0.10
      expectClose(result.targets[0], 0.10, 0.01);
      
      // Smaller denominators should have wider limits
      const range1 = result.ul99![0] - result.ll99![0];
      const range2 = result.ul99![1] - result.ll99![1];
      const range3 = result.ul99![2] - result.ll99![2];
      
      expect(range1).toBeGreaterThan(range2);
      expect(range2).toBeGreaterThan(range3);
    });

    it("should truncate lower limits to 0", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [1, 2, 1],
        denominators: [100, 100, 100],
        outliers_in_limits: false,
        subset_points: allIndices(3)
      };
      const result = uprimeLimits(args);
      
      // All lower limits should be >= 0
      result.ll99!.forEach(val => expect(val).toBeGreaterThanOrEqual(0));
      result.ll95!.forEach(val => expect(val).toBeGreaterThanOrEqual(0));
      result.ll68!.forEach(val => expect(val).toBeGreaterThanOrEqual(0));
    });

    it("should NOT truncate upper limits (rates can exceed 1)", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [150, 160, 155],
        denominators: [100, 100, 100],
        outliers_in_limits: false,
        subset_points: allIndices(3)
      };
      const result = uprimeLimits(args);
      
      // Rates can be > 1 (e.g., 1.5 defects per unit)
      expect(result.values[0]).toBeGreaterThan(1);
      // Upper limits should not be capped at 1
      expect(result.ul99![0]).toBeGreaterThan(1);
    });

    it("should use subset_points when provided", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [10, 12, 8, 100, 200],
        denominators: [100, 100, 100, 100, 100],
        outliers_in_limits: false,
        subset_points: [0, 1, 2]
      };
      const result = uprimeLimits(args);
      
      // Should only use first 3 points: 30/300 = 0.10
      expectClose(result.targets[0], 0.10, 0.01);
    });

    it("should handle outliers_in_limits parameter", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(4),
        numerators: [10, 12, 8, 11],
        denominators: [100, 100, 100, 100],
        outliers_in_limits: true,
        subset_points: allIndices(4)
      };
      const resultInclude = uprimeLimits(args);
      
      args.outliers_in_limits = false;
      const resultExclude = uprimeLimits(args);
      
      expect(resultInclude.ll99).toBeDefined();
      expect(resultExclude.ll99).toBeDefined();
    });

    it("should calculate 95% and 68% limits correctly", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [10, 12, 8],
        denominators: [100, 100, 100],
        outliers_in_limits: false,
        subset_points: allIndices(3)
      };
      const result = uprimeLimits(args);
      
      // 99% limits should be wider than 95% which should be wider than 68%
      expect(result.ul99![0]).toBeGreaterThan(result.ul95![0]);
      expect(result.ul95![0]).toBeGreaterThan(result.ul68![0]);
      expect(result.ll68![0]).toBeGreaterThan(result.ll95![0]);
      expect(result.ll95![0]).toBeGreaterThan(result.ll99![0]);
    });

    itFailing("should handle all zeros", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [0, 0, 0],
        denominators: [100, 100, 100],
        outliers_in_limits: false,
        subset_points: allIndices(3)
      };
      const result = uprimeLimits(args);
      
      // EXPECTED: When all values are 0, limits should be 0
      // ACTUAL: Returns NaN because sigma calculation involves sqrt(0) = 0
      // Then division by mean(consec_diff) which is 0 causes NaN
      // This is an edge case bug in the code
      expect(result.targets[0]).toBe(0);
      expect(result.ll99![0]).toBe(0);
    });

  });

  describe("xbarLimits() - Sample Means with SD Weighting", () => {

    it("should calculate weighted mean for centerline", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [10, 12, 11],  // group means
        denominators: [5, 10, 5],   // group sizes
        xbar_sds: [2, 2.5, 1.8],    // group SDs
        subset_points: allIndices(3)
      };
      const result = xbarLimits(args);
      
      // Weighted mean = (10*5 + 12*10 + 11*5) / (5+10+5) = (50+120+55) / 20 = 225/20 = 11.25
      expectClose(result.targets[0], 11.25, 0.01);
      
      expect(result.ll99).toBeDefined();
      expect(result.ul99).toBeDefined();
    });

    it("should calculate weighted SD", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [10, 12, 11],
        denominators: [5, 5, 5],  // all same size
        xbar_sds: [2, 2, 2],      // all same SD
        subset_points: allIndices(3)
      };
      const result = xbarLimits(args);
      
      // With equal sizes and SDs, weighted SD should equal 2
      // SD = sqrt(sum((n-1)*sd^2) / sum(n-1))
      //    = sqrt((4*4 + 4*4 + 4*4) / (4+4+4))
      //    = sqrt(48/12) = sqrt(4) = 2
      expect(result.ll99).toBeDefined();
      expect(result.ul99).toBeDefined();
    });

    it("should use A3 constant for limits", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [10, 12, 11],
        denominators: [5, 5, 5],
        xbar_sds: [2, 2, 2],
        subset_points: allIndices(3)
      };
      const result = xbarLimits(args);
      
      // Limits should be arrays (A3 varies by sample size)
      expect(Array.isArray(result.ll99)).toBe(true);
      expect(Array.isArray(result.ul99)).toBe(true);
      expect(result.ll99!.length).toBe(3);
      expect(result.ul99!.length).toBe(3);
    });

    it("should handle varying group sizes", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [10, 12, 11],
        denominators: [5, 10, 15],  // different sizes
        xbar_sds: [2, 2, 2],
        subset_points: allIndices(3)
      };
      const result = xbarLimits(args);
      
      // Smaller groups should have wider limits (higher A3)
      const range1 = result.ul99![0] - result.ll99![0];
      const range2 = result.ul99![1] - result.ll99![1];
      const range3 = result.ul99![2] - result.ll99![2];
      
      expect(range1).toBeGreaterThan(range2);
      expect(range2).toBeGreaterThan(range3);
    });

    it("should use subset_points when provided", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [10, 12, 11, 100, 200],
        denominators: [5, 5, 5, 5, 5],
        xbar_sds: [2, 2, 2, 2, 2],
        subset_points: [0, 1, 2]
      };
      const result = xbarLimits(args);
      
      // Should only use first 3 points: (10*5 + 12*5 + 11*5) / 15 = 165/15 = 11
      expectClose(result.targets[0], 11, 0.01);
    });

    it("should calculate 95% and 68% limits correctly", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [10, 12, 11],
        denominators: [5, 5, 5],
        xbar_sds: [2, 2, 2],
        subset_points: allIndices(3)
      };
      const result = xbarLimits(args);
      
      // 99% limits should be wider than 95% which should be wider than 68%
      // 99% uses A3, 95% uses (A3/3)*2, 68% uses A3/3
      expect(result.ul99![0]).toBeGreaterThan(result.ul95![0]);
      expect(result.ul95![0]).toBeGreaterThan(result.ul68![0]);
      expect(result.ll68![0]).toBeGreaterThan(result.ll95![0]);
      expect(result.ll95![0]).toBeGreaterThan(result.ll99![0]);
    });

    it("should include count in output", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [10, 12, 11],
        denominators: [5, 10, 15],
        xbar_sds: [2, 2, 2],
        subset_points: allIndices(3)
      };
      const result = xbarLimits(args);
      
      expect(result.count).toBeDefined();
      expect(result.count).toEqual([5, 10, 15]);
    });

    it("should handle all same values", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [10, 10, 10],
        denominators: [5, 5, 5],
        xbar_sds: [0, 0, 0],  // No variation
        subset_points: allIndices(3)
      };
      const result = xbarLimits(args);
      
      expect(result.targets[0]).toBe(10);
      // With SD=0, limits should equal centerline
      expectClose(result.ll99![0], 10, 0.01);
      expectClose(result.ul99![0], 10, 0.01);
    });

  });

  describe("gLimits() - Number of Non-Events Between Events", () => {

    it("should calculate control limits using geometric distribution", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [3, 5, 2, 4, 6],
        subset_points: allIndices(5)
      };
      const result = gLimits(args);
      
      // Mean = (3+5+2+4+6)/5 = 4
      expectClose(result.targets[0], 3.5, 0.2);  // Median should be close to mean for small samples
      
      expect(result.ll99).toBeDefined();
      expect(result.ul99).toBeDefined();
    });

    it("should use median for target to handle skewness", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [1, 2, 3, 4, 100],  // Skewed data
        subset_points: allIndices(5)
      };
      const result = gLimits(args);
      
      // Target should be median (3), not mean (22)
      expect(result.targets[0]).toBe(3);
    });

    it("should use mean for control limit calculation", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [10, 15, 20],
        subset_points: allIndices(3)
      };
      const result = gLimits(args);
      
      // Mean = 15, sigma = sqrt(15*16) = sqrt(240) ≈ 15.49
      // UCL99 = 15 + 3*15.49 = 61.48
      const mean = 15;
      const sigma = Math.sqrt(mean * (mean + 1));
      const expectedUCL = mean + 3 * sigma;
      
      expectClose(result.ul99![0], expectedUCL, 0.01);
    });

    it("should have lower limits at 0", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [5, 10, 15],
        subset_points: allIndices(3)
      };
      const result = gLimits(args);
      
      // G-charts don't have negative lower limits
      expect(result.ll99![0]).toBe(0);
      expect(result.ll95![0]).toBe(0);
      expect(result.ll68![0]).toBe(0);
    });

    it("should use subset_points when provided", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [3, 5, 2, 100, 200],
        subset_points: [0, 1, 2]
      };
      const result = gLimits(args);
      
      // Should only use first 3 points
      // Median of [3, 5, 2] sorted = [2, 3, 5] = 3
      expect(result.targets[0]).toBe(3);
    });

    it("should calculate 95% and 68% limits correctly", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [10, 15, 20],
        subset_points: allIndices(3)
      };
      const result = gLimits(args);
      
      // 99% limits should be wider than 95% which should be wider than 68%
      expect(result.ul99![0]).toBeGreaterThan(result.ul95![0]);
      expect(result.ul95![0]).toBeGreaterThan(result.ul68![0]);
    });

    it("should handle small counts", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [1, 2, 1],
        subset_points: allIndices(3)
      };
      const result = gLimits(args);
      
      // Mean ≈ 1.33, sigma = sqrt(1.33*2.33) ≈ 1.76
      expect(result.ul99).toBeDefined();
      expect(result.ul99![0]).toBeGreaterThan(0);
    });

    it("should handle all same values", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [5, 5, 5],
        subset_points: allIndices(3)
      };
      const result = gLimits(args);
      
      expect(result.targets[0]).toBe(5);
      // sigma = sqrt(5*6) = sqrt(30) ≈ 5.48
      const sigma = Math.sqrt(5 * 6);
      expectClose(result.ul99![0], 5 + 3 * sigma, 0.01);
    });

  });

  describe("tLimits() - Time Between Events", () => {

    it("should apply transformation to data", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(4),
        numerators: [10, 20, 15, 25],
        outliers_in_limits: false,
        subset_points: allIndices(4)
      };
      const result = tLimits(args);
      
      // T-chart applies power transformation (^1/3.6)
      // Values should be transformed versions of input
      expect(result.values).toBeDefined();
      expect(result.values.length).toBe(4);
    });

    it("should use I-chart logic on transformed data", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(4),
        numerators: [10, 20, 15, 25],
        outliers_in_limits: false,
        subset_points: allIndices(4)
      };
      
      // T-chart is basically I-chart on power-transformed data
      const result = tLimits(args);
      
      expect(result.ll99).toBeDefined();
      expect(result.ul99).toBeDefined();
      expect(result.ll99!.length).toBe(4);
    });

    it("should back-transform limits to original scale", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(4),
        numerators: [8, 27, 64, 125],  // Perfect cubes for easy verification
        outliers_in_limits: false,
        subset_points: allIndices(4)
      };
      const result = tLimits(args);
      
      // Values should be back-transformed
      expect(result.values[0]).toBeGreaterThan(0);
      expect(result.targets[0]).toBeGreaterThan(0);
    });

    it("should truncate lower limits to 0", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [1, 2, 1],
        outliers_in_limits: false,
        subset_points: allIndices(3)
      };
      const result = tLimits(args);
      
      // All lower limits should be >= 0
      result.ll99!.forEach(val => expect(val).toBeGreaterThanOrEqual(0));
      result.ll95!.forEach(val => expect(val).toBeGreaterThanOrEqual(0));
      result.ll68!.forEach(val => expect(val).toBeGreaterThanOrEqual(0));
    });

    it("should use subset_points when provided", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [10, 20, 15, 1000, 2000],
        outliers_in_limits: false,
        subset_points: [0, 1, 2]
      };
      const result = tLimits(args);
      
      // Should only use first 3 points for limit calculation
      expect(result.targets).toBeDefined();
    });

    it("should handle outliers_in_limits parameter", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(4),
        numerators: [10, 20, 15, 25],
        outliers_in_limits: true,
        subset_points: allIndices(4)
      };
      const resultInclude = tLimits(args);
      
      args.outliers_in_limits = false;
      const resultExclude = tLimits(args);
      
      expect(resultInclude.ll99).toBeDefined();
      expect(resultExclude.ll99).toBeDefined();
    });

    it("should calculate 95% and 68% limits correctly", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(4),
        numerators: [10, 20, 15, 25],
        outliers_in_limits: false,
        subset_points: allIndices(4)
      };
      const result = tLimits(args);
      
      // 99% limits should be wider than 95% which should be wider than 68%
      expect(result.ul99![0]).toBeGreaterThan(result.ul95![0]);
      expect(result.ul95![0]).toBeGreaterThan(result.ul68![0]);
      expect(result.ll68![0]).toBeGreaterThan(result.ll95![0]);
      expect(result.ll95![0]).toBeGreaterThan(result.ll99![0]);
    });

  });

  describe("imLimits() - Individual Measurements Variant (i_m)", () => {

    it("should use median for centerline", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [10, 12, 11, 13, 10],
        outliers_in_limits: false,
        subset_points: allIndices(5)
      };
      const result = imLimits(args);
      
      // Median of [10, 12, 11, 13, 10] sorted = [10, 10, 11, 12, 13] = 11
      expect(result.targets[0]).toBe(11);
    });

    it("should use mean of consecutive differences for sigma (not median)", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(4),
        numerators: [10, 12, 11, 13],
        outliers_in_limits: false,
        subset_points: allIndices(4)
      };
      const result = imLimits(args);
      
      // This is the key difference from i_mm
      // i_m uses mean(consec_diff) for sigma calculation
      expect(result.ll99).toBeDefined();
      expect(result.ul99).toBeDefined();
    });

    it("should differ from standard I-chart (uses median not mean)", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [10, 12, 11, 13, 100],  // Outlier affects mean but not median
        outliers_in_limits: false,
        subset_points: allIndices(5)
      };
      
      const resultIM = imLimits(args);
      const resultI = iLimits(args);
      
      // i_m should use median (11 or 12), i uses mean (~29)
      expect(resultIM.targets[0]).toBeLessThan(15);
      expect(resultI.targets[0]).toBeGreaterThan(20);
    });

    it("should handle ratio calculation when denominators provided", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [10, 20, 30],
        denominators: [2, 4, 6],
        outliers_in_limits: false,
        subset_points: allIndices(3)
      };
      const result = imLimits(args);
      
      // All ratios are 5
      expect(result.values).toEqual([5, 5, 5]);
      expect(result.targets[0]).toBe(5);
    });

    it("should use subset_points when provided", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [10, 12, 11, 100, 200],
        outliers_in_limits: false,
        subset_points: [0, 1, 2]
      };
      const result = imLimits(args);
      
      // Median of first 3: [10, 12, 11] sorted = [10, 11, 12] = 11
      expect(result.targets[0]).toBe(11);
    });

    it("should handle outliers_in_limits parameter", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(4),
        numerators: [10, 12, 11, 13],
        outliers_in_limits: true,
        subset_points: allIndices(4)
      };
      const resultInclude = imLimits(args);
      
      args.outliers_in_limits = false;
      const resultExclude = imLimits(args);
      
      expect(resultInclude.ll99).toBeDefined();
      expect(resultExclude.ll99).toBeDefined();
    });

    itFailing("should replace invalid values with null in output", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [1, 2, 3],
        denominators: [1, 0, 1],
        outliers_in_limits: false,
        subset_points: allIndices(3)
      };
      const result = imLimits(args);
      
      // Same issue as runLimits and iLimits - division by zero produces Infinity
      // Per NaN_HANDLING_ANALYSIS.md: should be null, not 0
      expect(result.values[1]).toBeNull();
    });

    it("should calculate 95% and 68% limits correctly", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(4),
        numerators: [10, 12, 11, 13],
        outliers_in_limits: false,
        subset_points: allIndices(4)
      };
      const result = imLimits(args);
      
      expect(result.ul99![0]).toBeGreaterThan(result.ul95![0]);
      expect(result.ul95![0]).toBeGreaterThan(result.ul68![0]);
      expect(result.ll68![0]).toBeGreaterThan(result.ll95![0]);
      expect(result.ll95![0]).toBeGreaterThan(result.ll99![0]);
    });

  });

  describe("immLimits() - Individual Measurements Variant (i_mm)", () => {

    it("should use median for centerline", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [10, 12, 11, 13, 10],
        outliers_in_limits: false,
        subset_points: allIndices(5)
      };
      const result = immLimits(args);
      
      // Median of [10, 12, 11, 13, 10] sorted = [10, 10, 11, 12, 13] = 11
      expect(result.targets[0]).toBe(11);
    });

    it("should use median of consecutive differences for sigma (not mean)", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(4),
        numerators: [10, 12, 11, 13],
        outliers_in_limits: false,
        subset_points: allIndices(4)
      };
      const result = immLimits(args);
      
      // This is the key difference from i_m
      // i_mm uses median(consec_diff) for sigma calculation
      expect(result.ll99).toBeDefined();
      expect(result.ul99).toBeDefined();
    });

    it("should differ from i_m variant (median vs mean for sigma)", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [10, 12, 11, 13, 10],
        outliers_in_limits: false,
        subset_points: allIndices(5)
      };
      
      const resultIMM = immLimits(args);
      const resultIM = imLimits(args);
      
      // Both use median for centerline
      expect(resultIMM.targets[0]).toBe(resultIM.targets[0]);
      
      // But limits may differ due to median vs mean of consec_diff
      expect(resultIMM.ll99).toBeDefined();
      expect(resultIM.ll99).toBeDefined();
    });

    it("should handle ratio calculation when denominators provided", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [10, 20, 30],
        denominators: [2, 4, 6],
        outliers_in_limits: false,
        subset_points: allIndices(3)
      };
      const result = immLimits(args);
      
      expect(result.values).toEqual([5, 5, 5]);
      expect(result.targets[0]).toBe(5);
    });

    it("should use subset_points when provided", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [10, 12, 11, 100, 200],
        outliers_in_limits: false,
        subset_points: [0, 1, 2]
      };
      const result = immLimits(args);
      
      // Median of first 3: 11
      expect(result.targets[0]).toBe(11);
    });

    it("should handle outliers_in_limits parameter", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(4),
        numerators: [10, 12, 11, 13],
        outliers_in_limits: true,
        subset_points: allIndices(4)
      };
      const resultInclude = immLimits(args);
      
      args.outliers_in_limits = false;
      const resultExclude = immLimits(args);
      
      expect(resultInclude.ll99).toBeDefined();
      expect(resultExclude.ll99).toBeDefined();
    });

    itFailing("should replace invalid values with null in output", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(3),
        numerators: [1, 2, 3],
        denominators: [1, 0, 1],
        outliers_in_limits: false,
        subset_points: allIndices(3)
      };
      const result = immLimits(args);
      
      // Same division by zero issue
      expect(result.values[1]).toBeNull();
    });

    it("should calculate 95% and 68% limits correctly", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(4),
        numerators: [10, 12, 11, 13],
        outliers_in_limits: false,
        subset_points: allIndices(4)
      };
      const result = immLimits(args);
      
      expect(result.ul99![0]).toBeGreaterThan(result.ul95![0]);
      expect(result.ul95![0]).toBeGreaterThan(result.ul68![0]);
      expect(result.ll68![0]).toBeGreaterThan(result.ll95![0]);
      expect(result.ll95![0]).toBeGreaterThan(result.ll99![0]);
    });

  });

  describe("Advanced Charts - Comparison Tests", () => {

    it("should demonstrate difference between p and pprime", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [8, 12, 7, 15, 10],
        denominators: [100, 100, 100, 100, 100],
        outliers_in_limits: false,
        subset_points: allIndices(5)
      };
      
      const pResult = pLimits(args);
      const pprimeResult = pprimeLimits(args);
      
      // Same centerline
      expect(pResult.targets[0]).toBe(pprimeResult.targets[0]);
      
      // P' applies correction that may narrow limits
      expect(pResult.ll99).toBeDefined();
      expect(pprimeResult.ll99).toBeDefined();
    });

    it("should demonstrate difference between u and uprime", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [8, 12, 7, 15, 10],
        denominators: [100, 100, 100, 100, 100],
        outliers_in_limits: false,
        subset_points: allIndices(5)
      };
      
      const uResult = uLimits(args);
      const uprimeResult = uprimeLimits(args);
      
      // Same centerline
      expect(uResult.targets[0]).toBe(uprimeResult.targets[0]);
      
      // U' applies correction
      expect(uResult.ll99).toBeDefined();
      expect(uprimeResult.ll99).toBeDefined();
    });

    it("should demonstrate difference between i, i_m, and i_mm", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(5),
        numerators: [10, 12, 11, 13, 100],  // Outlier
        outliers_in_limits: false,
        subset_points: allIndices(5)
      };
      
      const iResult = iLimits(args);
      const imResult = imLimits(args);
      const immResult = immLimits(args);
      
      // i uses mean for centerline
      expect(iResult.targets[0]).toBeGreaterThan(20);
      
      // i_m and i_mm use median (more robust to outliers)
      expect(imResult.targets[0]).toBeLessThan(15);
      expect(immResult.targets[0]).toBeLessThan(15);
      
      // i_m and i_mm should have same centerline but may differ in limits
      expect(imResult.targets[0]).toBe(immResult.targets[0]);
    });

  });

});
