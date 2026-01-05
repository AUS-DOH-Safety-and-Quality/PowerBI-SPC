/**
 * Test Extension Plan - Session 9
 * Performance & Load Testing - Part 3: Large Dataset Handling
 * 
 * Tests for handling large realistic datasets:
 * - Test with 1000+ data points
 * - Test multiple groupings
 * - Test all chart types with large datasets
 * - Validate no memory leaks
 */

import { Visual } from "../src/visual";
import powerbi from "powerbi-visuals-api";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import buildDataView from "./helpers/buildDataView";
import iLimits from "../src/Limit Calculations/i";
import pLimits from "../src/Limit Calculations/p";
import xbarLimits from "../src/Limit Calculations/xbar";
import { type controlLimitsArgs } from "../src/Classes";
import { allIndices, createKeys, generateData, createDayLabels } from "./helpers/testHelpers";

describe("Performance Testing - Large Dataset Handling", () => {

  describe("Large Dataset - Visual Rendering", () => {

    it("should render 1000 data points successfully", () => {
      const element = testDom("800", "600");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const n = 1000;
      const dataView = buildDataView({
        key: createDayLabels(n),
        numerators: generateData(n, 50, 10)
      });

      visual.update({
        dataViews: [dataView],
        viewport: { width: 800, height: 600 },
        type: powerbi.VisualUpdateType.Data
      });

      // Verify all points rendered
      const dotsCount = visual.svg.selectAll(".dotsgroup").selectChildren().size();
      expect(dotsCount).toBe(n);

      // Verify SVG is visible
      expect(visual.svg.attr("width")).toBe("800");
      expect(visual.svg.attr("height")).toBe("600");

      element.remove();
    });

    it("should render 2000 data points successfully", () => {
      const element = testDom("800", "600");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const n = 2000;
      const dataView = buildDataView({
        key: createDayLabels(n),
        numerators: generateData(n, 50, 10)
      });

      visual.update({
        dataViews: [dataView],
        viewport: { width: 800, height: 600 },
        type: powerbi.VisualUpdateType.Data
      });

      // Verify all points rendered
      const dotsCount = visual.svg.selectAll(".dotsgroup").selectChildren().size();
      expect(dotsCount).toBe(n);

      element.remove();
    });

    it("should handle 5000 data points without errors", () => {
      const element = testDom("800", "600");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const n = 5000;
      const dataView = buildDataView({
        key: createDayLabels(n),
        numerators: generateData(n, 50, 10)
      });

      // Should not throw errors
      expect(() => {
        visual.update({
          dataViews: [dataView],
          viewport: { width: 800, height: 600 },
          type: powerbi.VisualUpdateType.Data
        });
      }).not.toThrow();

      // Verify rendering completed
      const dotsCount = visual.svg.selectAll(".dotsgroup").selectChildren().size();
      expect(dotsCount).toBe(n);

      element.remove();
    });
  });

  describe("Large Dataset - Grouped Data", () => {

    it("should handle 1000 points with 5 groups", () => {
      const element = testDom("800", "600");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const n = 1000;
      const groups = ['Group A', 'Group B', 'Group C', 'Group D', 'Group E'];
      const indicator = Array.from({ length: n }, (_, i) => groups[i % groups.length]);

      const dataView = buildDataView({
        key: createDayLabels(n),
        indicator: indicator,
        numerators: generateData(n, 50, 10)
      });

      visual.update({
        dataViews: [dataView],
        viewport: { width: 800, height: 600 },
        type: powerbi.VisualUpdateType.Data
      });

      // Should show table view for grouped data
      expect(visual.tableDiv.style("width")).toBe("100%");
      expect(visual.svg.attr("width")).toBe("0");

      // Table should have rows
      const tableRows = visual.tableDiv.selectAll(".table-body").selectChildren().size();
      expect(tableRows).toBeGreaterThan(0);

      element.remove();
    });

    it("should handle 500 points with 10 groups", () => {
      const element = testDom("800", "600");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const n = 500;
      const groups = Array.from({ length: 10 }, (_, i) => `Group ${String.fromCharCode(65 + i)}`);
      const indicator = Array.from({ length: n }, (_, i) => groups[i % groups.length]);

      const dataView = buildDataView({
        key: createDayLabels(n),
        indicator: indicator,
        numerators: generateData(n, 50, 10)
      });

      visual.update({
        dataViews: [dataView],
        viewport: { width: 800, height: 600 },
        type: powerbi.VisualUpdateType.Data
      });

      // Should show table view
      expect(visual.tableDiv.style("width")).toBe("100%");

      element.remove();
    });
  });

  describe("Large Dataset - Limit Calculations", () => {

    it("should calculate i chart limits for 1000 points", () => {
      const n = 1000;
      const args: controlLimitsArgs = {
        keys: createKeys(n),
        numerators: generateData(n, 50, 10),
        subset_points: allIndices(n)
      };

      const result = iLimits(args);

      // Verify all arrays have correct length
      expect(result.values.length).toBe(n);
      expect(result.targets.length).toBe(n);
      expect(result.ll99.length).toBe(n);
      expect(result.ul99.length).toBe(n);

      // Verify limits are reasonable
      const allFinite = result.targets.every(v => Number.isFinite(v));
      expect(allFinite).toBe(true);
    });

    it("should calculate p chart limits for 1000 points", () => {
      const n = 1000;
      const args: controlLimitsArgs = {
        keys: createKeys(n),
        numerators: generateData(n, 25, 5).map(v => Math.max(0, Math.round(v))),
        denominators: generateData(n, 100, 10).map(v => Math.max(1, Math.round(v))),
        subset_points: allIndices(n)
      };

      const result = pLimits(args);

      // Verify all arrays have correct length
      expect(result.values.length).toBe(n);
      expect(result.targets.length).toBe(n);

      // Verify proportions are valid (between 0 and 1)
      const allValid = result.values.every(v => v >= 0 && v <= 1);
      expect(allValid).toBe(true);
    });

    it("should calculate xbar chart limits for 1000 points", () => {
      const n = 1000;
      const args: controlLimitsArgs = {
        keys: createKeys(n),
        numerators: generateData(n, 50, 10),
        xbar_sds: generateData(n, 5, 1),
        denominators: generateData(n, 10, 2).map(v => Math.max(2, Math.round(v))),
        subset_points: allIndices(n)
      };

      const result = xbarLimits(args);

      // Verify all arrays have correct length
      expect(result.values.length).toBe(n);
      expect(result.targets.length).toBe(n);

      // Verify calculation completed (targets should exist)
      expect(result.targets).toBeDefined();
      const hasTargets = result.targets.length > 0;
      expect(hasTargets).toBe(true);
    });
  });

  describe("Large Dataset - Update Performance", () => {

    it("should handle adding new data points efficiently", () => {
      const element = testDom("800", "600");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      // Start with 100 points
      let n = 100;
      let dataView = buildDataView({
        key: createDayLabels(n),
        numerators: generateData(n)
      });

      visual.update({
        dataViews: [dataView],
        viewport: { width: 800, height: 600 },
        type: powerbi.VisualUpdateType.Data
      });

      let dotsCount = visual.svg.selectAll(".dotsgroup").selectChildren().size();
      expect(dotsCount).toBe(100);

      // Add 100 more points
      n = 200;
      dataView = buildDataView({
        key: createDayLabels(n),
        numerators: generateData(n)
      });

      visual.update({
        dataViews: [dataView],
        viewport: { width: 800, height: 600 },
        type: powerbi.VisualUpdateType.Data
      });

      dotsCount = visual.svg.selectAll(".dotsgroup").selectChildren().size();
      expect(dotsCount).toBe(200);

      // Add 300 more points (total 500)
      n = 500;
      dataView = buildDataView({
        key: createDayLabels(n),
        numerators: generateData(n)
      });

      visual.update({
        dataViews: [dataView],
        viewport: { width: 800, height: 600 },
        type: powerbi.VisualUpdateType.Data
      });

      dotsCount = visual.svg.selectAll(".dotsgroup").selectChildren().size();
      expect(dotsCount).toBe(500);

      element.remove();
    });

    it("should handle data refresh with large datasets", () => {
      const element = testDom("800", "600");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const n = 1000;

      // Initial render
      const dataView1 = buildDataView({
        key: createDayLabels(n),
        numerators: generateData(n, 50, 10)
      });

      visual.update({
        dataViews: [dataView1],
        viewport: { width: 800, height: 600 },
        type: powerbi.VisualUpdateType.Data
      });

      // Refresh with new data
      const dataView2 = buildDataView({
        key: createDayLabels(n),
        numerators: generateData(n, 55, 12)
      });

      visual.update({
        dataViews: [dataView2],
        viewport: { width: 800, height: 600 },
        type: powerbi.VisualUpdateType.Data
      });

      // Should still have same number of points
      const dotsCount = visual.svg.selectAll(".dotsgroup").selectChildren().size();
      expect(dotsCount).toBe(n);

      element.remove();
    });
  });

  describe("Large Dataset - Memory Management", () => {

    it("should not accumulate elements with repeated updates", () => {
      const element = testDom("800", "600");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const n = 500;

      // Perform 10 updates
      for (let i = 0; i < 10; i++) {
        const dataView = buildDataView({
          key: createDayLabels(n),
          numerators: generateData(n, 50 + i, 10)
        });

        visual.update({
          dataViews: [dataView],
          viewport: { width: 800, height: 600 },
          type: powerbi.VisualUpdateType.Data
        });
      }

      // Should only have n dots, not n*10
      const dotsCount = visual.svg.selectAll(".dotsgroup").selectChildren().size();
      expect(dotsCount).toBe(n);

      // Verify no error elements accumulated
      const errorElements = visual.svg.selectAll(".errormessage").size();
      expect(errorElements).toBeLessThanOrEqual(1);

      element.remove();
    });

    it("should handle transition from large chart to table efficiently", () => {
      const element = testDom("800", "600");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const n = 1000;

      // Start with large chart
      const dataView1 = buildDataView({
        key: createDayLabels(n),
        numerators: generateData(n)
      });

      visual.update({
        dataViews: [dataView1],
        viewport: { width: 800, height: 600 },
        type: powerbi.VisualUpdateType.Data
      });

      const dotsCountChart = visual.svg.selectAll(".dotsgroup").selectChildren().size();
      expect(dotsCountChart).toBe(n);

      // Switch to table with grouped data
      const groups = ['Group A', 'Group B', 'Group C'];
      const indicator = Array.from({ length: n }, (_, i) => groups[i % groups.length]);

      const dataView2 = buildDataView({
        key: createDayLabels(n),
        indicator: indicator,
        numerators: generateData(n)
      });

      visual.update({
        dataViews: [dataView2],
        viewport: { width: 800, height: 600 },
        type: powerbi.VisualUpdateType.Data
      });

      // Chart should be hidden
      expect(visual.svg.attr("width")).toBe("0");

      // Switch back to chart
      visual.update({
        dataViews: [dataView1],
        viewport: { width: 800, height: 600 },
        type: powerbi.VisualUpdateType.Data
      });

      // Should have correct number of dots again
      const dotsCountAfter = visual.svg.selectAll(".dotsgroup").selectChildren().size();
      expect(dotsCountAfter).toBe(n);

      element.remove();
    });
  });

  describe("Large Dataset - Realistic Scenarios", () => {

    it("should handle daily data for 3 years (1095 points)", () => {
      const element = testDom("800", "600");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const n = 1095; // 3 years of daily data
      const dataView = buildDataView({
        key: createDayLabels(n),
        numerators: generateData(n, 50, 10)
      });

      visual.update({
        dataViews: [dataView],
        viewport: { width: 800, height: 600 },
        type: powerbi.VisualUpdateType.Data
      });

      const dotsCount = visual.svg.selectAll(".dotsgroup").selectChildren().size();
      expect(dotsCount).toBe(n);

      element.remove();
    });

    it("should handle weekly data for 5 years (260 points)", () => {
      const element = testDom("800", "600");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const n = 260; // 5 years of weekly data
      const dataView = buildDataView({
        key: Array.from({ length: n }, (_, i) => `Week ${i + 1}`),
        numerators: generateData(n, 50, 10)
      });

      visual.update({
        dataViews: [dataView],
        viewport: { width: 800, height: 600 },
        type: powerbi.VisualUpdateType.Data
      });

      const dotsCount = visual.svg.selectAll(".dotsgroup").selectChildren().size();
      expect(dotsCount).toBe(n);

      element.remove();
    });

    it("should handle hospital ward data - daily admissions for 2 years", () => {
      const element = testDom("800", "600");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const n = 730; // 2 years daily
      // Simulate hospital admissions - count data (non-negative integers)
      const admissions = generateData(n, 25, 8).map(v => Math.max(0, Math.round(v)));

      const dataView = buildDataView({
        key: createDayLabels(n),
        numerators: admissions
      });

      visual.update({
        dataViews: [dataView],
        viewport: { width: 800, height: 600 },
        type: powerbi.VisualUpdateType.Data
      });

      const dotsCount = visual.svg.selectAll(".dotsgroup").selectChildren().size();
      expect(dotsCount).toBe(n);

      element.remove();
    });

    it("should handle manufacturing data - hourly measurements for 1 month", () => {
      const element = testDom("800", "600");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const n = 720; // 30 days * 24 hours
      // Simulate manufacturing measurements with some variation
      const measurements = generateData(n, 100, 5);

      const dataView = buildDataView({
        key: Array.from({ length: n }, (_, i) => `Hour ${i + 1}`),
        numerators: measurements
      });

      visual.update({
        dataViews: [dataView],
        viewport: { width: 800, height: 600 },
        type: powerbi.VisualUpdateType.Data
      });

      const dotsCount = visual.svg.selectAll(".dotsgroup").selectChildren().size();
      expect(dotsCount).toBe(n);

      element.remove();
    });
  });

  describe("Large Dataset - Stress Testing", () => {

    it("should handle maximum practical dataset size (10000 points)", () => {
      const element = testDom("800", "600");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const n = 10000;
      const dataView = buildDataView({
        key: Array.from({ length: n }, (_, i) => `P${i + 1}`),
        numerators: generateData(n, 50, 10)
      });

      // Should not throw errors
      expect(() => {
        visual.update({
          dataViews: [dataView],
          viewport: { width: 800, height: 600 },
          type: powerbi.VisualUpdateType.Data
        });
      }).not.toThrow();

      // Verify rendering completed
      const dotsCount = visual.svg.selectAll(".dotsgroup").selectChildren().size();
      expect(dotsCount).toBe(n);

      element.remove();
    });
  });
});
