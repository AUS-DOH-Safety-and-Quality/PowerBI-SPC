/**
 * Test Extension Plan - Session 6
 * Class & ViewModel Integration Tests - Part 1 (Derived Settings)
 * 
 * Tests for derivedSettingsClass:
 * - Chart type property derivation
 * - Multiplier and percent label logic
 * - Setting interdependencies
 */

import derivedSettingsClass from "../src/Classes/derivedSettingsClass";
import { defaultSettings } from "../src/settings";

describe("derivedSettingsClass", () => {

  describe("update() - Chart Type Properties", () => {

    it("should derive correct properties for 'i' chart", () => {
      const derived = new derivedSettingsClass();
      derived.update({ ...defaultSettings.spc, chart_type: "i" });
      
      expect(derived.chart_type_props.name).toBe("i");
      expect(derived.chart_type_props.needs_denominator).toBe(false);
      expect(derived.chart_type_props.denominator_optional).toBe(true);
      expect(derived.chart_type_props.numerator_non_negative).toBe(false);
      expect(derived.chart_type_props.numerator_leq_denominator).toBe(false);
      expect(derived.chart_type_props.has_control_limits).toBe(true);
      expect(derived.chart_type_props.needs_sd).toBe(false);
      expect(derived.chart_type_props.integer_num_den).toBe(false);
      expect(derived.chart_type_props.value_name).toBe("Observation");
    });

    it("should derive correct properties for 'p' chart", () => {
      const derived = new derivedSettingsClass();
      derived.update({ ...defaultSettings.spc, chart_type: "p" });
      
      expect(derived.chart_type_props.name).toBe("p");
      expect(derived.chart_type_props.needs_denominator).toBe(true);
      expect(derived.chart_type_props.denominator_optional).toBe(false);
      expect(derived.chart_type_props.numerator_non_negative).toBe(true);
      expect(derived.chart_type_props.numerator_leq_denominator).toBe(true);
      expect(derived.chart_type_props.has_control_limits).toBe(true);
      expect(derived.chart_type_props.needs_sd).toBe(false);
      expect(derived.chart_type_props.integer_num_den).toBe(true);
      expect(derived.chart_type_props.value_name).toBe("Proportion");
    });

    it("should derive correct properties for 'u' chart", () => {
      const derived = new derivedSettingsClass();
      derived.update({ ...defaultSettings.spc, chart_type: "u" });
      
      expect(derived.chart_type_props.name).toBe("u");
      expect(derived.chart_type_props.needs_denominator).toBe(true);
      expect(derived.chart_type_props.denominator_optional).toBe(false);
      expect(derived.chart_type_props.numerator_non_negative).toBe(true);
      expect(derived.chart_type_props.numerator_leq_denominator).toBe(true);
      expect(derived.chart_type_props.has_control_limits).toBe(true);
      expect(derived.chart_type_props.needs_sd).toBe(false);
      expect(derived.chart_type_props.integer_num_den).toBe(false);
      expect(derived.chart_type_props.value_name).toBe("Rate");
    });

    it("should derive correct properties for 'xbar' chart", () => {
      const derived = new derivedSettingsClass();
      derived.update({ ...defaultSettings.spc, chart_type: "xbar" });
      
      expect(derived.chart_type_props.name).toBe("xbar");
      expect(derived.chart_type_props.needs_denominator).toBe(true);
      expect(derived.chart_type_props.denominator_optional).toBe(false);
      expect(derived.chart_type_props.numerator_non_negative).toBe(false);
      expect(derived.chart_type_props.numerator_leq_denominator).toBe(false);
      expect(derived.chart_type_props.has_control_limits).toBe(true);
      expect(derived.chart_type_props.needs_sd).toBe(true);
      expect(derived.chart_type_props.integer_num_den).toBe(false);
      expect(derived.chart_type_props.value_name).toBe("Group Mean");
    });

    it("should derive correct properties for 'run' chart", () => {
      const derived = new derivedSettingsClass();
      derived.update({ ...defaultSettings.spc, chart_type: "run" });
      
      expect(derived.chart_type_props.name).toBe("run");
      expect(derived.chart_type_props.needs_denominator).toBe(false);
      expect(derived.chart_type_props.denominator_optional).toBe(true);
      expect(derived.chart_type_props.numerator_non_negative).toBe(false);
      expect(derived.chart_type_props.numerator_leq_denominator).toBe(false);
      expect(derived.chart_type_props.has_control_limits).toBe(false);
      expect(derived.chart_type_props.needs_sd).toBe(false);
      expect(derived.chart_type_props.integer_num_den).toBe(false);
      expect(derived.chart_type_props.value_name).toBe("Observation");
    });

    it("should derive correct properties for 'c' chart", () => {
      const derived = new derivedSettingsClass();
      derived.update({ ...defaultSettings.spc, chart_type: "c" });
      
      expect(derived.chart_type_props.name).toBe("c");
      expect(derived.chart_type_props.needs_denominator).toBe(false);
      expect(derived.chart_type_props.denominator_optional).toBe(false);
      expect(derived.chart_type_props.numerator_non_negative).toBe(true);
      expect(derived.chart_type_props.numerator_leq_denominator).toBe(false);
      expect(derived.chart_type_props.has_control_limits).toBe(true);
      expect(derived.chart_type_props.needs_sd).toBe(false);
      expect(derived.chart_type_props.integer_num_den).toBe(true);
      expect(derived.chart_type_props.value_name).toBe("Count");
    });

  });

  describe("update() - Multiplier and Percent Labels", () => {

    it("should set multiplier to 100 when perc_labels is 'Yes'", () => {
      const derived = new derivedSettingsClass();
      derived.update({ ...defaultSettings.spc, chart_type: "i", perc_labels: "Yes", multiplier: 1 });
      
      expect(derived.multiplier).toBe(100);
      expect(derived.percentLabels).toBe(true);
    });

    it("should keep custom multiplier when perc_labels is 'No'", () => {
      const derived = new derivedSettingsClass();
      derived.update({ ...defaultSettings.spc, chart_type: "i", perc_labels: "No", multiplier: 1000 });
      
      expect(derived.multiplier).toBe(1000);
      expect(derived.percentLabels).toBe(false);
    });

    it("should automatically set multiplier to 100 for p-chart when multiplier is 1", () => {
      const derived = new derivedSettingsClass();
      derived.update({ ...defaultSettings.spc, chart_type: "p", perc_labels: "Automatic", multiplier: 1 });
      
      expect(derived.multiplier).toBe(100);
      expect(derived.percentLabels).toBe(true);
    });

    it("should not change multiplier for p-chart when already set to non-1 value", () => {
      const derived = new derivedSettingsClass();
      derived.update({ ...defaultSettings.spc, chart_type: "p", perc_labels: "Automatic", multiplier: 1000 });
      
      expect(derived.multiplier).toBe(1000);
      expect(derived.percentLabels).toBe(false);
    });

    it("should set percentLabels to true for p-chart with multiplier 100 in automatic mode", () => {
      const derived = new derivedSettingsClass();
      derived.update({ ...defaultSettings.spc, chart_type: "p", perc_labels: "Automatic", multiplier: 100 });
      
      expect(derived.multiplier).toBe(100);
      expect(derived.percentLabels).toBe(true);
    });

    it("should set percentLabels to false for non-p-chart in automatic mode", () => {
      const derived = new derivedSettingsClass();
      derived.update({ ...defaultSettings.spc, chart_type: "i", perc_labels: "Automatic", multiplier: 100 });
      
      expect(derived.multiplier).toBe(100);
      expect(derived.percentLabels).toBe(false);
    });

    it("should set percentLabels to true for pp-chart with multiplier 100 in automatic mode", () => {
      const derived = new derivedSettingsClass();
      derived.update({ ...defaultSettings.spc, chart_type: "pp", perc_labels: "Automatic", multiplier: 100 });
      
      expect(derived.multiplier).toBe(100);
      expect(derived.percentLabels).toBe(true);
    });

  });

  describe("update() - Chart Type Variants", () => {

    it("should derive correct properties for 'i_m' chart variant", () => {
      const derived = new derivedSettingsClass();
      derived.update({ ...defaultSettings.spc, chart_type: "i_m" });
      
      expect(derived.chart_type_props.name).toBe("i_m");
      expect(derived.chart_type_props.denominator_optional).toBe(true);
      expect(derived.chart_type_props.value_name).toBe("Observation");
    });

    it("should derive correct properties for 'i_mm' chart variant", () => {
      const derived = new derivedSettingsClass();
      derived.update({ ...defaultSettings.spc, chart_type: "i_mm" });
      
      expect(derived.chart_type_props.name).toBe("i_mm");
      expect(derived.chart_type_props.denominator_optional).toBe(true);
      expect(derived.chart_type_props.value_name).toBe("Observation");
    });

    it("should derive correct properties for 'pp' chart (p-prime)", () => {
      const derived = new derivedSettingsClass();
      derived.update({ ...defaultSettings.spc, chart_type: "pp" });
      
      expect(derived.chart_type_props.name).toBe("pp");
      expect(derived.chart_type_props.needs_denominator).toBe(true);
      expect(derived.chart_type_props.numerator_leq_denominator).toBe(true);
      expect(derived.chart_type_props.integer_num_den).toBe(true);
      expect(derived.chart_type_props.value_name).toBe("Proportion");
    });

    it("should derive correct properties for 'up' chart (u-prime)", () => {
      const derived = new derivedSettingsClass();
      derived.update({ ...defaultSettings.spc, chart_type: "up" });
      
      expect(derived.chart_type_props.name).toBe("up");
      expect(derived.chart_type_props.needs_denominator).toBe(true);
      expect(derived.chart_type_props.numerator_non_negative).toBe(true);
      expect(derived.chart_type_props.value_name).toBe("Rate");
    });

    it("should derive correct properties for 'mr' chart", () => {
      const derived = new derivedSettingsClass();
      derived.update({ ...defaultSettings.spc, chart_type: "mr" });
      
      expect(derived.chart_type_props.name).toBe("mr");
      expect(derived.chart_type_props.denominator_optional).toBe(true);
      expect(derived.chart_type_props.value_name).toBe("Moving Range");
    });

    it("should derive correct properties for 's' chart", () => {
      const derived = new derivedSettingsClass();
      derived.update({ ...defaultSettings.spc, chart_type: "s" });
      
      expect(derived.chart_type_props.name).toBe("s");
      expect(derived.chart_type_props.needs_denominator).toBe(true);
      expect(derived.chart_type_props.numerator_non_negative).toBe(true);
      expect(derived.chart_type_props.value_name).toBe("Group SD");
    });

    it("should derive correct properties for 'g' chart", () => {
      const derived = new derivedSettingsClass();
      derived.update({ ...defaultSettings.spc, chart_type: "g" });
      
      expect(derived.chart_type_props.name).toBe("g");
      expect(derived.chart_type_props.numerator_non_negative).toBe(true);
      expect(derived.chart_type_props.value_name).toBe("Non-Events");
    });

    it("should derive correct properties for 't' chart", () => {
      const derived = new derivedSettingsClass();
      derived.update({ ...defaultSettings.spc, chart_type: "t" });
      
      expect(derived.chart_type_props.name).toBe("t");
      expect(derived.chart_type_props.numerator_non_negative).toBe(true);
      expect(derived.chart_type_props.value_name).toBe("Time");
    });

  });

});
