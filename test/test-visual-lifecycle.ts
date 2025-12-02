import powerbi from "powerbi-visuals-api";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../src/visual";
import buildDataView from "./helpers/buildDataView";

describe("Visual Lifecycle", () => {
  describe("Initialization → Update → Render cycle", () => {
    it("should complete full initialization cycle", () => {
      const element = testDom("500", "500");
      const host = createVisualHost({});
      
      // Step 1: Create visual
      const visual = new Visual({ element, host });
      expect(visual).toBeDefined();
      
      // Step 2: First update with data
      const dataView = buildDataView({
        key: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        numerators: [10, 20, 15, 25, 18]
      });

      visual.update({
        dataViews: [dataView],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      // Step 3: Verify rendering completed
      expect(visual.viewModel.inputData).toBeDefined();
      expect(visual.svg.select(".dotsgroup").empty()).toBe(false);
      expect(visual.svg.attr("width")).toBe("500");
      expect(visual.svg.attr("height")).toBe("400");

      element.remove();
    });

    it("should handle multiple consecutive updates", () => {
      const element = testDom("500", "500");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const dataView1 = buildDataView({
        key: ["Mon", "Tue"],
        numerators: [10, 20]
      });

      visual.update({
        dataViews: [dataView1],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      expect(visual.svg.select(".dotsgroup").empty()).toBe(false);

      const dataView2 = buildDataView({
        key: ["Mon", "Tue", "Wed", "Thu"],
        numerators: [10, 20, 15, 25]
      });

      visual.update({
        dataViews: [dataView2],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      expect(visual.svg.select(".dotsgroup").empty()).toBe(false);

      const dataView3 = buildDataView({
        key: ["Mon"],
        numerators: [10]
      });

      visual.update({
        dataViews: [dataView3],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      expect(visual.svg.select(".dotsgroup").empty()).toBe(false);

      element.remove();
    });

    it("should maintain SVG structure across multiple updates", () => {
      const element = testDom("500", "500");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const dataView = buildDataView({
        key: ["Mon", "Tue", "Wed"],
        numerators: [10, 20, 15]
      });

      // First update
      visual.update({
        dataViews: [dataView],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      expect(visual.svg.select(".xaxisgroup").empty()).toBe(false);
      expect(visual.svg.select(".yaxisgroup").empty()).toBe(false);

      // Second update with different data
      const dataView2 = buildDataView({
        key: ["Thu", "Fri", "Sat", "Sun"],
        numerators: [25, 18, 22, 30]
      });

      visual.update({
        dataViews: [dataView2],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      // SVG structure should still exist
      expect(visual.svg.select(".xaxisgroup").empty()).toBe(false);
      expect(visual.svg.select(".yaxisgroup").empty()).toBe(false);
      expect(visual.svg.select(".linesgroup").empty()).toBe(false);
      expect(visual.svg.select(".dotsgroup").empty()).toBe(false);

      element.remove();
    });
  });

  describe("Resize events", () => {
    it("should handle viewport resize", () => {
      const element = testDom("500", "500");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const dataView = buildDataView({
        key: ["Mon", "Tue", "Wed"],
        numerators: [10, 20, 15]
      });

      visual.update({
        dataViews: [dataView],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      // Resize viewport
      visual.update({
        dataViews: [dataView],
        viewport: { width: 800, height: 600 },
        type: powerbi.VisualUpdateType.Resize
      });

      expect(visual.svg.attr("width")).toBe("800");
      expect(visual.svg.attr("height")).toBe("600");
      expect(visual.viewModel.svgWidth).toBe(800);
      expect(visual.viewModel.svgHeight).toBe(600);

      element.remove();
    });

    it("should maintain data after resize", () => {
      const element = testDom("500", "500");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const dataView = buildDataView({
        key: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        numerators: [10, 20, 15, 25, 18]
      });

      visual.update({
        dataViews: [dataView],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      expect(visual.svg.select(".dotsgroup").empty()).toBe(false);

      // Resize
      visual.update({
        dataViews: [dataView],
        viewport: { width: 600, height: 500 },
        type: powerbi.VisualUpdateType.Resize
      });

      // Data should be maintained (visual should still render)
      expect(visual.svg.select(".dotsgroup").empty()).toBe(false);

      element.remove();
    });

    it("should handle multiple consecutive resizes", () => {
      const element = testDom("500", "500");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const dataView = buildDataView({
        key: ["Mon", "Tue", "Wed"],
        numerators: [10, 20, 15]
      });

      visual.update({
        dataViews: [dataView],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      visual.update({
        dataViews: [dataView],
        viewport: { width: 600, height: 500 },
        type: powerbi.VisualUpdateType.Resize
      });

      expect(visual.svg.attr("width")).toBe("600");

      visual.update({
        dataViews: [dataView],
        viewport: { width: 700, height: 600 },
        type: powerbi.VisualUpdateType.Resize
      });

      expect(visual.svg.attr("width")).toBe("700");

      visual.update({
        dataViews: [dataView],
        viewport: { width: 400, height: 300 },
        type: powerbi.VisualUpdateType.Resize
      });

      expect(visual.svg.attr("width")).toBe("400");

      element.remove();
    });
  });

  describe("Data refresh scenarios", () => {
    it("should handle data refresh with same structure", () => {
      const element = testDom("500", "500");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const dataView1 = buildDataView({
        key: ["Mon", "Tue", "Wed"],
        numerators: [10, 20, 15]
      });

      visual.update({
        dataViews: [dataView1],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      // First update should render successfully
      expect(visual.svg.select(".dotsgroup").empty()).toBe(false);

      const dataView2 = buildDataView({
        key: ["Mon", "Tue", "Wed"],
        numerators: [12, 22, 17]
      });

      visual.update({
        dataViews: [dataView2],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      // Second update should also render successfully
      expect(visual.svg.select(".dotsgroup").empty()).toBe(false);

      element.remove();
    });

    it("should handle data refresh with different structure", () => {
      const element = testDom("500", "500");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const dataView1 = buildDataView({
        key: ["Mon", "Tue", "Wed"],
        numerators: [10, 20, 15]
      });

      visual.update({
        dataViews: [dataView1],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      expect(visual.svg.select(".dotsgroup").empty()).toBe(false);

      const dataView2 = buildDataView({
        key: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
        numerators: [10, 20, 15, 25, 18, 22]
      });

      visual.update({
        dataViews: [dataView2],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      expect(visual.svg.select(".dotsgroup").empty()).toBe(false);

      element.remove();
    });

    it("should handle transition from ungrouped to grouped data", () => {
      const element = testDom("500", "500");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      // Start with ungrouped data
      const dataView1 = buildDataView({
        key: ["Mon", "Tue", "Wed"],
        numerators: [10, 20, 15]
      });

      visual.update({
        dataViews: [dataView1],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      expect(visual.svg.attr("width")).toBe("500");
      expect(visual.tableDiv.style("width")).toBe("0%");

      // Switch to grouped data
      const dataView2 = buildDataView({
        key: ["Mon", "Tue", "Wed", "Thu"],
        indicator: ["A", "A", "B", "B"],
        numerators: [10, 20, 15, 25]
      });

      visual.update({
        dataViews: [dataView2],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      expect(visual.svg.attr("width")).toBe("0");
      expect(visual.tableDiv.style("width")).toBe("100%");

      element.remove();
    });

    it("should handle transition from grouped to ungrouped data", () => {
      const element = testDom("500", "500");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      // Start with grouped data
      const dataView1 = buildDataView({
        key: ["Mon", "Tue", "Wed", "Thu"],
        indicator: ["A", "A", "B", "B"],
        numerators: [10, 20, 15, 25]
      });

      visual.update({
        dataViews: [dataView1],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      expect(visual.svg.attr("width")).toBe("0");
      expect(visual.tableDiv.style("width")).toBe("100%");

      // Switch to ungrouped data
      const dataView2 = buildDataView({
        key: ["Mon", "Tue", "Wed"],
        numerators: [10, 20, 15]
      });

      visual.update({
        dataViews: [dataView2],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      expect(visual.svg.attr("width")).toBe("500");
      expect(visual.tableDiv.style("width")).toBe("0%");

      element.remove();
    });
  });

  describe("Error recovery", () => {
    it("should recover from error state with valid data", () => {
      const element = testDom("500", "500");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      // First update with invalid data
      visual.update({
        dataViews: [],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      expect(visual.svg.select(".errormessage").empty()).toBe(false);

      // Second update with valid data
      const dataView = buildDataView({
        key: ["Mon", "Tue", "Wed"],
        numerators: [10, 20, 15]
      });

      visual.update({
        dataViews: [dataView],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      expect(visual.svg.select(".errormessage").empty()).toBe(true);
      expect(visual.viewModel.inputData).toBeDefined();

      element.remove();
    });

    it("should handle multiple error-recovery cycles", () => {
      const element = testDom("500", "500");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const validDataView = buildDataView({
        key: ["Mon", "Tue", "Wed"],
        numerators: [10, 20, 15]
      });

      // Cycle 1: Error
      visual.update({
        dataViews: [],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });
      expect(visual.svg.select(".errormessage").empty()).toBe(false);

      // Cycle 1: Recovery
      visual.update({
        dataViews: [validDataView],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });
      expect(visual.svg.select(".errormessage").empty()).toBe(true);

      // Cycle 2: Error
      visual.update({
        dataViews: [],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });
      expect(visual.svg.select(".errormessage").empty()).toBe(false);

      // Cycle 2: Recovery
      visual.update({
        dataViews: [validDataView],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });
      expect(visual.svg.select(".errormessage").empty()).toBe(true);

      element.remove();
    });

    it("should maintain visual structure after error recovery", () => {
      const element = testDom("500", "500");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      // Error state
      visual.update({
        dataViews: [],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      // Recovery
      const dataView = buildDataView({
        key: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        numerators: [10, 20, 15, 25, 18]
      });

      visual.update({
        dataViews: [dataView],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      // All groups should exist
      expect(visual.svg.select(".xaxisgroup").empty()).toBe(false);
      expect(visual.svg.select(".yaxisgroup").empty()).toBe(false);
      expect(visual.svg.select(".linesgroup").empty()).toBe(false);
      expect(visual.svg.select(".dotsgroup").empty()).toBe(false);

      element.remove();
    });
  });

  describe("Complex lifecycle scenarios", () => {
    it("should handle data → resize → data sequence", () => {
      const element = testDom("500", "500");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const dataView1 = buildDataView({
        key: ["Mon", "Tue", "Wed"],
        numerators: [10, 20, 15]
      });

      visual.update({
        dataViews: [dataView1],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      visual.update({
        dataViews: [dataView1],
        viewport: { width: 600, height: 500 },
        type: powerbi.VisualUpdateType.Resize
      });

      const dataView2 = buildDataView({
        key: ["Thu", "Fri", "Sat"],
        numerators: [25, 18, 22]
      });

      visual.update({
        dataViews: [dataView2],
        viewport: { width: 600, height: 500 },
        type: powerbi.VisualUpdateType.Data
      });

      expect(visual.svg.select(".dotsgroup").empty()).toBe(false);
      expect(visual.svg.attr("width")).toBe("600");

      element.remove();
    });

    it("should handle rapid sequential updates", () => {
      const element = testDom("500", "500");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      for (let i = 0; i < 10; i++) {
        const dataView = buildDataView({
          key: ["Mon", "Tue", "Wed"],
          numerators: [10 + i, 20 + i, 15 + i]
        });

        visual.update({
          dataViews: [dataView],
          viewport: { width: 500 + i * 10, height: 400 + i * 10 },
          type: powerbi.VisualUpdateType.Data
        });
      }

      // Should handle all updates without errors
      expect(visual.viewModel.inputData).toBeDefined();
      expect(visual.svg.attr("width")).toBe("590");

      element.remove();
    });
  });
});
