/**
 * Test Extension Plan - Session 6
 * Class & ViewModel Integration Tests - Part 4 (ViewModel)
 * 
 * Tests for viewModelClass:
 * - Constructor initialization
 * - Update method with valid data
 * - Update method with invalid data
 * - Grouped vs ungrouped data handling
 * - Validation error handling
 */

import viewModelClass from "../src/Classes/viewModelClass";
import { createVisualHost } from "powerbi-visuals-utils-testutils";
import buildDataView from "./helpers/buildDataView";
import powerbi from "powerbi-visuals-api";

describe("viewModelClass", () => {

  describe("constructor", () => {

    it("should initialize with default values", () => {
      const viewModel = new viewModelClass();
      
      expect(viewModel.inputData).toBeNull();
      expect(viewModel.controlLimits).toBeNull();
      expect(viewModel.plotPoints).toEqual([]);
      expect(viewModel.groupedLines).toEqual([]);
      expect(viewModel.firstRun).toBe(true);
      expect(viewModel.splitIndexes).toEqual([]);
      expect(viewModel.headless).toBe(false);
      expect(viewModel.frontend).toBe(false);
    });

    it("should initialize inputSettings", () => {
      const viewModel = new viewModelClass();
      
      expect(viewModel.inputSettings).toBeDefined();
    });

  });

  describe("update() method - valid data", () => {

    it("should update successfully with valid ungrouped data", () => {
      const viewModel = new viewModelClass();
      const host = createVisualHost({});
      const keys = ["Mon", "Tue", "Wed", "Thu", "Fri"];
      const numerators = [10, 20, 15, 25, 18];
      
      const result = viewModel.update({
        dataViews: [buildDataView({ key: keys, numerators: numerators })],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      }, host);
      
      expect(result.status).toBe(true);
      expect(viewModel.firstRun).toBe(false);
      expect(viewModel.inputData).toBeDefined();
      expect(viewModel.controlLimits).toBeDefined();
    });

    it("should populate plotPoints for valid data", () => {
      const viewModel = new viewModelClass();
      const host = createVisualHost({});
      const keys = ["Mon", "Tue", "Wed"];
      const numerators = [10, 20, 30];
      
      viewModel.update({
        dataViews: [buildDataView({ key: keys, numerators: numerators })],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      }, host);
      
      expect(viewModel.plotPoints).toBeDefined();
      expect(viewModel.plotPoints.length).toBeGreaterThan(0);
    });

    it("should set viewport dimensions", () => {
      const viewModel = new viewModelClass();
      const host = createVisualHost({});
      const keys = ["Mon", "Tue", "Wed"];
      const numerators = [10, 20, 30];
      
      viewModel.update({
        dataViews: [buildDataView({ key: keys, numerators: numerators })],
        viewport: { width: 600, height: 450 },
        type: powerbi.VisualUpdateType.Data
      }, host);
      
      expect(viewModel.svgWidth).toBe(600);
      expect(viewModel.svgHeight).toBe(450);
    });

    it("should set viewport dimensions and other options", () => {
      const viewModel = new viewModelClass();
      const host = createVisualHost({});
      const keys = ["Mon", "Tue", "Wed"];
      const numerators = [10, 20, 30];
      
      viewModel.update({
        dataViews: [buildDataView({ key: keys, numerators: numerators })],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      }, host);
      
      // Verify viewport is set
      expect(viewModel.svgWidth).toBe(500);
      expect(viewModel.svgHeight).toBe(400);
      
      // Colour palette should be initialized
      expect(viewModel.colourPalette).toBeDefined();
    });

  });

  describe("update() method - grouped data", () => {

    it("should handle grouped data correctly", () => {
      const viewModel = new viewModelClass();
      const host = createVisualHost({});
      const keys = ["Mon", "Tue", "Wed", "Thu"];
      const indicators = ["A", "A", "B", "B"];
      const numerators = [10, 20, 30, 40];
      
      const result = viewModel.update({
        dataViews: [buildDataView({ key: keys, indicator: indicators, numerators: numerators })],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      }, host);
      
      expect(result.status).toBe(true);
      expect(viewModel.showGrouped).toBe(true);
      expect(viewModel.groupNames).toBeDefined();
      expect(viewModel.groupNames.length).toBeGreaterThan(0);
    });

    it("should create separate limits for each group", () => {
      const viewModel = new viewModelClass();
      const host = createVisualHost({});
      const keys = ["Mon", "Tue", "Wed", "Thu"];
      const indicators = ["A", "A", "B", "B"];
      const numerators = [10, 20, 30, 40];
      
      viewModel.update({
        dataViews: [buildDataView({ key: keys, indicator: indicators, numerators: numerators })],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      }, host);
      
      expect(viewModel.controlLimitsGrouped).toBeDefined();
      expect(viewModel.controlLimitsGrouped.length).toBe(2);
    });

    it("should set showGrouped to false for ungrouped data", () => {
      const viewModel = new viewModelClass();
      const host = createVisualHost({});
      const keys = ["Mon", "Tue", "Wed"];
      const numerators = [10, 20, 30];
      
      viewModel.update({
        dataViews: [buildDataView({ key: keys, numerators: numerators })],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      }, host);
      
      expect(viewModel.showGrouped).toBe(false);
    });

  });

  describe("getGroupingIndexes() method", () => {

    it("should create grouping indexes correctly", () => {
      const viewModel = new viewModelClass();
      const host = createVisualHost({});
      const keys = ["Mon", "Tue", "Wed", "Thu", "Fri"];
      const numerators = [10, 20, 30, 40, 50];
      
      viewModel.update({
        dataViews: [buildDataView({ key: keys, numerators: numerators })],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      }, host);
      
      const groupIndexes = viewModel.getGroupingIndexes(viewModel.inputData);
      
      expect(groupIndexes).toBeDefined();
      expect(Array.isArray(groupIndexes)).toBe(true);
      expect(groupIndexes.length).toBeGreaterThan(0);
    });

    it("should handle split indexes parameter", () => {
      const viewModel = new viewModelClass();
      const host = createVisualHost({});
      const keys = ["Mon", "Tue", "Wed", "Thu", "Fri"];
      const numerators = [10, 20, 30, 40, 50];
      
      viewModel.update({
        dataViews: [buildDataView({ key: keys, numerators: numerators })],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      }, host);
      
      const groupIndexes = viewModel.getGroupingIndexes(viewModel.inputData, [2]);
      
      expect(groupIndexes).toBeDefined();
      expect(groupIndexes.length).toBeGreaterThan(1); // Should be split
    });

  });

  describe("calculateLimits() method", () => {

    it("should calculate control limits for valid data", () => {
      const viewModel = new viewModelClass();
      const host = createVisualHost({});
      const keys = ["Mon", "Tue", "Wed", "Thu", "Fri"];
      const numerators = [10, 20, 15, 25, 18];
      
      viewModel.update({
        dataViews: [buildDataView({ key: keys, numerators: numerators })],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      }, host);
      
      expect(viewModel.controlLimits).toBeDefined();
      expect(viewModel.controlLimits.values).toBeDefined();
      expect(viewModel.controlLimits.keys).toBeDefined();
    });

    it("should include upper and lower limits", () => {
      const viewModel = new viewModelClass();
      const host = createVisualHost({});
      const keys = ["Mon", "Tue", "Wed", "Thu", "Fri"];
      const numerators = [10, 20, 15, 25, 18];
      
      viewModel.update({
        dataViews: [buildDataView({ key: keys, numerators: numerators })],
        viewport: { width: 500, height: 400 },
        type: powerbi.VisualUpdateType.Data
      }, host);
      
      // For most chart types, should have control limits
      const hasLimits = viewModel.controlLimits.ul99 || viewModel.controlLimits.ll99;
      expect(hasLimits).toBeTruthy();
    });

  });

});
