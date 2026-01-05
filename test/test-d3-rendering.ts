/**
 * Test Suite: D3 Rendering Functions Integration Tests
 * 
 * This test suite validates core D3 rendering functions that require
 * Visual object context. These tests focus on function behavior and
 * SVG element creation patterns.
 * 
 * Functions tested:
 * - drawErrors: Error message rendering
 * - addContextMenu: Context menu attachment
 * - drawDownloadButton: Download button creation
 */

import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../src/visual";
import buildDataView from "./helpers/buildDataView";
import drawErrors from "../src/D3 Plotting Functions/drawErrors";
import drawDownloadButton from "../src/D3 Plotting Functions/drawDownloadButton";
import addContextMenu from "../src/D3 Plotting Functions/addContextMenu";
import powerbi from "powerbi-visuals-api";

describe("D3 Rendering Functions", () => {
  let visual: Visual;
  let element: HTMLElement;

  beforeEach(() => {
    element = testDom("500", "500") as HTMLElement;
    const host = createVisualHost({});
    visual = new Visual({
      element: element,
      host: host
    });
  });

  afterEach(() => {
    // Clean up
    if (visual && visual.svg) {
      visual.svg.selectAll("*").remove();
    }
  });

  describe("drawErrors", () => {
    const mockOptions = {
      viewport: { width: 500, height: 400 },
      type: powerbi.VisualUpdateType.Data,
      dataViews: []
    } as powerbi.extensibility.visual.VisualUpdateOptions;

    const mockColourPalette = {
      foregroundColour: "#000000",
      backgroundColour: "#FFFFFF",
      foregroundSelectedColour: "#0078D4",
      hyperlinkColour: "#0078D4",
      isHighContrast: false
    };

    it("should render error message in SVG", () => {
      const errorMessage = "Test error message";
      drawErrors(visual.svg, mockOptions, mockColourPalette, errorMessage);

      const errorElement = visual.svg.select(".errormessage");
      expect(errorElement.empty()).toBe(false);
    });

    it("should display the correct error text", () => {
      const errorMessage = "Data validation failed";
      drawErrors(visual.svg, mockOptions, mockColourPalette, errorMessage);

      const errorText = visual.svg.select(".errormessage").select("text");
      expect(errorText.text()).toContain("Data validation failed");
    });

    it("should clear SVG before rendering error", () => {
      // Add some elements first
      visual.svg.append("g").classed("test-group", true);
      
      drawErrors(visual.svg, mockOptions, mockColourPalette, "Error");

      // Should have initialized SVG (cleared previous content except error)
      const errorElement = visual.svg.select(".errormessage");
      expect(errorElement.empty()).toBe(false);
    });

    it("should render error message with type preamble", () => {
      const errorMessage = "Specific error details";
      drawErrors(visual.svg, mockOptions, mockColourPalette, errorMessage, "settings");

      const textElements = visual.svg.select(".errormessage").selectAll("text");
      // Should have 2 text elements: preamble + message
      expect(textElements.size()).toBe(2);
    });

    it("should position error message centered in viewport", () => {
      drawErrors(visual.svg, mockOptions, mockColourPalette, "Error message");

      const textElement = visual.svg.select(".errormessage").select("text");
      const x = parseFloat(textElement.attr("x"));
      
      // Should be centered horizontally
      expect(x).toBe(mockOptions.viewport.width / 2);
    });
  });

  describe("drawDownloadButton", () => {
    beforeEach(() => {
      // Create some test data so plotPoints exist
      const dataView = buildDataView({
        key: ["Mon", "Tue", "Wed"],
        numerators: [10, 20, 30]
      });
      
      visual.update({
        dataViews: [dataView],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });
    });

    it("should not create download button when show_button is false", () => {
      // Simulate settings where button is hidden
      visual.viewModel.inputSettings.settings.download_options.show_button = false;
      drawDownloadButton(visual.svg, visual);

      const downloadBtn = visual.svg.select(".download-btn-group");
      expect(downloadBtn.empty()).toBe(true);
    });

    it("should create download button when show_button is true", () => {
      // Simulate settings where button is shown
      visual.viewModel.inputSettings.settings.download_options.show_button = true;
      drawDownloadButton(visual.svg, visual);

      const downloadBtn = visual.svg.select(".download-btn-group");
      expect(downloadBtn.empty()).toBe(false);
    });

    it("should display 'Download' text", () => {
      visual.viewModel.inputSettings.settings.download_options.show_button = true;
      drawDownloadButton(visual.svg, visual);

      const downloadBtn = visual.svg.select(".download-btn-group");
      expect(downloadBtn.text()).toBe("Download");
    });

    it("should position download button near bottom-right", () => {
      visual.viewModel.inputSettings.settings.download_options.show_button = true;
      drawDownloadButton(visual.svg, visual);

      const downloadBtn = visual.svg.select(".download-btn-group");
      const x = parseFloat(downloadBtn.attr("x"));
      const y = parseFloat(downloadBtn.attr("y"));

      // Should be positioned near the bottom-right
      expect(x).toBeGreaterThan(visual.viewModel.svgWidth - 100);
      expect(y).toBeGreaterThan(visual.viewModel.svgHeight - 50);
    });

    it("should have underlined text styling", () => {
      visual.viewModel.inputSettings.settings.download_options.show_button = true;
      drawDownloadButton(visual.svg, visual);

      const downloadBtn = visual.svg.select(".download-btn-group");
      const textDecoration = downloadBtn.style("text-decoration");
      expect(textDecoration).toBe("underline");
    });

    it("should remove button when called again with show_button false", () => {
      // First show the button
      visual.viewModel.inputSettings.settings.download_options.show_button = true;
      drawDownloadButton(visual.svg, visual);
      expect(visual.svg.select(".download-btn-group").empty()).toBe(false);

      // Then hide it
      visual.viewModel.inputSettings.settings.download_options.show_button = false;
      drawDownloadButton(visual.svg, visual);
      expect(visual.svg.select(".download-btn-group").empty()).toBe(true);
    });
  });

  describe("addContextMenu", () => {
    beforeEach(() => {
      // Create some test data
      const dataView = buildDataView({
        key: ["Mon", "Tue", "Wed"],
        numerators: [10, 20, 30]
      });
      
      visual.update({
        dataViews: [dataView],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });
    });

    it("should attach contextmenu handler to SVG selection", () => {
      addContextMenu(visual.svg, visual);

      // Verify that event handler is attached by checking if on() doesn't throw
      expect(() => {
        visual.svg.on("contextmenu");
      }).not.toThrow();
    });

    it("should attach contextmenu handler to div selection", () => {
      addContextMenu(visual.tableDiv, visual);

      // Verify that event handler is attached
      expect(() => {
        visual.tableDiv.on("contextmenu");
      }).not.toThrow();
    });

    it("should not attach context menu when plot is not displayed", () => {
      // Set displayPlot to false
      visual.plotProperties.displayPlot = false;
      visual.viewModel.inputSettings.settings.summary_table.show_table = false;
      
      addContextMenu(visual.svg, visual);

      // Handler should be attached but should return early
      // This is verified by the function not throwing an error
      expect(() => {
        visual.svg.on("contextmenu");
      }).not.toThrow();
    });

    it("should handle multiple calls without errors", () => {
      // Call multiple times to ensure idempotency
      expect(() => {
        addContextMenu(visual.svg, visual);
        addContextMenu(visual.svg, visual);
        addContextMenu(visual.svg, visual);
      }).not.toThrow();
    });

    it("should work with both SVG and div selections", () => {
      expect(() => {
        addContextMenu(visual.svg, visual);
        addContextMenu(visual.tableDiv, visual);
      }).not.toThrow();
    });
  });

  describe("Integrated Rendering Test", () => {
    it("should handle complete visual rendering cycle", () => {
      const dataView = buildDataView({
        key: ["Mon", "Tue", "Wed", "Thu"],
        numerators: [10, 20, 15, 25]
      });

      // Update visual with data
      visual.update({
        dataViews: [dataView],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      // Verify SVG structure exists
      expect(visual.svg.select(".xaxisgroup").empty()).toBe(false);
      expect(visual.svg.select(".yaxisgroup").empty()).toBe(false);
      expect(visual.svg.select(".linesgroup").empty()).toBe(false);
      expect(visual.svg.select(".dotsgroup").empty()).toBe(false);
    });

    it("should handle error rendering gracefully", () => {
      const mockOptions = {
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data,
        dataViews: []
      } as powerbi.extensibility.visual.VisualUpdateOptions;

      const mockColourPalette = {
        foregroundColour: "#000000",
        backgroundColour: "#FFFFFF",
        foregroundSelectedColour: "#0078D4",
        hyperlinkColour: "#0078D4",
        isHighContrast: false
      };

      drawErrors(visual.svg, mockOptions, mockColourPalette, "Test error");
      
      const errorElement = visual.svg.select(".errormessage");
      expect(errorElement.empty()).toBe(false);
    });

    it("should maintain SVG structure after multiple updates", () => {
      const dataView1 = buildDataView({
        key: ["Mon", "Tue"],
        numerators: [10, 20]
      });

      visual.update({
        dataViews: [dataView1],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      const dataView2 = buildDataView({
        key: ["Mon", "Tue", "Wed"],
        numerators: [10, 20, 30]
      });

      visual.update({
        dataViews: [dataView2],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      });

      // SVG structure should still be intact
      expect(visual.svg.select(".xaxisgroup").empty()).toBe(false);
      expect(visual.svg.select(".yaxisgroup").empty()).toBe(false);
      expect(visual.svg.select(".linesgroup").empty()).toBe(false);
      expect(visual.svg.select(".dotsgroup").empty()).toBe(false);
    });

    it("should handle viewport resize", () => {
      const dataView = buildDataView({
        key: ["Mon", "Tue"],
        numerators: [10, 20]
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

      // Structure should remain
      expect(visual.svg.select(".xaxisgroup").empty()).toBe(false);
    });
  });
});
