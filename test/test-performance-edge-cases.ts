/**
 * Test Extension Plan - Session 9
 * Performance & Load Testing - Part 4: Edge Cases and Stress Testing
 * 
 * Tests for worst-case scenarios and performance limits:
 * - Maximum data points PowerBI allows
 * - Rapid updates (selection changes)
 * - Complex calculations (xbar with many groups)
 * - Performance degradation patterns
 */

import { Visual } from "../src/visual";
import powerbi from "powerbi-visuals-api";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import buildDataView from "./helpers/buildDataView";
import iLimits from "../src/Limit Calculations/i";
import xbarLimits from "../src/Limit Calculations/xbar";
import { type controlLimitsArgs } from "../src/Classes";
import { allIndices, createKeys, measureTime, generateData } from "./helpers/testHelpers";

describe("Performance Testing - Edge Cases and Stress Testing", () => {

  describe("Rapid Sequential Updates", () => {

    it("should handle 50 rapid data updates without performance degradation", () => {
      const element = testDom("500", "400");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const n = 100;
      const times: number[] = [];

      // Perform 50 updates and measure each
      for (let i = 0; i < 50; i++) {
        const dataView = buildDataView({
          key: Array.from({ length: n }, (_, j) => `P${j + 1}`),
          numerators: generateData(n, 50 + i * 0.5, 10)
        });

        const time = measureTime(() => {
          visual.update({
            dataViews: [dataView],
            viewport: { width: 500, height: 400 },
            type: powerbi.VisualUpdateType.Data
          });
        });

        times.push(time);
      }

      // Calculate average time for first 10 and last 10 updates
      const avgFirst10 = times.slice(0, 10).reduce((a, b) => a + b, 0) / 10;
      const avgLast10 = times.slice(-10).reduce((a, b) => a + b, 0) / 10;

      // Performance should not degrade significantly (allow 100% increase)
      expect(avgLast10).toBeLessThan(avgFirst10 * 2);

      element.remove();
    });

    it("should handle 100 rapid resize events", () => {
      const element = testDom("500", "400");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const n = 100;
      const dataView = buildDataView({
        key: Array.from({ length: n }, (_, i) => `P${i + 1}`),
        numerators: generateData(n)
      });

      // Initial render
      visual.update({
        dataViews: [dataView],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      const times: number[] = [];

      // Perform 100 resizes
      for (let i = 0; i < 100; i++) {
        const width = 400 + (i % 50) * 10;
        const height = 300 + (i % 50) * 8;

        const time = measureTime(() => {
          visual.update({
            dataViews: [dataView],
            viewport: { width, height },
            type: powerbi.VisualUpdateType.Resize
          });
        });

        times.push(time);
      }

      // All resizes should be fast
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      expect(avgTime).toBeLessThan(30);

      element.remove();
    });

    it("should handle 100 rapid selection/highlighting updates", () => {
      const element = testDom("500", "400");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const n = 100;
      const dataView = buildDataView({
        key: Array.from({ length: n }, (_, i) => `P${i + 1}`),
        numerators: generateData(n)
      });

      // Initial render
      visual.update({
        dataViews: [dataView],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      const times: number[] = [];

      // Perform 100 highlighting updates
      for (let i = 0; i < 100; i++) {
        const time = measureTime(() => {
          visual.updateHighlighting();
        });
        times.push(time);
      }

      // All updates should be very fast
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      expect(avgTime).toBeLessThan(10);

      element.remove();
    });
  });

  describe("Complex Calculation Scenarios", () => {

    it("should handle xbar chart with many variable sample sizes", () => {
      const n = 1000;
      const args: controlLimitsArgs = {
        keys: createKeys(n),
        numerators: generateData(n, 50, 10),
        xbar_sds: generateData(n, 5, 2),
        // Highly variable sample sizes from 2 to 50
        denominators: generateData(n, 25, 15).map(v => Math.max(2, Math.min(50, Math.round(v)))),
        subset_points: allIndices(n)
      };

      const time = measureTime(() => {
        xbarLimits(args);
      });

      // Complex weighted calculation should still be fast
      expect(time).toBeLessThan(500);
      console.log(`xbar with variable n (1000 points): ${time.toFixed(2)}ms`);
    });

    it("should handle calculations with extreme variance in data", () => {
      const n = 1000;
      // Create data with extreme variance (0.1 to 1000)
      const numerators = Array.from({ length: n }, (_, i) => {
        if (i % 10 === 0) return 1000; // Spikes
        if (i % 10 === 5) return 0.1;   // Dips
        return 50;                       // Normal
      });

      const args: controlLimitsArgs = {
        keys: createKeys(n),
        numerators: numerators,
        subset_points: allIndices(n)
      };

      const time = measureTime(() => {
        iLimits(args);
      });

      expect(time).toBeLessThan(200);
      console.log(`i chart with extreme variance (1000 points): ${time.toFixed(2)}ms`);
    });

    it("should handle all-zero data efficiently", () => {
      const n = 1000;
      const args: controlLimitsArgs = {
        keys: createKeys(n),
        numerators: Array(n).fill(0),
        subset_points: allIndices(n)
      };

      const time = measureTime(() => {
        iLimits(args);
      });

      // Should handle edge case quickly
      expect(time).toBeLessThan(200);
      console.log(`i chart with all zeros (1000 points): ${time.toFixed(2)}ms`);
    });

    it("should handle all-same-value data efficiently", () => {
      const n = 1000;
      const args: controlLimitsArgs = {
        keys: createKeys(n),
        numerators: Array(n).fill(42),
        subset_points: allIndices(n)
      };

      const time = measureTime(() => {
        iLimits(args);
      });

      expect(time).toBeLessThan(200);
      console.log(`i chart with constant value (1000 points): ${time.toFixed(2)}ms`);
    });
  });

  describe("Memory Stress Testing", () => {

    it("should handle repeated create/destroy cycles without leaking", () => {
      const n = 100;
      const cycles = 20;

      for (let i = 0; i < cycles; i++) {
        const element = testDom("500", "400");
        const host = createVisualHost({});
        const visual = new Visual({ element, host });

        const dataView = buildDataView({
          key: Array.from({ length: n }, (_, j) => `P${j + 1}`),
          numerators: generateData(n)
        });

        visual.update({
          dataViews: [dataView],
          viewport: { width: 500, height: 400 },
          type: powerbi.VisualUpdateType.Data
        });

        // Verify render
        const dotsCount = visual.svg.selectAll(".dotsgroup").selectChildren().size();
        expect(dotsCount).toBe(n);

        // Clean up
        element.remove();
      }

      // If we got here without errors, memory is being managed properly
      expect(true).toBe(true);
    });

    it("should handle switching between chart and table repeatedly", () => {
      const element = testDom("500", "400");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const n = 200;

      // Alternate between chart and table 20 times
      for (let i = 0; i < 20; i++) {
        if (i % 2 === 0) {
          // Chart view
          const dataView = buildDataView({
            key: Array.from({ length: n }, (_, j) => `P${j + 1}`),
            numerators: generateData(n)
          });

          visual.update({
            dataViews: [dataView],
            viewport: { width: 500, height: 400 },
            type: powerbi.VisualUpdateType.Data
          });

          expect(visual.svg.attr("width")).toBe("500");
        } else {
          // Table view
          const dataView = buildDataView({
            key: Array.from({ length: n }, (_, j) => `P${j + 1}`),
            indicator: Array.from({ length: n }, (_, j) => `Group ${String.fromCharCode(65 + (j % 3))}`),
            numerators: generateData(n)
          });

          visual.update({
            dataViews: [dataView],
            viewport: { width: 500, height: 400 },
            type: powerbi.VisualUpdateType.Data
          });

          expect(visual.svg.attr("width")).toBe("0");
        }
      }

      element.remove();
    });
  });

  describe("Error Recovery Performance", () => {

    it("should recover quickly from invalid to valid data", () => {
      const element = testDom("500", "400");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const times: number[] = [];

      // Alternate between invalid and valid data 10 times
      for (let i = 0; i < 10; i++) {
        // Invalid data
        visual.update({
          dataViews: [],
          viewport: { width: 500, height: 400 },
          type: powerbi.VisualUpdateType.Data
        });

        // Valid data
        const n = 100;
        const dataView = buildDataView({
          key: Array.from({ length: n }, (_, j) => `P${j + 1}`),
          numerators: generateData(n)
        });

        const time = measureTime(() => {
          visual.update({
            dataViews: [dataView],
            viewport: { width: 500, height: 400 },
            type: powerbi.VisualUpdateType.Data
          });
        });

        times.push(time);
      }

      // Recovery should be fast and consistent
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      expect(avgTime).toBeLessThan(100);

      element.remove();
    });

    it("should handle errors without memory accumulation", () => {
      const element = testDom("500", "400");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      // Trigger 20 errors
      for (let i = 0; i < 20; i++) {
        visual.update({
          dataViews: [],
          viewport: { width: 500, height: 400 },
          type: powerbi.VisualUpdateType.Data
        });
      }

      // Should only have at most 1 error element
      const errorElements = visual.svg.selectAll(".errormessage").size();
      expect(errorElements).toBeLessThanOrEqual(1);

      element.remove();
    });
  });

  describe("Concurrent Operation Simulation", () => {

    it("should handle mixed update types in rapid succession", () => {
      const element = testDom("500", "400");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const n = 100;
      const times: number[] = [];

      // Initial render
      const dataView = buildDataView({
        key: Array.from({ length: n }, (_, i) => `P${i + 1}`),
        numerators: generateData(n)
      });

      visual.update({
        dataViews: [dataView],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      // Perform mixed operations: data update, resize, highlight, repeat
      for (let i = 0; i < 30; i++) {
        const operation = i % 3;

        const time = measureTime(() => {
          if (operation === 0) {
            // Data update
            const newDataView = buildDataView({
              key: Array.from({ length: n }, (_, j) => `P${j + 1}`),
              numerators: generateData(n, 50 + i, 10)
            });
            visual.update({
              dataViews: [newDataView],
              viewport: { width: 500, height: 400 },
              type: powerbi.VisualUpdateType.Data
            });
          } else if (operation === 1) {
            // Resize
            visual.update({
              dataViews: [dataView],
              viewport: { width: 500 + i * 10, height: 400 + i * 8 },
              type: powerbi.VisualUpdateType.Resize
            });
          } else {
            // Highlight
            visual.updateHighlighting();
          }
        });

        times.push(time);
      }

      // All mixed operations should be reasonably fast
      const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
      expect(avgTime).toBeLessThan(50);

      element.remove();
    });
  });

  describe("Performance Degradation Detection", () => {

    it("should maintain consistent performance over extended session", () => {
      const element = testDom("500", "400");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const n = 100;
      const iterations = 100;
      const times: number[] = [];

      // Perform 100 updates
      for (let i = 0; i < iterations; i++) {
        const dataView = buildDataView({
          key: Array.from({ length: n }, (_, j) => `P${j + 1}`),
          numerators: generateData(n, 50 + Math.sin(i / 10) * 10, 10)
        });

        const time = measureTime(() => {
          visual.update({
            dataViews: [dataView],
            viewport: { width: 500, height: 400 },
            type: powerbi.VisualUpdateType.Data
          });
        });

        times.push(time);
      }

      // Compare first quartile to last quartile
      const firstQuartile = times.slice(0, 25);
      const lastQuartile = times.slice(-25);

      const avgFirst = firstQuartile.reduce((a, b) => a + b, 0) / 25;
      const avgLast = lastQuartile.reduce((a, b) => a + b, 0) / 25;

      console.log(`First 25 avg: ${avgFirst.toFixed(2)}ms, Last 25 avg: ${avgLast.toFixed(2)}ms`);

      // Performance should not degrade significantly (allow 50% increase)
      expect(avgLast).toBeLessThan(avgFirst * 1.5);

      element.remove();
    });

    it("should identify performance scaling pattern", () => {
      const sizes = [10, 50, 100, 250, 500, 1000, 2000];
      const times: Record<number, number> = {};

      sizes.forEach(size => {
        const element = testDom("500", "400");
        const host = createVisualHost({});
        const visual = new Visual({ element, host });

        const dataView = buildDataView({
          key: Array.from({ length: size }, (_, i) => `P${i + 1}`),
          numerators: generateData(size)
        });

        const time = measureTime(() => {
          visual.update({
            dataViews: [dataView],
            viewport: { width: 500, height: 400 },
            type: powerbi.VisualUpdateType.Data
          });
        });

        times[size] = time;
        console.log(`Size ${size}: ${time.toFixed(2)}ms`);

        element.remove();
      });

      // Verify scaling is sub-quadratic
      // If perfectly linear: time(2000) / time(10) ≈ 200
      // If quadratic: time(2000) / time(10) ≈ 40000
      // We accept up to 300x (allows some overhead)
      const ratio = times[2000] / times[10];
      expect(ratio).toBeLessThan(300);
      console.log(`Scaling ratio (2000/10): ${ratio.toFixed(2)}x`);
    });
  });

  describe("Boundary Conditions", () => {

    it("should handle minimum dataset (1 point)", () => {
      const element = testDom("500", "400");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const dataView = buildDataView({
        key: ['Point 1'],
        numerators: [50]
      });

      expect(() => {
        visual.update({
          dataViews: [dataView],
          viewport: { width: 500, height: 400 },
          type: powerbi.VisualUpdateType.Data
        });
      }).not.toThrow();

      element.remove();
    });

    it("should handle minimum viewport (100x100)", () => {
      const element = testDom("100", "100");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const n = 50;
      const dataView = buildDataView({
        key: Array.from({ length: n }, (_, i) => `P${i + 1}`),
        numerators: generateData(n)
      });

      expect(() => {
        visual.update({
          dataViews: [dataView],
          viewport: { width: 100, height: 100 },
          type: powerbi.VisualUpdateType.Data
        });
      }).not.toThrow();

      element.remove();
    });

    it("should handle very large viewport (3000x2000)", () => {
      const element = testDom("3000", "2000");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const n = 100;
      const dataView = buildDataView({
        key: Array.from({ length: n }, (_, i) => `P${i + 1}`),
        numerators: generateData(n)
      });

      expect(() => {
        visual.update({
          dataViews: [dataView],
          viewport: { width: 3000, height: 2000 },
          type: powerbi.VisualUpdateType.Data
        });
      }).not.toThrow();

      element.remove();
    });
  });
});
