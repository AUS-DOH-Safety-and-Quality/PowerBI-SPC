import valueFormatter from "../src/Functions/valueFormatter";
import { defaultSettings } from "../src/settings";
import type { defaultSettingsType, derivedSettingsClass } from "../src/Classes";

describe("Utility Functions - Value Formatter", () => {
  // Helper to create minimal derivedSettings
  const createDerivedSettings = (overrides = {}): derivedSettingsClass => ({
    percentLabels: false,
    chart_type_props: {
      name: "i",
      needs_denominator: false,
      needs_sd: false,
      numerator_non_negative: false,
      numerator_leq_denominator: false,
      denominator_optional: false,
      has_control_limits: true,
      value_name: "Value",
      integer_num_den: false,
      ...overrides
    },
    ...overrides
  } as any);

  describe("Basic formatting", () => {
    it("should format numeric values with default sig figs", () => {
      const settings: defaultSettingsType = JSON.parse(JSON.stringify(defaultSettings));
      settings.spc.sig_figs = 2;
      const derived = createDerivedSettings();
      
      const formatter = valueFormatter(settings, derived);
      const result = formatter(123.456, "value");
      
      expect(result).toBe("123.46");
    });

    it("should format numeric values with 3 sig figs", () => {
      const settings: defaultSettingsType = JSON.parse(JSON.stringify(defaultSettings));
      settings.spc.sig_figs = 3;
      const derived = createDerivedSettings();
      
      const formatter = valueFormatter(settings, derived);
      const result = formatter(123.456789, "value");
      
      expect(result).toBe("123.457");
    });

    it("should format numeric values with 0 sig figs", () => {
      const settings: defaultSettingsType = JSON.parse(JSON.stringify(defaultSettings));
      settings.spc.sig_figs = 0;
      const derived = createDerivedSettings();
      
      const formatter = valueFormatter(settings, derived);
      const result = formatter(123.456, "value");
      
      expect(result).toBe("123");
    });

    it("should format with percent suffix when percentLabels is true", () => {
      const settings: defaultSettingsType = JSON.parse(JSON.stringify(defaultSettings));
      settings.spc.sig_figs = 2;
      const derived = createDerivedSettings({ percentLabels: true });
      
      const formatter = valueFormatter(settings, derived);
      const result = formatter(0.456, "value");
      
      expect(result).toBe("0.46%");
    });

    it("should format without percent suffix when percentLabels is false", () => {
      const settings: defaultSettingsType = JSON.parse(JSON.stringify(defaultSettings));
      settings.spc.sig_figs = 2;
      const derived = createDerivedSettings({ percentLabels: false });
      
      const formatter = valueFormatter(settings, derived);
      const result = formatter(0.456, "value");
      
      expect(result).toBe("0.46");
    });
  });

  describe("Integer formatting", () => {
    it("should format integers with 0 decimals when integer_num_den is true", () => {
      const settings: defaultSettingsType = JSON.parse(JSON.stringify(defaultSettings));
      settings.spc.sig_figs = 2;
      const derived = createDerivedSettings({
        chart_type_props: { integer_num_den: true }
      });
      
      const formatter = valueFormatter(settings, derived);
      const result = formatter(123.456, "integer");
      
      expect(result).toBe("123");
    });

    it("should format integers with sig_figs when integer_num_den is false", () => {
      const settings: defaultSettingsType = JSON.parse(JSON.stringify(defaultSettings));
      settings.spc.sig_figs = 2;
      const derived = createDerivedSettings({
        chart_type_props: { integer_num_den: false }
      });
      
      const formatter = valueFormatter(settings, derived);
      const result = formatter(123.456, "integer");
      
      expect(result).toBe("123.46");
    });

    it("should not add percent suffix to integers", () => {
      const settings: defaultSettingsType = JSON.parse(JSON.stringify(defaultSettings));
      settings.spc.sig_figs = 2;
      const derived = createDerivedSettings({
        percentLabels: true,
        chart_type_props: { integer_num_den: true }
      });
      
      const formatter = valueFormatter(settings, derived);
      const result = formatter(100, "integer");
      
      expect(result).toBe("100");
    });
  });

  describe("Date formatting", () => {
    it("should return date strings unchanged", () => {
      const settings: defaultSettingsType = JSON.parse(JSON.stringify(defaultSettings));
      const derived = createDerivedSettings();
      
      const formatter = valueFormatter(settings, derived);
      const result = formatter("2024-01-15", "date");
      
      expect(result).toBe("2024-01-15");
    });

    it("should handle formatted date strings", () => {
      const settings: defaultSettingsType = JSON.parse(JSON.stringify(defaultSettings));
      const derived = createDerivedSettings();
      
      const formatter = valueFormatter(settings, derived);
      const result = formatter("Mon 15 Jan 2024", "date");
      
      expect(result).toBe("Mon 15 Jan 2024");
    });
  });

  describe("Null and undefined handling", () => {
    it("should return empty string for null value", () => {
      const settings: defaultSettingsType = JSON.parse(JSON.stringify(defaultSettings));
      const derived = createDerivedSettings();
      
      const formatter = valueFormatter(settings, derived);
      const result = formatter(null, "value");
      
      expect(result).toBe("");
    });

    it("should return empty string for undefined value", () => {
      const settings: defaultSettingsType = JSON.parse(JSON.stringify(defaultSettings));
      const derived = createDerivedSettings();
      
      const formatter = valueFormatter(settings, derived);
      const result = formatter(undefined, "value");
      
      expect(result).toBe("");
    });

    it("should return empty string for null integer", () => {
      const settings: defaultSettingsType = JSON.parse(JSON.stringify(defaultSettings));
      const derived = createDerivedSettings();
      
      const formatter = valueFormatter(settings, derived);
      const result = formatter(null, "integer");
      
      expect(result).toBe("");
    });

    it("should return empty string for null date", () => {
      const settings: defaultSettingsType = JSON.parse(JSON.stringify(defaultSettings));
      const derived = createDerivedSettings();
      
      const formatter = valueFormatter(settings, derived);
      const result = formatter(null, "date");
      
      expect(result).toBe("");
    });
  });

  describe("Edge cases", () => {
    it("should format zero correctly", () => {
      const settings: defaultSettingsType = JSON.parse(JSON.stringify(defaultSettings));
      settings.spc.sig_figs = 2;
      const derived = createDerivedSettings();
      
      const formatter = valueFormatter(settings, derived);
      const result = formatter(0, "value");
      
      expect(result).toBe("0.00");
    });

    it("should format negative numbers", () => {
      const settings: defaultSettingsType = JSON.parse(JSON.stringify(defaultSettings));
      settings.spc.sig_figs = 2;
      const derived = createDerivedSettings();
      
      const formatter = valueFormatter(settings, derived);
      const result = formatter(-123.456, "value");
      
      expect(result).toBe("-123.46");
    });

    it("should format very small numbers", () => {
      const settings: defaultSettingsType = JSON.parse(JSON.stringify(defaultSettings));
      settings.spc.sig_figs = 6;
      const derived = createDerivedSettings();
      
      const formatter = valueFormatter(settings, derived);
      const result = formatter(0.000123, "value");
      
      expect(result).toBe("0.000123");
    });

    it("should format very large numbers", () => {
      const settings: defaultSettingsType = JSON.parse(JSON.stringify(defaultSettings));
      settings.spc.sig_figs = 2;
      const derived = createDerivedSettings();
      
      const formatter = valueFormatter(settings, derived);
      const result = formatter(123456789, "value");
      
      expect(result).toBe("123456789.00");
    });

    it("should handle scientific notation input", () => {
      const settings: defaultSettingsType = JSON.parse(JSON.stringify(defaultSettings));
      settings.spc.sig_figs = 4;
      const derived = createDerivedSettings();
      
      const formatter = valueFormatter(settings, derived);
      const result = formatter(1.23e-5, "value");
      
      expect(result).toBe("0.0000");
    });
  });

  describe("Closure behavior", () => {
    it("should create independent formatters with different settings", () => {
      const settings1: defaultSettingsType = JSON.parse(JSON.stringify(defaultSettings));
      settings1.spc.sig_figs = 1;
      const derived1 = createDerivedSettings({ percentLabels: false });
      
      const settings2: defaultSettingsType = JSON.parse(JSON.stringify(defaultSettings));
      settings2.spc.sig_figs = 3;
      const derived2 = createDerivedSettings({ percentLabels: true });
      
      const formatter1 = valueFormatter(settings1, derived1);
      const formatter2 = valueFormatter(settings2, derived2);
      
      const result1 = formatter1(123.456, "value");
      const result2 = formatter2(123.456, "value");
      
      expect(result1).toBe("123.5");
      expect(result2).toBe("123.456%");
    });

    it("should reference settings not copy them", () => {
      const settings: defaultSettingsType = JSON.parse(JSON.stringify(defaultSettings));
      settings.spc.sig_figs = 2;
      const derived = createDerivedSettings();
      
      const formatter = valueFormatter(settings, derived);
      
      // Change settings after creating formatter
      settings.spc.sig_figs = 5;
      
      // Formatter uses settings by reference, so sees the change
      const result = formatter(123.456, "value");
      expect(result).toBe("123.45600");
    });

    it("should be reusable for multiple values", () => {
      const settings: defaultSettingsType = JSON.parse(JSON.stringify(defaultSettings));
      settings.spc.sig_figs = 2;
      const derived = createDerivedSettings();
      
      const formatter = valueFormatter(settings, derived);
      
      expect(formatter(10, "value")).toBe("10.00");
      expect(formatter(20.5, "value")).toBe("20.50");
      expect(formatter(30.999, "value")).toBe("31.00");
    });
  });

  describe("Different name types", () => {
    it("should handle unknown name type as default value", () => {
      const settings: defaultSettingsType = JSON.parse(JSON.stringify(defaultSettings));
      settings.spc.sig_figs = 2;
      const derived = createDerivedSettings();
      
      const formatter = valueFormatter(settings, derived);
      const result = formatter(123.456, "unknown" as any);
      
      // Should default to value formatting
      expect(result).toBe("123.46");
    });

    it("should format all name types consistently", () => {
      const settings: defaultSettingsType = JSON.parse(JSON.stringify(defaultSettings));
      settings.spc.sig_figs = 2;
      const derived = createDerivedSettings({ percentLabels: true });
      
      const formatter = valueFormatter(settings, derived);
      
      // Value should have percent
      expect(formatter(50, "value")).toBe("50.00%");
      
      // Integer should not have percent
      expect(formatter(50, "integer")).toBe("50.00");
      
      // Date should return as-is
      expect(formatter("50", "date")).toBe("50");
    });
  });
});
