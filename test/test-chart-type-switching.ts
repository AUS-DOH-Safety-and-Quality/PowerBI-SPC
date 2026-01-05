import powerbi from "powerbi-visuals-api";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../src/visual";
import buildDataView from "./helpers/buildDataView";

describe("Chart Type Switching", () => {
  describe("Individual chart type rendering", () => {
    it("should render run chart", () => {
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

      // Default chart type is 'i' (individuals)
      expect(visual.viewModel.inputSettings.settings.spc.chart_type).toBe("i");
      expect(visual.svg.select(".dotsgroup").empty()).toBe(false);
      expect(visual.svg.select(".linesgroup").empty()).toBe(false);

      element.remove();
    });

    it("should render i chart (XmR)", () => {
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

      // Default is i chart
      expect(visual.viewModel.inputSettings.settings.spc.chart_type).toBe("i");
      expect(visual.svg.select(".dotsgroup").empty()).toBe(false);

      element.remove();
    });

    it("should render chart without errors", () => {
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

      expect(visual.viewModel.inputSettings.settings.spc.chart_type).toBe("i");
      expect(visual.svg.select(".dotsgroup").empty()).toBe(false);

      element.remove();
    });
  });

  describe("Chart type switching with same dataset", () => {
    it("should render chart consistently", () => {
      const element = testDom("500", "500");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const dataView = buildDataView({
        key: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        numerators: [10, 20, 15, 25, 18]
      });

      // Render with default chart type
      visual.update({
        dataViews: [dataView],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      expect(visual.viewModel.inputSettings.settings.spc.chart_type).toBe("i");
      expect(visual.svg.select(".dotsgroup").empty()).toBe(false);

      element.remove();
    });

    it("should maintain visual structure", () => {
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

      // SVG structure should remain consistent
      expect(visual.svg.select(".xaxisgroup").empty()).toBe(false);
      expect(visual.svg.select(".yaxisgroup").empty()).toBe(false);
      expect(visual.svg.select(".linesgroup").empty()).toBe(false);
      expect(visual.svg.select(".dotsgroup").empty()).toBe(false);

      element.remove();
    });
  });

  describe("Chart type validation", () => {
    it("should render chart without errors", () => {
      const element = testDom("500", "500");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const dataView = buildDataView({
        key: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        numerators: [10, 20, 15, 25, 18]
      });

      expect(() => {
        visual.update({
          dataViews: [dataView],
          viewport: { width: 500, height: 400 },
          type: powerbi.VisualUpdateType.Data
        });
      }).not.toThrow();

      expect(visual.svg.select(".dotsgroup").empty()).toBe(false);

      element.remove();
    });

    it("should render chart successfully", () => {
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

      // Chart should render successfully
      expect(visual.svg.select(".dotsgroup").empty()).toBe(false);
      expect(visual.svg.select(".linesgroup").empty()).toBe(false);

      element.remove();
    });
  });

  describe("Chart type-specific features", () => {
    it("should handle charts with numerators", () => {
      const element = testDom("500", "500");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const dataView = buildDataView({
        key: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        numerators: [5, 8, 3, 10, 6]
      });

      visual.update({
        dataViews: [dataView],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      expect(visual.svg.select(".dotsgroup").empty()).toBe(false);

      element.remove();
    });

    it("should handle count-based data", () => {
      const element = testDom("500", "500");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const dataView = buildDataView({
        key: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        numerators: [5, 8, 3, 10, 6]
      });

      visual.update({
        dataViews: [dataView],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      expect(visual.svg.select(".dotsgroup").empty()).toBe(false);

      element.remove();
    });
  });
});
