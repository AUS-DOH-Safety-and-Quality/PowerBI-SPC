/**
 * Test Extension Plan - Session 9
 * Performance & Load Testing - Part 1: Calculation Performance
 * 
 * Benchmarks for SPC limit calculations and outlier detection:
 * - Measure execution time for limit calculations with varying dataset sizes
 * - Test all 14 chart types for performance
 * - Benchmark outlier detection algorithms
 * - Establish performance baselines and regression tests
 */

import iLimits from "../src/Limit Calculations/i";
import mrLimits from "../src/Limit Calculations/mr";
import runLimits from "../src/Limit Calculations/run";
import cLimits from "../src/Limit Calculations/c";
import pLimits from "../src/Limit Calculations/p";
import uLimits from "../src/Limit Calculations/u";
import sLimits from "../src/Limit Calculations/s";
import pprimeLimits from "../src/Limit Calculations/pprime";
import uprimeLimits from "../src/Limit Calculations/uprime";
import xbarLimits from "../src/Limit Calculations/xbar";
import gLimits from "../src/Limit Calculations/g";
import tLimits from "../src/Limit Calculations/t";
import i_mLimits from "../src/Limit Calculations/i_m";
import i_mmLimits from "../src/Limit Calculations/i_mm";

import astronomical from "../src/Outlier Flagging/astronomical";
import shift from "../src/Outlier Flagging/shift";
import trend from "../src/Outlier Flagging/trend";
import twoInThree from "../src/Outlier Flagging/twoInThree";

import { type controlLimitsArgs } from "../src/Classes";
import { allIndices, createKeys, measureTime, generateData } from "./helpers/testHelpers";

describe("Performance Testing - Calculation Performance", () => {

  describe("Limit Calculation Performance - i chart (XmR)", () => {

    it("should calculate limits for 10 points in < 10ms", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(10),
        numerators: generateData(10),
        subset_points: allIndices(10)
      };

      const time = measureTime(() => iLimits(args), 10);
      
      expect(time).toBeLessThan(10);
    });

    it("should calculate limits for 100 points in < 50ms", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(100),
        numerators: generateData(100),
        subset_points: allIndices(100)
      };

      const time = measureTime(() => iLimits(args), 10);
      
      expect(time).toBeLessThan(50);
    });

    it("should calculate limits for 1000 points in < 200ms", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(1000),
        numerators: generateData(1000),
        subset_points: allIndices(1000)
      };

      const time = measureTime(() => iLimits(args), 5);
      
      expect(time).toBeLessThan(200);
    });

    it("should calculate limits for 10000 points in < 2000ms", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(10000),
        numerators: generateData(10000),
        subset_points: allIndices(10000)
      };

      const time = measureTime(() => iLimits(args), 3);
      
      expect(time).toBeLessThan(2000);
    });
  });

  describe("Limit Calculation Performance - run chart", () => {

    it("should calculate median for 100 points in < 50ms", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(100),
        numerators: generateData(100),
        subset_points: allIndices(100)
      };

      const time = measureTime(() => runLimits(args), 10);
      
      expect(time).toBeLessThan(50);
    });

    it("should calculate median for 1000 points in < 200ms", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(1000),
        numerators: generateData(1000),
        subset_points: allIndices(1000)
      };

      const time = measureTime(() => runLimits(args), 5);
      
      expect(time).toBeLessThan(200);
    });
  });

  describe("Limit Calculation Performance - p chart (proportions)", () => {

    it("should calculate limits for 100 points in < 50ms", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(100),
        numerators: generateData(100, 25, 5).map(v => Math.max(0, Math.round(v))),
        denominators: generateData(100, 100, 10).map(v => Math.max(1, Math.round(v))),
        subset_points: allIndices(100)
      };

      const time = measureTime(() => pLimits(args), 10);
      
      expect(time).toBeLessThan(50);
    });

    it("should calculate limits for 1000 points in < 200ms", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(1000),
        numerators: generateData(1000, 25, 5).map(v => Math.max(0, Math.round(v))),
        denominators: generateData(1000, 100, 10).map(v => Math.max(1, Math.round(v))),
        subset_points: allIndices(1000)
      };

      const time = measureTime(() => pLimits(args), 5);
      
      expect(time).toBeLessThan(200);
    });
  });

  describe("Limit Calculation Performance - xbar chart (sample means)", () => {

    it("should calculate limits for 100 points in < 100ms", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(100),
        numerators: generateData(100, 50, 10),
        xbar_sds: generateData(100, 5, 1),
        denominators: generateData(100, 10, 2).map(v => Math.max(2, Math.round(v))),
        subset_points: allIndices(100)
      };

      const time = measureTime(() => xbarLimits(args), 10);
      
      // xbar is more complex with weighted calculations, allow more time
      expect(time).toBeLessThan(100);
    });

    it("should calculate limits for 1000 points in < 500ms", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(1000),
        numerators: generateData(1000, 50, 10),
        xbar_sds: generateData(1000, 5, 1),
        denominators: generateData(1000, 10, 2).map(v => Math.max(2, Math.round(v))),
        subset_points: allIndices(1000)
      };

      const time = measureTime(() => xbarLimits(args), 5);
      
      expect(time).toBeLessThan(500);
    });
  });

  describe("Outlier Detection Performance - astronomical rule", () => {

    it("should detect outliers for 100 points in < 100ms", () => {
      const values = generateData(100);
      const ll99 = Array(100).fill(-3);
      const ul99 = Array(100).fill(3);

      const time = measureTime(() => {
        astronomical(values, ll99, ul99);
      }, 10);
      
      console.log(`astronomical (100 points): ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(100);
    });

    it("should detect outliers for 1000 points in < 200ms", () => {
      const values = generateData(1000);
      const ll99 = Array(1000).fill(-3);
      const ul99 = Array(1000).fill(3);

      const time = measureTime(() => {
        astronomical(values, ll99, ul99);
      }, 10);
      
      console.log(`astronomical (1000 points): ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(200);
    });

    it("should detect outliers for 10000 points in < 1000ms", () => {
      const values = generateData(10000);
      const ll99 = Array(10000).fill(-3);
      const ul99 = Array(10000).fill(3);

      const time = measureTime(() => {
        astronomical(values, ll99, ul99);
      }, 5);
      
      console.log(`astronomical (10000 points): ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(1000);
    });
  });

  describe("Outlier Detection Performance - shift rule", () => {

    it("should detect shifts for 100 points in < 100ms", () => {
      const values = generateData(100);
      const targets = Array(100).fill(50);

      const time = measureTime(() => {
        shift(values, targets, 8);
      }, 10);
      
      console.log(`shift (100 points): ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(100);
    });

    it("should detect shifts for 1000 points in < 200ms", () => {
      const values = generateData(1000);
      const targets = Array(1000).fill(50);

      const time = measureTime(() => {
        shift(values, targets, 8);
      }, 10);
      
      console.log(`shift (1000 points): ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(200);
    });

    it("should detect shifts for 10000 points in < 1000ms", () => {
      const values = generateData(10000);
      const targets = Array(10000).fill(50);

      const time = measureTime(() => {
        shift(values, targets, 8);
      }, 5);
      
      console.log(`shift (10000 points): ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(1000);
    });
  });

  describe("Outlier Detection Performance - trend rule", () => {

    it("should detect trends for 100 points in < 100ms", () => {
      const values = generateData(100);

      const time = measureTime(() => {
        trend(values, 6);
      }, 10);
      
      console.log(`trend (100 points): ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(100);
    });

    it("should detect trends for 1000 points in < 200ms", () => {
      const values = generateData(1000);

      const time = measureTime(() => {
        trend(values, 6);
      }, 10);
      
      console.log(`trend (1000 points): ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(200);
    });

    it("should detect trends for 10000 points in < 1000ms", () => {
      const values = generateData(10000);

      const time = measureTime(() => {
        trend(values, 6);
      }, 5);
      
      console.log(`trend (10000 points): ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(1000);
    });
  });

  describe("Outlier Detection Performance - twoInThree rule", () => {

    it("should detect patterns for 100 points in < 100ms", () => {
      const values = generateData(100);
      const ll95 = Array(100).fill(40);
      const ul95 = Array(100).fill(60);

      const time = measureTime(() => {
        twoInThree(values, ll95, ul95, false);
      }, 10);
      
      console.log(`twoInThree (100 points): ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(100);
    });

    it("should detect patterns for 1000 points in < 200ms", () => {
      const values = generateData(1000);
      const ll95 = Array(1000).fill(40);
      const ul95 = Array(1000).fill(60);

      const time = measureTime(() => {
        twoInThree(values, ll95, ul95, false);
      }, 10);
      
      console.log(`twoInThree (1000 points): ${time.toFixed(2)}ms`);
      expect(time).toBeLessThan(200);
    });
  });

  describe("Performance Comparison - All Chart Types", () => {

    it("should benchmark all basic chart types with 100 points", () => {
      const n = 100;
      const keys = createKeys(n);
      const numerators = generateData(n, 50, 10);
      const denominators = generateData(n, 100, 10).map(v => Math.max(1, Math.round(v)));
      const stdev = generateData(n, 5, 1);
      const sampleN = generateData(n, 10, 2).map(v => Math.max(2, Math.round(v)));
      const subset_points = allIndices(n);

      const results: Record<string, number> = {};

      // i chart
      results['i chart'] = measureTime(() => {
        iLimits({ keys, numerators, subset_points });
      }, 5);

      // mr chart
      results['mr chart'] = measureTime(() => {
        mrLimits({ keys, numerators, subset_points });
      }, 5);

      // run chart
      results['run chart'] = measureTime(() => {
        runLimits({ keys, numerators, subset_points });
      }, 5);

      // c chart
      results['c chart'] = measureTime(() => {
        cLimits({ keys, numerators, subset_points });
      }, 5);

      // p chart
      results['p chart'] = measureTime(() => {
        pLimits({ keys, numerators, denominators, subset_points });
      }, 5);

      // u chart
      results['u chart'] = measureTime(() => {
        uLimits({ keys, numerators, denominators, subset_points });
      }, 5);

      // s chart
      results['s chart'] = measureTime(() => {
        sLimits({ keys, numerators: stdev, denominators: sampleN, subset_points });
      }, 5);

      // pprime chart
      results['pprime chart'] = measureTime(() => {
        pprimeLimits({ keys, numerators, denominators, subset_points });
      }, 5);

      // uprime chart
      results['uprime chart'] = measureTime(() => {
        uprimeLimits({ keys, numerators, denominators, subset_points });
      }, 5);

      // xbar chart
      results['xbar chart'] = measureTime(() => {
        xbarLimits({ keys, numerators, xbar_sds: stdev, denominators: sampleN, subset_points });
      }, 5);

      // g chart
      results['g chart'] = measureTime(() => {
        gLimits({ keys, numerators, subset_points });
      }, 5);

      // t chart
      results['t chart'] = measureTime(() => {
        tLimits({ keys, numerators, subset_points });
      }, 5);

      // i_m chart
      results['i_m chart'] = measureTime(() => {
        i_mLimits({ keys, numerators, subset_points });
      }, 5);

      // i_mm chart
      results['i_mm chart'] = measureTime(() => {
        i_mmLimits({ keys, numerators, subset_points });
      }, 5);

      // All should complete in reasonable time
      Object.entries(results).forEach(([chartType, time]) => {
        expect(time).toBeLessThan(100);
        // Log for analysis (visible in test output)
        console.log(`${chartType}: ${time.toFixed(2)}ms`);
      });
    });
  });

  describe("Performance Regression Baseline", () => {

    it("should establish baseline for i chart with various sizes", () => {
      const sizes = [10, 50, 100, 500, 1000];
      const baselines: Record<number, number> = {};

      sizes.forEach(size => {
        const args: controlLimitsArgs = {
          keys: createKeys(size),
          numerators: generateData(size),
          subset_points: allIndices(size)
        };

        baselines[size] = measureTime(() => iLimits(args), 5);
        console.log(`i chart (${size} points): ${baselines[size].toFixed(2)}ms`);
      });

      // Verify scaling is reasonable (should be roughly linear)
      const time10 = Math.max(0.1, baselines[10]); // Ensure non-zero denominator
      const time1000 = baselines[1000];
      
      // 1000 points shouldn't take more than 200x the time of 10 points
      // (allows for some overhead but catches quadratic behavior)
      expect(time1000).toBeLessThan(time10 * 200);
    });

    it("should establish baseline for outlier detection with various sizes", () => {
      const sizes = [10, 50, 100, 500, 1000];
      const baselines: Record<number, number> = {};

      sizes.forEach(size => {
        const values = generateData(size);
        const ll99 = Array(size).fill(-3);
        const ul99 = Array(size).fill(3);

        baselines[size] = measureTime(() => {
          astronomical(values, ll99, ul99);
        }, 5);
        console.log(`astronomical (${size} points): ${baselines[size].toFixed(2)}ms`);
      });

      // Verify linear scaling
      const time10 = Math.max(0.1, baselines[10]); // Ensure non-zero denominator
      const time1000 = baselines[1000];
      
      // 1000 points shouldn't take more than 150x the time of 10 points
      expect(time1000).toBeLessThan(time10 * 150);
    });
  });
});
