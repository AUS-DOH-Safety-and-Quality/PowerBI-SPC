/**
 * Test Extension Plan - Session 6
 * Class & ViewModel Integration Tests - Part 3 (Settings)
 * 
 * Tests for settingsClass:
 * - Settings initialization
 * - Settings update method
 * - Default values
 * - Settings validation
 * - Derived settings update
 */

import settingsClass from "../src/Classes/settingsClass";
import derivedSettingsClass from "../src/Classes/derivedSettingsClass";
import buildDataView from "./helpers/buildDataView";

describe("settingsClass", () => {

  describe("constructor and initialization", () => {

    it("should initialize with default settings", () => {
      const settings = new settingsClass();
      
      expect(settings.settings).toBeDefined();
      expect(settings.derivedSettings).toBeDefined();
    });

    it("should have derivedSettings as instance of derivedSettingsClass", () => {
      const settings = new settingsClass();
      
      expect(settings.derivedSettings).toBeInstanceOf(derivedSettingsClass);
    });

  });

  describe("update() method", () => {

    it("should update settings from DataView", () => {
      const settings = new settingsClass();
      const keys = ["Mon", "Tue", "Wed"];
      const numerators = [10, 20, 30];
      const dataView = buildDataView({ key: keys, numerators: numerators });
      
      settings.update(dataView, [[0, 1, 2]]);
      
      expect(settings.settings).toBeDefined();
      expect(settings.validationStatus.status).toBe(0);
    });

    it("should update derivedSettings after settings update", () => {
      const settings = new settingsClass();
      const keys = ["Mon", "Tue", "Wed"];
      const numerators = [10, 20, 30];
      const dataView = buildDataView({ key: keys, numerators: numerators });
      
      settings.update(dataView, [[0, 1, 2]]);
      
      expect(settings.derivedSettings.chart_type_props).toBeDefined();
      expect(settings.derivedSettings.multiplier).toBeDefined();
      expect(settings.derivedSettings.percentLabels).toBeDefined();
    });

    it("should have validation status after update", () => {
      const settings = new settingsClass();
      const keys = ["Mon", "Tue", "Wed"];
      const numerators = [10, 20, 30];
      const dataView = buildDataView({ key: keys, numerators: numerators });
      
      settings.update(dataView, [[0, 1, 2]]);
      
      // Validation status should be defined and initialized
      expect(settings.validationStatus).toBeDefined();
      expect(settings.validationStatus.status).toBeDefined();
      expect(settings.validationStatus.error).toBeDefined();
      expect(settings.validationStatus.messages).toBeDefined();
    });

    it("should reset validation status on each update", () => {
      const settings = new settingsClass();
      const keys = ["Mon", "Tue", "Wed"];
      const numerators = [10, 20, 30];
      const dataView = buildDataView({ key: keys, numerators: numerators });
      
      settings.update(dataView, [[0, 1, 2]]);
      
      // Should reset to status 0 on update
      expect(settings.validationStatus.status).toBe(0);
      expect(settings.validationStatus.error).toBe("");
    });

    it("should validate settings after processing all groups", () => {
      const settings = new settingsClass();
      const keys = ["Mon", "Tue", "Wed"];
      const numerators = [10, 20, 30];
      const dataView = buildDataView({ key: keys, numerators: numerators });
      
      settings.update(dataView, [[0, 1, 2]]);
      
      // Settings should be updated and validation complete
      expect(settings.settings).toBeDefined();
      expect(settings.validationStatus.status).toBe(0);
    });

    it("should handle grouped data", () => {
      const settings = new settingsClass();
      const keys = ["Mon", "Tue", "Wed", "Thu"];
      const indicators = ["A", "A", "B", "B"];
      const numerators = [10, 20, 30, 40];
      const dataView = buildDataView({ key: keys, indicator: indicators, numerators: numerators });
      
      settings.update(dataView, [[0, 1], [2, 3]]);
      
      expect(settings.settingsGrouped).toBeDefined();
      expect(settings.settingsGrouped.length).toBe(2);
      expect(settings.derivedSettingsGrouped).toBeDefined();
      expect(settings.derivedSettingsGrouped.length).toBe(2);
    });

  });

  describe("getFormattingModel() method", () => {

    it("should return a formatting model", () => {
      const settings = new settingsClass();
      const keys = ["Mon", "Tue", "Wed"];
      const numerators = [10, 20, 30];
      const dataView = buildDataView({ key: keys, numerators: numerators });
      
      settings.update(dataView, [[0, 1, 2]]);
      
      const formattingModel = settings.getFormattingModel();
      
      expect(formattingModel).toBeDefined();
      expect(formattingModel.cards).toBeDefined();
      expect(Array.isArray(formattingModel.cards)).toBe(true);
    });

    it("should include formatting cards in model", () => {
      const settings = new settingsClass();
      const keys = ["Mon", "Tue", "Wed"];
      const numerators = [10, 20, 30];
      const dataView = buildDataView({ key: keys, numerators: numerators });
      
      settings.update(dataView, [[0, 1, 2]]);
      
      const formattingModel = settings.getFormattingModel();
      
      // Should have at least some formatting cards
      expect(formattingModel.cards.length).toBeGreaterThan(0);
    });

  });

});
