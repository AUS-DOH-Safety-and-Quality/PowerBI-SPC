/**
 * Test Extension Plan - Session 9
 * Performance & Load Testing - Part 2: Rendering Performance
 * 
 * Benchmarks for D3 rendering operations:
 * - Measure initial render time
 * - Measure update render time
 * - Test with varying numbers of visual elements
 * - Measure DOM manipulation cost
 */

import { Visual } from "../src/visual";
import powerbi from "powerbi-visuals-api";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import buildDataView from "./helpers/buildDataView";
import { measureTime, generateData } from "./helpers/testHelpers";

describe("Performance Testing - Rendering Performance", () => {

  // Helper to create day labels
  function createDayLabels(n: number): string[] {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return Array.from({ length: n }, (_, i) => `${days[i % 7]} ${Math.floor(i / 7) + 1}`);
  }

  describe("Initial Render Performance", () => {

    it("should render visual with 10 points in < 100ms", () => {
      const element = testDom("500", "400");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const n = 10;
      const dataView = buildDataView({
        key: createDayLabels(n),
        numerators: generateData(n)
      });

      const time = measureTime(() => {
        visual.update({
          dataViews: [dataView],
          viewport: { width: 500, height: 400 },
          type: powerbi.VisualUpdateType.Data
        });
      }, 5);

      expect(time).toBeLessThan(100);
      console.log(`Initial render (10 points): ${time.toFixed(2)}ms`);

      element.remove();
    });

    it("should render visual with 100 points in < 200ms", () => {
      const element = testDom("500", "400");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const n = 100;
      const dataView = buildDataView({
        key: createDayLabels(n),
        numerators: generateData(n)
      });

      const time = measureTime(() => {
        visual.update({
          dataViews: [dataView],
          viewport: { width: 500, height: 400 },
          type: powerbi.VisualUpdateType.Data
        });
      }, 5);

      expect(time).toBeLessThan(200);
      console.log(`Initial render (100 points): ${time.toFixed(2)}ms`);

      element.remove();
    });

    it("should render visual with 500 points in < 500ms", () => {
      const element = testDom("500", "400");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const n = 500;
      const dataView = buildDataView({
        key: createDayLabels(n),
        numerators: generateData(n)
      });

      const time = measureTime(() => {
        visual.update({
          dataViews: [dataView],
          viewport: { width: 500, height: 400 },
          type: powerbi.VisualUpdateType.Data
        });
      }, 3);

      expect(time).toBeLessThan(500);
      console.log(`Initial render (500 points): ${time.toFixed(2)}ms`);

      element.remove();
    });

    it("should render visual with 1000 points in < 1000ms", () => {
      const element = testDom("500", "400");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const n = 1000;
      const dataView = buildDataView({
        key: createDayLabels(n),
        numerators: generateData(n)
      });

      const time = measureTime(() => {
        visual.update({
          dataViews: [dataView],
          viewport: { width: 500, height: 400 },
          type: powerbi.VisualUpdateType.Data
        });
      }, 3);

      expect(time).toBeLessThan(1000);
      console.log(`Initial render (1000 points): ${time.toFixed(2)}ms`);

      element.remove();
    });
  });

  describe("Update Render Performance", () => {

    it("should update visual with 100 points in < 100ms", () => {
      const element = testDom("500", "400");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const n = 100;
      const dataView1 = buildDataView({
        key: createDayLabels(n),
        numerators: generateData(n)
      });

      // Initial render
      visual.update({
        dataViews: [dataView1],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      // Measure update render
      const dataView2 = buildDataView({
        key: createDayLabels(n),
        numerators: generateData(n) // Different data
      });

      const time = measureTime(() => {
        visual.update({
          dataViews: [dataView2],
          viewport: { width: 500, height: 400 },
          type: powerbi.VisualUpdateType.Data
        });
      }, 10);

      expect(time).toBeLessThan(100);
      console.log(`Update render (100 points): ${time.toFixed(2)}ms`);

      element.remove();
    });

    it("should update visual with 500 points in < 200ms", () => {
      const element = testDom("500", "400");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const n = 500;
      const dataView1 = buildDataView({
        key: createDayLabels(n),
        numerators: generateData(n)
      });

      // Initial render
      visual.update({
        dataViews: [dataView1],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      // Measure update render
      const dataView2 = buildDataView({
        key: createDayLabels(n),
        numerators: generateData(n)
      });

      const time = measureTime(() => {
        visual.update({
          dataViews: [dataView2],
          viewport: { width: 500, height: 400 },
          type: powerbi.VisualUpdateType.Data
        });
      }, 5);

      expect(time).toBeLessThan(200);
      console.log(`Update render (500 points): ${time.toFixed(2)}ms`);

      element.remove();
    });
  });

  describe("Resize Performance", () => {

    it("should handle viewport resize in < 30ms", () => {
      const element = testDom("500", "400");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const n = 100;
      const dataView = buildDataView({
        key: createDayLabels(n),
        numerators: generateData(n)
      });

      // Initial render
      visual.update({
        dataViews: [dataView],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      // Measure resize
      const time = measureTime(() => {
        visual.update({
          dataViews: [dataView],
          viewport: { width: 800, height: 600 },
          type: powerbi.VisualUpdateType.Resize
        });
      }, 10);

      expect(time).toBeLessThan(30);
      console.log(`Resize (100 points): ${time.toFixed(2)}ms`);

      element.remove();
    });

    it("should handle multiple consecutive resizes efficiently", () => {
      const element = testDom("500", "400");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const n = 100;
      const dataView = buildDataView({
        key: createDayLabels(n),
        numerators: generateData(n)
      });

      // Initial render
      visual.update({
        dataViews: [dataView],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      // Measure 10 consecutive resizes
      const time = measureTime(() => {
        for (let i = 0; i < 10; i++) {
          visual.update({
            dataViews: [dataView],
            viewport: { width: 500 + i * 10, height: 400 + i * 10 },
            type: powerbi.VisualUpdateType.Resize
          });
        }
      }, 3);

      // All 10 resizes should complete in < 300ms total
      expect(time).toBeLessThan(300);
      console.log(`10 consecutive resizes: ${time.toFixed(2)}ms`);

      element.remove();
    });
  });

  describe("DOM Element Count Performance", () => {

    it("should scale rendering time linearly with data points", () => {
      const sizes = [10, 50, 100, 250, 500];
      const times: Record<number, number> = {};

      sizes.forEach(size => {
        const element = testDom("500", "400");
        const host = createVisualHost({});
        const visual = new Visual({ element, host });

        const dataView = buildDataView({
          key: createDayLabels(size),
          numerators: generateData(size)
        });

        times[size] = measureTime(() => {
          visual.update({
            dataViews: [dataView],
            viewport: { width: 500, height: 400 },
            type: powerbi.VisualUpdateType.Data
          });
        }, 3);

        console.log(`Render ${size} points: ${times[size].toFixed(2)}ms`);

        element.remove();
      });

      // Verify roughly linear scaling (allow some overhead)
      const time10 = times[10];
      const time500 = times[500];
      
      // 500 points shouldn't take more than 60x the time of 10 points
      expect(time500).toBeLessThan(time10 * 60);
    });

    it("should verify DOM element count matches data points", () => {
      const element = testDom("500", "400");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const n = 100;
      const dataView = buildDataView({
        key: createDayLabels(n),
        numerators: generateData(n)
      });

      visual.update({
        dataViews: [dataView],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      // Count dots in dotsgroup
      const dotsCount = visual.svg.selectAll(".dotsgroup").selectChildren().size();
      expect(dotsCount).toBe(n);

      element.remove();
    });
  });

  describe("Rapid Update Performance", () => {

    it("should handle 10 rapid data updates in < 500ms", () => {
      const element = testDom("500", "400");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const n = 100;

      const time = measureTime(() => {
        for (let i = 0; i < 10; i++) {
          const dataView = buildDataView({
            key: createDayLabels(n),
            numerators: generateData(n, 50 + i, 10)
          });

          visual.update({
            dataViews: [dataView],
            viewport: { width: 500, height: 400 },
            type: powerbi.VisualUpdateType.Data
          });
        }
      }, 3);

      expect(time).toBeLessThan(500);
      console.log(`10 rapid updates (100 points): ${time.toFixed(2)}ms`);

      element.remove();
    });

    it("should handle rapid selection updates in < 100ms", () => {
      const element = testDom("500", "400");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const n = 100;
      const dataView = buildDataView({
        key: createDayLabels(n),
        numerators: generateData(n)
      });

      // Initial render
      visual.update({
        dataViews: [dataView],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      // Measure 10 selection updates
      const time = measureTime(() => {
        for (let i = 0; i < 10; i++) {
          visual.updateHighlighting();
        }
      }, 5);

      expect(time).toBeLessThan(100);
      console.log(`10 selection updates: ${time.toFixed(2)}ms`);

      element.remove();
    });
  });

  describe("Baseline Performance Metrics", () => {

    it("should establish rendering baseline for various sizes", () => {
      const sizes = [10, 25, 50, 100, 250, 500, 1000];
      const baselines: Record<number, { initial: number, update: number }> = {};

      sizes.forEach(size => {
        const element = testDom("500", "400");
        const host = createVisualHost({});
        const visual = new Visual({ element, host });

        const dataView1 = buildDataView({
          key: createDayLabels(size),
          numerators: generateData(size)
        });

        // Measure initial render
        const initialTime = measureTime(() => {
          visual.update({
            dataViews: [dataView1],
            viewport: { width: 500, height: 400 },
            type: powerbi.VisualUpdateType.Data
          });
        }, 3);

        // Measure update render
        const dataView2 = buildDataView({
          key: createDayLabels(size),
          numerators: generateData(size)
        });

        const updateTime = measureTime(() => {
          visual.update({
            dataViews: [dataView2],
            viewport: { width: 500, height: 400 },
            type: powerbi.VisualUpdateType.Data
          });
        }, 3);

        baselines[size] = { initial: initialTime, update: updateTime };
        
        console.log(`Size ${size}: Initial ${initialTime.toFixed(2)}ms, Update ${updateTime.toFixed(2)}ms`);

        element.remove();
      });

      // Verify update is faster than initial render for all sizes
      sizes.forEach(size => {
        const { initial, update } = baselines[size];
        // Update should generally be faster or similar to initial render
        expect(update).toBeLessThanOrEqual(initial * 1.5); // Allow 50% overhead
      });
    });
  });

  describe("Memory Efficiency", () => {

    it("should not accumulate DOM elements on updates", () => {
      const element = testDom("500", "400");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const n = 100;

      // Perform multiple updates
      for (let i = 0; i < 5; i++) {
        const dataView = buildDataView({
          key: createDayLabels(n),
          numerators: generateData(n)
        });

        visual.update({
          dataViews: [dataView],
          viewport: { width: 500, height: 400 },
          type: powerbi.VisualUpdateType.Data
        });
      }

      // Count elements - should only have n dots, not n*5
      const dotsCount = visual.svg.selectAll(".dotsgroup").selectChildren().size();
      expect(dotsCount).toBe(n);

      element.remove();
    });

    it("should clean up elements when switching to table view", () => {
      const element = testDom("500", "400");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const n = 100;

      // Render chart view
      const dataView1 = buildDataView({
        key: createDayLabels(n),
        numerators: generateData(n)
      });

      visual.update({
        dataViews: [dataView1],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      const dotsCountChart = visual.svg.selectAll(".dotsgroup").selectChildren().size();
      expect(dotsCountChart).toBe(n);

      // Switch to table view with grouped data
      const dataView2 = buildDataView({
        key: createDayLabels(n),
        indicator: Array(n).fill('Group A'),
        numerators: generateData(n)
      });

      visual.update({
        dataViews: [dataView2],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      // SVG should be hidden (0x0)
      expect(visual.svg.attr("width")).toBe("0");
      expect(visual.svg.attr("height")).toBe("0");

      element.remove();
    });
  });
});
