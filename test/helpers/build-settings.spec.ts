import buildSettings from "./build-settings";
import { defaultSettings } from "../../src/settings";

describe("buildSettings", () => {
  it("returns a valid settings object with no overrides", () => {
    const settings = buildSettings({});
    expect(settings).toBeDefined();
    expect(settings.spc).toBeDefined();
    // Deep clone should produce equal (but not identical) objects
    expect(settings.spc.chart_type).toEqual(defaultSettings.spc.chart_type);
  });

  it("returns a deep copy that does not mutate defaultSettings", () => {
    const original = JSON.parse(JSON.stringify(defaultSettings.spc.chart_type));
    const settings = buildSettings({ "spc.chart_type": "p" });
    expect(settings.spc.chart_type).toBe("p");
    // defaultSettings should be unchanged
    expect(defaultSettings.spc.chart_type).toEqual(original);
  });

  it("applies a single override via dot-notation", () => {
    const settings = buildSettings({ "spc.chart_type": "c" });
    expect(settings.spc.chart_type).toBe("c");
  });

  it("applies multiple overrides simultaneously", () => {
    const settings = buildSettings({
      "spc.chart_type": "u",
      "outliers.process_flag_type": "both"
    });
    expect(settings.spc.chart_type).toBe("u");
    expect(settings.outliers.process_flag_type).toBe("both");
  });

  it("preserves unrelated settings when overriding one property", () => {
    const settings = buildSettings({ "spc.chart_type": "p" });
    // Other spc settings should remain equal to defaults
    expect(settings.spc.multiplier).toEqual(defaultSettings.spc.multiplier);
    // Other groups should be untouched
    expect(settings.outliers.process_flag_type).toEqual(defaultSettings.outliers.process_flag_type);
  });

  it("applies falsy values correctly (0, false, empty string)", () => {
    const settings = buildSettings({
      "spc.multiplier": 0,
      "lines.show_main": false,
      "spc.chart_type": ""
    });
    expect(settings.spc.multiplier).toBe(0);
    expect(settings.lines.show_main).toBe(false);
    expect(settings.spc.chart_type).toBe("");
  });

  it("each call returns an independent copy", () => {
    const a = buildSettings({});
    const b = buildSettings({});
    a.spc.chart_type = "xbar" as any;
    expect(b.spc.chart_type).toEqual(defaultSettings.spc.chart_type);
  });
});
