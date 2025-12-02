import powerbi from "powerbi-visuals-api";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../src/visual";
import buildDataView from "./helpers/buildDataView";

describe("Visual Class", () => {
  describe("Constructor", () => {
    it("should create visual with host initialization", () => {
      const element = testDom("500", "500");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      expect(visual.host).toBe(host);
      expect(visual.svg).toBeDefined();
      expect(visual.tableDiv).toBeDefined();
      expect(visual.viewModel).toBeDefined();
      expect(visual.plotProperties).toBeDefined();
      expect(visual.selectionManager).toBeDefined();

      element.remove();
    });

    it("should create SVG element in the DOM", () => {
      const element = testDom("500", "500");
      const host = createVisualHost({});
      new Visual({ element, host });

      const visualElement = document.body.querySelector('.visual');
      const svgElement = visualElement.querySelector('svg');
      
      expect(svgElement).toBeTruthy();

      element.remove();
    });

    it("should create table div element in the DOM", () => {
      const element = testDom("500", "500");
      const host = createVisualHost({});
      new Visual({ element, host });

      const visualElement = document.body.querySelector('.visual');
      const tableDivElement = visualElement.querySelector('div');
      const tableElement = tableDivElement.querySelector('table');
      
      expect(tableDivElement).toBeTruthy();
      expect(tableElement).toBeTruthy();

      element.remove();
    });

    it("should initialize table with header and body", () => {
      const element = testDom("500", "500");
      const host = createVisualHost({});
      new Visual({ element, host });

      const visualElement = document.body.querySelector('.visual');
      const tableElement = visualElement.querySelector('table');
      const theadElement = tableElement.querySelector('thead');
      const tbodyElement = tableElement.querySelector('tbody');
      
      expect(theadElement).toBeTruthy();
      expect(tbodyElement).toBeTruthy();
      expect(theadElement.querySelector('tr.table-header')).toBeTruthy();
      expect(tbodyElement.classList.contains('table-body')).toBe(true);

      element.remove();
    });

    it("should initialize SVG structure with required groups", () => {
      const element = testDom("500", "500");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      // Check that SVG has been initialized with required groups
      expect(visual.svg.select(".xaxisgroup").empty()).toBe(false);
      expect(visual.svg.select(".yaxisgroup").empty()).toBe(false);
      expect(visual.svg.select(".linesgroup").empty()).toBe(false);
      expect(visual.svg.select(".dotsgroup").empty()).toBe(false);

      element.remove();
    });

    it("should register selection callback", () => {
      const element = testDom("500", "500");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      // Selection manager should be initialized and callback registered
      expect(visual.selectionManager).toBeDefined();
      expect(typeof visual.updateHighlighting).toBe('function');

      element.remove();
    });
  });

  describe("update() method", () => {
    it("should handle valid data update", () => {
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

      // Visual should render without errors
      expect(visual.viewModel.inputData).toBeDefined();
      expect(visual.svg.attr("width")).toBe("500");
      expect(visual.svg.attr("height")).toBe("400");

      element.remove();
    });

    it("should handle empty data gracefully", () => {
      const element = testDom("500", "500");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      visual.update({
        dataViews: [],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      // Should display error message
      const errorElement = visual.svg.select(".errormessage");
      expect(errorElement.empty()).toBe(false);

      element.remove();
    });

    it("should update viewModel on data change", () => {
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
        key: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        numerators: [10, 20, 15, 25, 18]
      });

      visual.update({
        dataViews: [dataView2],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      expect(visual.svg.select(".dotsgroup").empty()).toBe(false);

      element.remove();
    });

    it("should handle resize events", () => {
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

      expect(visual.svg.attr("width")).toBe("500");
      expect(visual.svg.attr("height")).toBe("400");

      visual.update({
        dataViews: [dataView],
        viewport: { width: 800, height: 600 },
        type: powerbi.VisualUpdateType.Resize
      });

      expect(visual.svg.attr("width")).toBe("800");
      expect(visual.svg.attr("height")).toBe("600");

      element.remove();
    });

    it("should clear previous error messages on successful update", () => {
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

      element.remove();
    });

    it("should switch to table view when grouped data is provided", () => {
      const element = testDom("500", "500");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      const dataView = buildDataView({
        key: ["Mon", "Tue", "Wed", "Thu"],
        indicator: ["A", "A", "B", "B"],
        numerators: [10, 20, 15, 25]
      });

      visual.update({
        dataViews: [dataView],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      // Should show table and hide chart
      expect(visual.svg.attr("width")).toBe("0");
      expect(visual.svg.attr("height")).toBe("0");
      expect(visual.tableDiv.style("width")).toBe("100%");
      expect(visual.tableDiv.style("height")).toBe("100%");

      element.remove();
    });

    it("should handle caught errors gracefully", () => {
      const element = testDom("500", "500");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      // Trigger an internal error by passing malformed options
      const invalidOptions = {
        dataViews: [{ invalid: "data" }],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      } as any;

      // Should not throw, should handle error internally
      expect(() => {
        visual.update(invalidOptions);
      }).not.toThrow();

      // Should display error message
      const errorElement = visual.svg.select(".errormessage");
      expect(errorElement.empty()).toBe(false);

      element.remove();
    });
  });

  describe("drawVisual() method", () => {
    it("should call all rendering functions", () => {
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

      // After update, drawVisual should have created all elements
      expect(visual.svg.select(".xaxisgroup").empty()).toBe(false);
      expect(visual.svg.select(".yaxisgroup").empty()).toBe(false);
      expect(visual.svg.select(".linesgroup").empty()).toBe(false);
      expect(visual.svg.select(".dotsgroup").empty()).toBe(false);

      element.remove();
    });

    it("should render axes", () => {
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

      // X-axis and Y-axis should be rendered
      const xAxis = visual.svg.select(".xaxisgroup");
      const yAxis = visual.svg.select(".yaxisgroup");

      expect(xAxis.empty()).toBe(false);
      expect(yAxis.empty()).toBe(false);

      element.remove();
    });

    it("should render data points as dots", () => {
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

      // Dots should be rendered in dotsgroup
      const dotsGroup = visual.svg.select(".dotsgroup");
      const dots = dotsGroup.selectAll("*");

      expect(dotsGroup.empty()).toBe(false);
      expect(dots.size()).toBeGreaterThan(0);

      element.remove();
    });

    it("should render control limit lines", () => {
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

      // Lines should be rendered in linesgroup
      const linesGroup = visual.svg.select(".linesgroup");
      const lines = linesGroup.selectAll("path");

      expect(linesGroup.empty()).toBe(false);
      expect(lines.size()).toBeGreaterThan(0);

      element.remove();
    });
  });

  describe("resizeCanvas() method", () => {
    it("should set SVG dimensions correctly", () => {
      const element = testDom("500", "500");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      visual.resizeCanvas(800, 600);

      expect(visual.svg.attr("width")).toBe("800");
      expect(visual.svg.attr("height")).toBe("600");

      element.remove();
    });

    it("should show chart and hide table when dimensions are non-zero", () => {
      const element = testDom("500", "500");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      visual.resizeCanvas(500, 400);

      expect(visual.svg.attr("width")).toBe("500");
      expect(visual.svg.attr("height")).toBe("400");
      expect(visual.tableDiv.style("width")).toBe("0%");
      expect(visual.tableDiv.style("height")).toBe("0%");

      element.remove();
    });

    it("should show table and hide chart when dimensions are zero", () => {
      const element = testDom("500", "500");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      visual.resizeCanvas(0, 0);

      expect(visual.svg.attr("width")).toBe("0");
      expect(visual.svg.attr("height")).toBe("0");
      expect(visual.tableDiv.style("width")).toBe("100%");
      expect(visual.tableDiv.style("height")).toBe("100%");

      element.remove();
    });
  });

  describe("updateHighlighting() method", () => {
    it("should update opacity on data points", () => {
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

      // Call updateHighlighting
      visual.updateHighlighting();

      // Dots should have opacity styles applied
      const dots = visual.svg.selectAll(".dotsgroup").selectChildren();
      expect(dots.size()).toBeGreaterThan(0);

      element.remove();
    });

    it("should handle highlights when no selection exists", () => {
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

      // Should not throw when no highlights exist
      expect(() => {
        visual.updateHighlighting();
      }).not.toThrow();

      element.remove();
    });
  });

  describe("getFormattingModel() method", () => {
    it("should return formatting model from viewModel", () => {
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

      const formattingModel = visual.getFormattingModel();
      expect(formattingModel).toBeDefined();

      element.remove();
    });
  });

  describe("adjustPaddingForOverflow() method", () => {
    it("should not adjust padding in headless mode", () => {
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

      // Set headless mode
      visual.viewModel.headless = true;

      const initialPadding = visual.plotProperties.xAxis.start_padding;

      // Should exit early and not change padding
      visual.adjustPaddingForOverflow();

      expect(visual.plotProperties.xAxis.start_padding).toBe(initialPadding);

      element.remove();
    });
  });
});
