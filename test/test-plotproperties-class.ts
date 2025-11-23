/**
 * Test Extension Plan - Session 6
 * Class & ViewModel Integration Tests - Part 2 (Plot Properties)
 * 
 * Tests for plotPropertiesClass:
 * - Scale initialization (xScale, yScale)
 * - Padding calculations
 * - Axis configuration
 * - Display plot determination
 */

import plotPropertiesClass from "../src/Classes/plotPropertiesClass";
import viewModelClass from "../src/Classes/viewModelClass";
import { createVisualHost } from "powerbi-visuals-utils-testutils";
import buildDataView from "./helpers/buildDataView";
import powerbi from "powerbi-visuals-api";

describe("plotPropertiesClass", () => {

  describe("initialiseScale()", () => {

    it("should create xScale with correct domain and range", () => {
      const plotProps = new plotPropertiesClass();
      plotProps.xAxis = {
        lower: 0,
        upper: 10,
        start_padding: 50,
        end_padding: 20,
        colour: "#000",
        ticks: true,
        tick_size: "12px",
        tick_font: "Arial",
        tick_colour: "#000",
        tick_rotation: 0,
        tick_count: 10,
        label: "X Axis",
        label_size: "14px",
        label_font: "Arial",
        label_colour: "#000"
      };
      plotProps.yAxis = {
        lower: 0,
        upper: 100,
        start_padding: 30,
        end_padding: 10,
        colour: "#000",
        ticks: true,
        tick_size: "12px",
        tick_font: "Arial",
        tick_colour: "#000",
        tick_rotation: 0,
        tick_count: 10,
        label: "Y Axis",
        label_size: "14px",
        label_font: "Arial",
        label_colour: "#000"
      };
      
      plotProps.initialiseScale(500, 400);
      
      expect(plotProps.xScale).toBeDefined();
      expect(plotProps.yScale).toBeDefined();
      expect(plotProps.xScale.domain()).toEqual([0, 10]);
      expect(plotProps.xScale.range()).toEqual([50, 480]); // 500 - 20
      expect(plotProps.yScale.domain()).toEqual([0, 100]);
      expect(plotProps.yScale.range()).toEqual([370, 10]); // 400 - 30, inverted for SVG
    });

    it("should handle negative domain values", () => {
      const plotProps = new plotPropertiesClass();
      plotProps.xAxis = {
        lower: -5,
        upper: 5,
        start_padding: 0,
        end_padding: 0,
        colour: "#000",
        ticks: true,
        tick_size: "12px",
        tick_font: "Arial",
        tick_colour: "#000",
        tick_rotation: 0,
        tick_count: 10,
        label: "",
        label_size: "14px",
        label_font: "Arial",
        label_colour: "#000"
      };
      plotProps.yAxis = {
        lower: -10,
        upper: 10,
        start_padding: 0,
        end_padding: 0,
        colour: "#000",
        ticks: true,
        tick_size: "12px",
        tick_font: "Arial",
        tick_colour: "#000",
        tick_rotation: 0,
        tick_count: 10,
        label: "",
        label_size: "14px",
        label_font: "Arial",
        label_colour: "#000"
      };
      
      plotProps.initialiseScale(300, 200);
      
      expect(plotProps.xScale.domain()).toEqual([-5, 5]);
      expect(plotProps.yScale.domain()).toEqual([-10, 10]);
      expect(plotProps.xScale(0)).toBe(150); // Middle of range
      expect(plotProps.yScale(0)).toBe(100); // Middle of range
    });

    it("should update scales when called multiple times", () => {
      const plotProps = new plotPropertiesClass();
      plotProps.xAxis = {
        lower: 0,
        upper: 10,
        start_padding: 0,
        end_padding: 0,
        colour: "#000",
        ticks: true,
        tick_size: "12px",
        tick_font: "Arial",
        tick_colour: "#000",
        tick_rotation: 0,
        tick_count: 10,
        label: "",
        label_size: "14px",
        label_font: "Arial",
        label_colour: "#000"
      };
      plotProps.yAxis = {
        lower: 0,
        upper: 100,
        start_padding: 0,
        end_padding: 0,
        colour: "#000",
        ticks: true,
        tick_size: "12px",
        tick_font: "Arial",
        tick_colour: "#000",
        tick_rotation: 0,
        tick_count: 10,
        label: "",
        label_size: "14px",
        label_font: "Arial",
        label_colour: "#000"
      };
      
      plotProps.initialiseScale(400, 300);
      expect(plotProps.xScale.range()).toEqual([0, 400]);
      
      // Resize
      plotProps.initialiseScale(600, 400);
      expect(plotProps.xScale.range()).toEqual([0, 600]);
      expect(plotProps.yScale.range()).toEqual([400, 0]);
    });

  });

  describe("update()", () => {

    it("should set displayPlot to true when plotPoints has more than 1 element", () => {
      const plotProps = new plotPropertiesClass();
      const viewModel = new viewModelClass();
      const host = createVisualHost({});
      
      // Initialize view model with valid data
      const keys = ["Mon", "Tue", "Wed"];
      const numerators = [10, 20, 30];
      viewModel.update({
        dataViews: [buildDataView({ key: keys, numerators: numerators })],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      }, host);
      
      plotProps.update({
        dataViews: [buildDataView({ key: keys, numerators: numerators })],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      }, viewModel);
      
      expect(plotProps.displayPlot).toBe(true);
    });

    it("should set displayPlot to false when plotPoints has 1 or fewer elements", () => {
      const plotProps = new plotPropertiesClass();
      const viewModel = new viewModelClass();
      const host = createVisualHost({});
      
      // Initialize view model with only 1 data point
      const keys = ["Mon"];
      const numerators = [10];
      viewModel.update({
        dataViews: [buildDataView({ key: keys, numerators: numerators })],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      }, host);
      
      plotProps.update({
        dataViews: [buildDataView({ key: keys, numerators: numerators })],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      }, viewModel);
      
      expect(plotProps.displayPlot).toBe(false);
    });

    it("should initialize xAxis and yAxis properties", () => {
      const plotProps = new plotPropertiesClass();
      const viewModel = new viewModelClass();
      const host = createVisualHost({});
      
      const keys = ["Mon", "Tue", "Wed"];
      const numerators = [10, 20, 30];
      viewModel.update({
        dataViews: [buildDataView({ key: keys, numerators: numerators })],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      }, host);
      
      plotProps.update({
        dataViews: [buildDataView({ key: keys, numerators: numerators })],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      }, viewModel);
      
      expect(plotProps.xAxis).toBeDefined();
      expect(plotProps.yAxis).toBeDefined();
      expect(plotProps.xAxis.lower).toBeDefined();
      expect(plotProps.xAxis.upper).toBeDefined();
      expect(plotProps.yAxis.lower).toBeDefined();
      expect(plotProps.yAxis.upper).toBeDefined();
    });

    it("should calculate padding based on label settings", () => {
      const plotProps = new plotPropertiesClass();
      const viewModel = new viewModelClass();
      const host = createVisualHost({});
      
      const keys = ["Mon", "Tue", "Wed"];
      const numerators = [10, 20, 30];
      viewModel.update({
        dataViews: [buildDataView({ key: keys, numerators: numerators })],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      }, host);
      
      plotProps.update({
        dataViews: [buildDataView({ key: keys, numerators: numerators })],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      }, viewModel);
      
      // Verify padding is a number
      expect(typeof plotProps.xAxis.start_padding).toBe("number");
      expect(typeof plotProps.xAxis.end_padding).toBe("number");
      expect(typeof plotProps.yAxis.start_padding).toBe("number");
      expect(typeof plotProps.yAxis.end_padding).toBe("number");
      
      // Verify padding is non-negative
      expect(plotProps.xAxis.start_padding).toBeGreaterThanOrEqual(0);
      expect(plotProps.xAxis.end_padding).toBeGreaterThanOrEqual(0);
      expect(plotProps.yAxis.start_padding).toBeGreaterThanOrEqual(0);
      expect(plotProps.yAxis.end_padding).toBeGreaterThanOrEqual(0);
    });

  });

});
