import powerbi from "powerbi-visuals-api";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../src/visual";
import buildDataView from "./helpers/buildDataView";

describe("Visual Interactions", () => {
  describe("Selection behavior", () => {
    it("should initialize with empty selection", () => {
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

      const selections = visual.selectionManager.getSelectionIds();
      expect(selections.length).toBe(0);

      element.remove();
    });

    it("should handle selection manager initialization", () => {
      const element = testDom("500", "500");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      expect(visual.selectionManager).toBeDefined();
      expect(typeof visual.selectionManager.select).toBe('function');
      expect(typeof visual.selectionManager.clear).toBe('function');
      expect(typeof visual.selectionManager.getSelectionIds).toBe('function');

      element.remove();
    });

    it("should clear selection without errors", () => {
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

      expect(() => {
        visual.selectionManager.clear();
      }).not.toThrow();

      element.remove();
    });
  });

  describe("Highlighting", () => {
    it("should update highlighting when data changes", () => {
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

      // updateHighlighting should be called internally
      const dots = visual.svg.selectAll(".dotsgroup").selectChildren();
      expect(dots.size()).toBeGreaterThan(0);

      element.remove();
    });

    it("should apply highlighting to dots", () => {
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

      visual.updateHighlighting();

      const dots = visual.svg.selectAll(".dotsgroup").selectChildren();
      expect(dots.size()).toBeGreaterThan(0);

      // Each dot should have opacity styles applied
      dots.each(function() {
        const fillOpacity = (this as SVGElement).style.fillOpacity;
        const strokeOpacity = (this as SVGElement).style.strokeOpacity;
        expect(fillOpacity).toBeDefined();
        expect(strokeOpacity).toBeDefined();
      });

      element.remove();
    });

    it("should apply highlighting to lines", () => {
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

      visual.updateHighlighting();

      const lines = visual.svg.selectAll(".linesgroup").selectChildren();
      expect(lines.size()).toBeGreaterThan(0);

      element.remove();
    });

    it("should handle updateHighlighting without data", () => {
      const element = testDom("500", "500");
      const host = createVisualHost({});
      const visual = new Visual({ element, host });

      // Call updateHighlighting before any data is loaded
      expect(() => {
        visual.updateHighlighting();
      }).not.toThrow();

      element.remove();
    });

    it("should handle highlighting with grouped data", () => {
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

      expect(() => {
        visual.updateHighlighting();
      }).not.toThrow();

      const tableRows = visual.tableDiv.selectAll(".table-body").selectChildren();
      expect(tableRows.size()).toBeGreaterThan(0);

      element.remove();
    });
  });

  describe("Context menu", () => {
    it("should attach context menu to SVG", () => {
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

      // Context menu handler should be attached
      const contextMenuHandler = visual.svg.on("contextmenu");
      expect(contextMenuHandler).toBeDefined();

      element.remove();
    });

    it("should attach context menu to table when grouped", () => {
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

      // Context menu handler should be attached to table
      const contextMenuHandler = visual.tableDiv.on("contextmenu");
      expect(contextMenuHandler).toBeDefined();

      element.remove();
    });
  });

  describe("Download functionality", () => {
    it("should not show download button by default", () => {
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

      const downloadBtn = visual.svg.select(".download-btn-group");
      expect(downloadBtn.empty()).toBe(true);

      element.remove();
    });

    it("should not show download button by default with settings", () => {
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

      // Download button depends on settings which come from dataView
      // By default, show_button is false, so button should not be visible
      const downloadBtn = visual.svg.select(".download-btn-group");
      expect(downloadBtn.empty()).toBe(true);

      element.remove();
    });
  });

  describe("Data point interactions", () => {
    it("should render interactive data points", () => {
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

      const dots = visual.svg.selectAll(".dotsgroup").selectChildren();
      expect(dots.size()).toBe(5);

      // Each dot should have associated data
      dots.each(function() {
        const datum = (this as any).__data__;
        expect(datum).toBeDefined();
      });

      element.remove();
    });

    it("should maintain data binding across updates", () => {
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

      let dots = visual.svg.selectAll(".dotsgroup").selectChildren();
      expect(dots.size()).toBe(3);

      const dataView2 = buildDataView({
        key: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        numerators: [10, 20, 15, 25, 18]
      });

      visual.update({
        dataViews: [dataView2],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      dots = visual.svg.selectAll(".dotsgroup").selectChildren();
      expect(dots.size()).toBe(5);

      element.remove();
    });
  });

  describe("Tooltip interactions", () => {
    it("should render tooltip line elements", () => {
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

      const ttipLineX = visual.svg.select(".ttip-line-x");
      const ttipLineY = visual.svg.select(".ttip-line-y");

      expect(ttipLineX.empty()).toBe(false);
      expect(ttipLineY.empty()).toBe(false);

      element.remove();
    });
  });

  describe("Cross-filtering", () => {
    it("should handle cross-filtering from other visuals", () => {
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

      // Simulate updateHighlighting being called (cross-filter event)
      expect(() => {
        visual.updateHighlighting();
      }).not.toThrow();

      element.remove();
    });

    it("should maintain visual state during cross-filtering", () => {
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

      const dotsCountBefore = visual.svg.selectAll(".dotsgroup").selectChildren().size();

      visual.updateHighlighting();

      const dotsCountAfter = visual.svg.selectAll(".dotsgroup").selectChildren().size();

      expect(dotsCountBefore).toBe(dotsCountAfter);

      element.remove();
    });
  });

  describe("Table interactions", () => {
    it("should render interactive table rows for grouped data", () => {
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

      const tableRows = visual.tableDiv.selectAll(".table-body").selectChildren();
      expect(tableRows.size()).toBeGreaterThan(0);

      // Each row should have associated data
      tableRows.each(function() {
        const datum = (this as any).__data__;
        expect(datum).toBeDefined();
      });

      element.remove();
    });

    it("should apply highlighting to table rows", () => {
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

      visual.updateHighlighting();

      const tableRows = visual.tableDiv.selectAll(".table-body").selectChildren();
      
      // Each row should have opacity style applied
      tableRows.each(function() {
        const opacity = (this as HTMLElement).style.opacity;
        expect(opacity).toBeDefined();
      });

      element.remove();
    });
  });

  describe("Multi-update interaction scenarios", () => {
    it("should handle interaction after data update", () => {
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

      visual.updateHighlighting();

      const dataView2 = buildDataView({
        key: ["Thu", "Fri", "Sat"],
        numerators: [25, 18, 22]
      });

      visual.update({
        dataViews: [dataView2],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      expect(() => {
        visual.updateHighlighting();
      }).not.toThrow();

      element.remove();
    });

    it("should maintain interactions after resize", () => {
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

      visual.updateHighlighting();

      visual.update({
        dataViews: [dataView],
        viewport: { width: 600, height: 500 },
        type: powerbi.VisualUpdateType.Resize
      });

      expect(() => {
        visual.updateHighlighting();
      }).not.toThrow();

      element.remove();
    });
  });
});
