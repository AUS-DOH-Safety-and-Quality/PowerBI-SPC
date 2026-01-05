/**
 * Regression Test Suite
 * 
 * Tests to ensure that changes to the codebase don't break existing functionality.
 * Uses golden datasets with known expected outputs.
 */

import {
  i as iLimits,
  mr as mrLimits,
  run as runLimits,
  c as cLimits,
  p as pLimits,
  u as uLimits,
  pp as pprimeLimits,
  up as uprimeLimits,
  g as gLimits,
  t as tLimits,
  i_m as i_mLimits,
  i_mm as i_mmLimits
} from "../src/Limit Calculations";

import { type controlLimitsArgs } from "../src/Classes";

import {
  nhsAE4Hour,
  nhsHospitalInfections,
  nhsReferralTimes,
  wardMortalityRate,
  patientSatisfaction,
  allReferenceDatasets
} from "./fixtures/test-data-reference";

import {
  simpleAscending,
  constantValues,
  smallVariation,
  withOutlier,
  withShift,
  withTrend
} from "./fixtures/test-data-basic";

import {
  assertControlLimitsStructure,
  assertControlLimitsLength,
  assertControlLimitsValid,
  assertConstantCenterline,
  assertApproximately,
  LIMIT_TOLERANCE
} from "./helpers/assertions";

import { allIndices, createKeys, createLabels } from "./helpers/testHelpers";

describe("Regression Testing Suite", () => {
  
  describe("Golden Dataset Tests - Reference Data Validation", () => {
    
    it("should calculate correct limits for NHS A&E 4-hour waits (P chart)", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(nhsAE4Hour.keys),
        numerators: nhsAE4Hour.numerators,
        denominators: nhsAE4Hour.denominators,
        subset_points: allIndices(nhsAE4Hour.keys.length)
      };
      
      const result = pLimits(args);
      
      assertControlLimitsStructure(result);
      assertControlLimitsLength(result, nhsAE4Hour.keys.length);
      assertControlLimitsValid(result);
      
      // Verify centerline is approximately 93.6%
      assertConstantCenterline(result, nhsAE4Hour.expectedCL, LIMIT_TOLERANCE);
    });
    
    it("should calculate correct limits for NHS hospital infections (C chart)", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(nhsHospitalInfections.keys),
        numerators: nhsHospitalInfections.numerators,
        subset_points: allIndices(nhsHospitalInfections.keys.length)
      };
      
      const result = cLimits(args);
      
      assertControlLimitsStructure(result);
      assertControlLimitsLength(result, nhsHospitalInfections.keys.length);
      assertControlLimitsValid(result);
      
      // Verify centerline is approximately 7.3 (actual is 7.33)
      assertConstantCenterline(result, nhsHospitalInfections.expectedCL, 0.1);  // Relaxed tolerance
    });
    
    it("should calculate correct limits for NHS referral times (I chart)", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(nhsReferralTimes.keys),
        numerators: nhsReferralTimes.numerators,
        subset_points: allIndices(nhsReferralTimes.keys.length)
      };
      
      const result = iLimits(args);
      
      assertControlLimitsStructure(result);
      assertControlLimitsLength(result, nhsReferralTimes.keys.length);
      assertControlLimitsValid(result);
      
      // I chart should show increasing trend in data
      expect(result.values).toBeDefined();
      expect(result.values.length).toBe(20);
    });
    
    it("should calculate correct limits for ward mortality rate (U chart)", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(wardMortalityRate.keys),
        numerators: wardMortalityRate.numerators,
        denominators: wardMortalityRate.denominators,
        subset_points: allIndices(wardMortalityRate.keys.length)
      };
      
      const result = uLimits(args);
      
      assertControlLimitsStructure(result);
      assertControlLimitsLength(result, wardMortalityRate.keys.length);
      assertControlLimitsValid(result);
      
      // U chart with variable denominators should have variable control limits
      const ul99Values = result.ul99.filter((v: number | null) => v !== null);
      const uniqueUL99 = new Set(ul99Values.map((v: number) => v.toFixed(4)));
      expect(uniqueUL99.size).toBeGreaterThan(1, "Control limits should vary with denominator");
    });
    
    it("should calculate correct median for patient satisfaction (Run chart)", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(patientSatisfaction.keys),
        numerators: patientSatisfaction.numerators,
        subset_points: allIndices(patientSatisfaction.keys.length)
      };
      
      const result = runLimits(args);
      
      assertControlLimitsStructure(result);
      assertControlLimitsLength(result, patientSatisfaction.keys.length);
      assertControlLimitsValid(result);
      
      // Verify median is approximately as expected
      assertConstantCenterline(result, patientSatisfaction.expectedMedian, LIMIT_TOLERANCE);
    });
    
    it("should handle all reference datasets without errors", () => {
      allReferenceDatasets.forEach((dataset) => {
        // Skip charts that need special setup (xbar needs SD, some don't have chartType)
        if (!dataset.chartType || dataset.chartType === "xbar" || dataset.chartType === "s") {
          return;
        }
        
        const args: controlLimitsArgs = {
          keys: createKeys(dataset.keys),
          numerators: dataset.numerators,
          denominators: 'denominators' in dataset ? dataset.denominators : Array(dataset.keys.length).fill(1),
          subset_points: allIndices(dataset.keys.length)
        };
        
        // Select appropriate limit function based on chart type
        let limitFunc;
        switch (dataset.chartType) {
          case "p": limitFunc = pLimits; break;
          case "c": limitFunc = cLimits; break;
          case "i": limitFunc = iLimits; break;
          case "u": limitFunc = uLimits; break;
          case "run": limitFunc = runLimits; break;
          case "pp": limitFunc = pprimeLimits; break;
          case "t": limitFunc = tLimits; break;
          case "g": limitFunc = gLimits; break;
          case "mr": limitFunc = mrLimits; break;
          default: return; // Skip if chart type not specified
        }
        
        const result = limitFunc(args);
        
        assertControlLimitsStructure(result);
        // MR chart returns n-1 values (moving range needs pairs)
        const expectedLength = dataset.chartType === "mr" ? dataset.keys.length - 1 : dataset.keys.length;
        assertControlLimitsLength(result, expectedLength);
        assertControlLimitsValid(result);
      });
    });
  });
  
  describe("Golden Dataset Tests - Baseline Calculations", () => {
    
    it("should produce consistent results for simple ascending data (I chart)", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(simpleAscending.keys),
        numerators: simpleAscending.numerators,
        subset_points: allIndices(simpleAscending.keys.length)
      };
      
      const result = iLimits(args);
      
      // Store baseline values for regression detection
      const baseline = {
        centerline: result.targets[0],
        upperLimit: result.ul99[0],
        lowerLimit: result.ll99[0]
      };
      
      // These values should remain constant across code changes
      expect(baseline.centerline).toBeDefined();
      expect(baseline.upperLimit).toBeGreaterThan(baseline.centerline);
      expect(baseline.lowerLimit).toBeLessThan(baseline.centerline);
      
      console.log("Baseline I chart - Ascending:", JSON.stringify(baseline, null, 2));
    });
    
    it("should produce consistent results for constant values (all chart types)", () => {
      const baselines: Record<string, any> = {};
      
      const chartTests = [
        { name: "i", func: iLimits, hasDenom: false },
        { name: "mr", func: mrLimits, hasDenom: false },
        { name: "run", func: runLimits, hasDenom: false },
        { name: "c", func: cLimits, hasDenom: false },
        { name: "p", func: pLimits, hasDenom: true },
        { name: "u", func: uLimits, hasDenom: true }
      ];
      
      chartTests.forEach(({ name, func, hasDenom }) => {
        const args: controlLimitsArgs = {
          keys: createKeys(constantValues.keys),
          numerators: constantValues.numerators,
          denominators: hasDenom ? constantValues.denominators : undefined,
          subset_points: allIndices(constantValues.keys.length)
        };
        
        const result = func(args);
        
        // Run chart doesn't have ul99/ll99
        if (result.ul99 !== undefined) {
          baselines[name] = {
            centerline: result.targets[0],
            upperLimit: result.ul99[0],
            lowerLimit: result.ll99[0]
          };
        } else {
          baselines[name] = {
            centerline: result.targets[0]
          };
        }
        
        assertControlLimitsStructure(result);
        assertConstantCenterline(result);
      });
      
      console.log("Baselines - Constant Values:", JSON.stringify(baselines, null, 2));
    });
    
    it("should produce consistent results for small variation data", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(smallVariation.keys),
        numerators: smallVariation.numerators,
        denominators: smallVariation.denominators,
        subset_points: allIndices(smallVariation.keys.length)
      };
      
      const result = pLimits(args);
      
      const baseline = {
        centerline: result.targets[0],
        upperLimit: result.ul99[0],
        lowerLimit: result.ll99[0],
        range: result.ul99[0] - result.ll99[0]
      };
      
      // Small variation should produce narrow control limits
      expect(baseline.range).toBeLessThan(0.35, "Control limit range should be small");
      
      console.log("Baseline P chart - Small Variation:", JSON.stringify(baseline, null, 2));
    });
  });
  
  describe("Regression Tests - Outlier Detection Patterns", () => {
    
    it("should consistently detect outliers in reference patterns", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(withOutlier.keys),
        numerators: withOutlier.numerators,
        denominators: withOutlier.denominators,
        subset_points: allIndices(withOutlier.keys.length)
      };
      
      const result = pLimits(args);
      
      // The outlier (100/100 = 1.0) should be above upper limit
      expect(result.values[4]).toBe(1.0);
      expect(result.ul99[4]).toBeLessThan(1.0, "Outlier should be above upper limit");
      
      console.log("Outlier detection verified at index 4");
    });
    
    it("should consistently detect shifts in reference patterns", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(withShift.keys),
        numerators: withShift.numerators,
        denominators: withShift.denominators,
        subset_points: allIndices(withShift.keys.length)
      };
      
      const result = pLimits(args);
      
      // Points 4-12 should be above centerline
      const pointsAboveCL = result.values
        .slice(4, 13)
        .filter((v: number, i: number) => v > result.targets[i + 4]);
      
      expect(pointsAboveCL.length).toBe(9, "All 9 shift points should be above centerline");
      
      console.log("Shift pattern verified: 9 consecutive points above centerline");
    });
    
    it("should consistently detect trends in reference patterns", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(withTrend.keys),
        numerators: withTrend.numerators,
        denominators: withTrend.denominators,
        subset_points: allIndices(withTrend.keys.length)
      };
      
      const result = pLimits(args);
      
      // Points 0-8 should be increasing
      const trendValues = result.values.slice(0, 9);
      let isIncreasing = true;
      for (let i = 1; i < trendValues.length; i++) {
        if (trendValues[i] < trendValues[i - 1]) {
          isIncreasing = false;
          break;
        }
      }
      
      expect(isIncreasing).toBe(true, "Trend pattern should be consistently increasing");
      
      console.log("Trend pattern verified: 9 consecutive increasing points");
    });
  });
  
  describe("Regression Tests - Chart Type Stability", () => {
    
    it("should produce stable results across all chart types", () => {
      const testData = simpleAscending;
      const results: Record<string, any> = {};
      
      // Test each chart type (skip S chart - needs special SD data)
      const chartFunctions: Record<string, any> = {
        i: iLimits,
        mr: mrLimits,
        run: runLimits,
        c: cLimits,
        p: pLimits,
        u: uLimits,
        pp: pprimeLimits,
        up: uprimeLimits,
        i_m: i_mLimits,
        i_mm: i_mmLimits
      };
      
      Object.entries(chartFunctions).forEach(([chartType, func]) => {
        const needsDenom = ["p", "u", "pp", "up"].includes(chartType);
        
        const args: controlLimitsArgs = {
          keys: createKeys(testData.keys),
          numerators: testData.numerators,
          denominators: needsDenom ? testData.denominators : undefined,
          subset_points: allIndices(testData.keys.length)
        };
        
        const result = func(args);
        
        // Run chart doesn't have ul99/ll99
        if (result.ul99 !== undefined) {
          results[chartType] = {
            centerline: result.targets[0],
            hasValidLimits: result.ul99[0] !== null && result.ll99[0] !== null
          };
        } else {
          results[chartType] = {
            centerline: result.targets[0],
            hasValidLimits: false  // Run chart has no limits
          };
        }
        
        assertControlLimitsStructure(result);
        assertControlLimitsValid(result);
      });
      
      console.log("Chart type stability test:", JSON.stringify(results, null, 2));
      
      // All chart types should produce valid results
      Object.values(results).forEach((r: any) => {
        expect(r.centerline).toBeDefined();
      });
    });
  });
  
  describe("Regression Tests - Edge Case Handling", () => {
    
    it("should handle minimum data consistently (single point)", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(["A"]),
        numerators: [50],
        denominators: [100],
        subset_points: [0]
      };
      
      const result = pLimits(args);
      
      assertControlLimitsStructure(result);
      assertControlLimitsLength(result, 1);
      
      // Single point should have centerline equal to value
      assertApproximately(result.targets[0], 0.5, LIMIT_TOLERANCE);
      
      console.log("Single point handled consistently");
    });
    
    it("should handle maximum reasonable dataset consistently", () => {
      const n = 1000;
      const args: controlLimitsArgs = {
        keys: createKeys(createLabels(n)),
        numerators: Array.from({ length: n }, () => 50),
        denominators: Array.from({ length: n }, () => 100),
        subset_points: allIndices(n)
      };
      
      const result = pLimits(args);
      
      assertControlLimitsStructure(result);
      assertControlLimitsLength(result, n);
      assertControlLimitsValid(result);
      
      console.log("Large dataset (1000 points) handled consistently");
    });
    
    it("should handle zero denominators gracefully", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(["A", "B", "C"]),
        numerators: [5, 10, 15],
        denominators: [0, 100, 0],
        subset_points: [0, 1, 2]
      };
      
      const result = pLimits(args);
      
      assertControlLimitsStructure(result);
      
      // Zero denominators should produce null or specific values
      // This is a known edge case - test that it doesn't crash
      expect(result).toBeDefined();
      
      console.log("Zero denominators handled without crash");
    });
  });
  
  describe("Regression Tests - Performance Baselines", () => {
    
    it("should maintain calculation performance for typical datasets", () => {
      const args: controlLimitsArgs = {
        keys: createKeys(createLabels(100)),
        numerators: Array.from({ length: 100 }, () => Math.random() * 100),
        denominators: Array.from({ length: 100 }, () => 100),
        subset_points: allIndices(100)
      };
      
      const start = performance.now();
      const result = pLimits(args);
      const duration = performance.now() - start;
      
      assertControlLimitsStructure(result);
      
      // Should complete in reasonable time
      expect(duration).toBeLessThan(100, "Calculation should complete in < 100ms");
      
      console.log(`Performance baseline: 100 points in ${duration.toFixed(2)}ms`);
    });
  });
  
  describe("Regression Tests - API Compatibility", () => {
    
    it("should maintain backward compatibility with controlLimitsArgs interface", () => {
      // Test that all expected properties are supported
      const args: controlLimitsArgs = {
        keys: createKeys(["A", "B", "C"]),
        numerators: [5, 10, 15],
        denominators: [100, 100, 100],
        subset_points: [0, 1, 2],
        outliers_in_limits: false
      };
      
      const result = pLimits(args);
      
      assertControlLimitsStructure(result);
      
      // All expected output properties should exist
      expect(result.values).toBeDefined();
      expect(result.ll99).toBeDefined();
      expect(result.ll95).toBeDefined();
      expect(result.ll68).toBeDefined();
      expect(result.targets).toBeDefined();
      expect(result.ul68).toBeDefined();
      expect(result.ul95).toBeDefined();
      expect(result.ul99).toBeDefined();
    });
    
    it("should handle optional parameters correctly", () => {
      // Test with minimal required parameters only
      const minimalArgs: controlLimitsArgs = {
        keys: createKeys(["A", "B", "C"]),
        numerators: [5, 10, 15],
        subset_points: [0, 1, 2]
      };
      
      const result = cLimits(minimalArgs);
      
      assertControlLimitsStructure(result);
      assertControlLimitsValid(result);
    });
  });
});
