import { describe, expect, it } from "vitest";
import { defaultSettings, type settingsValueType } from "../../src/settings";
import { rep } from "powerbi-visuals-core/math";
import { updateViewModel, type LimitInputs } from "../helpers/calculateLimits";

type Overrides = {
  spc?: Partial<settingsValueType["spc"]>;
  lines?: Partial<settingsValueType["lines"]>;
  outliers?: Partial<settingsValueType["outliers"]>;
};

const numerators = [5, 7, 5, 9, 7, 5, 4, 9, 8, 13, 8, 7];

function update(overrides: Overrides, inputs: LimitInputs = { numerators }) {
  const settings: settingsValueType = {
    ...defaultSettings,
    spc: { ...defaultSettings.spc, ...overrides.spc },
    lines: { ...defaultSettings.lines, show_specification: true, ...overrides.lines },
    outliers: {
      ...defaultSettings.outliers,
      astronomical: true,
      astronomical_limit: "Specification",
      two_in_three: true,
      two_in_three_limit: "Specification",
      ...overrides.outliers
    }
  };
  return updateViewModel(settings, inputs);
}

describe("flagging against specification limits", () => {
  // Displayed values 4 and 9, 9, 13 fall outside [5, 8]; 9 and 13 are two of three beyond the upper limit
  const astpoint = ["none", "none", "none", "improvement", "none", "none", "deterioration", "improvement", "none", "improvement", "none", "none"];
  const two_in_three = ["none", "none", "none", "none", "none", "none", "none", "improvement", "none", "improvement", "none", "none"];

  const cases: { label: string, overrides: Overrides, inputs?: LimitInputs }[] = [
    { label: "unscaled", overrides: { lines: { specification_lower: 5, specification_upper: 8 } } },
    { label: "a multiplier, limits in display units", overrides: { spc: { multiplier: 7 }, lines: { specification_lower: 35, specification_upper: 56 } } },
    { label: "a multiplier applied to the limits",
      overrides: { spc: { multiplier: 7 }, lines: { specification_lower: 5, specification_upper: 8, multiplier_specification: true } } },
    { label: "percentage labels, limits in display units",
      overrides: { spc: { perc_labels: "Yes" }, lines: { specification_lower: 500, specification_upper: 800 } } },
    { label: "proportions shown as percentages, limits in display units",
      overrides: { spc: { chart_type: "p" }, lines: { specification_lower: 5, specification_upper: 8 } },
      inputs: { numerators, denominators: rep(100, numerators.length) } }
  ];

  it.each(cases)("compares displayed values with $label", ({ overrides, inputs }) => {
    const updated = update(overrides, inputs);
    expect(updated.result.status).toBe(true);
    expect(updated.viewModel.outliers[0].astpoint).toEqual(astpoint);
    expect(updated.viewModel.outliers[0].two_in_three).toEqual(two_in_three);
  });

  it("flags against a specification limit set on one side only", () => {
    const upper = update({ lines: { specification_upper: 8 } });
    const lower = update({ lines: { specification_lower: 5 } });
    expect(upper.viewModel.outliers[0].astpoint).toEqual(
      ["none", "none", "none", "improvement", "none", "none", "none", "improvement", "none", "improvement", "none", "none"]);
    expect(lower.viewModel.outliers[0].astpoint).toEqual(
      ["none", "none", "none", "none", "none", "none", "deterioration", "none", "none", "none", "none", "none"]);
    expect(upper.viewModel.outliers[0].two_in_three).toEqual(two_in_three);
  });
});

describe("rule lengths", () => {
  it.each([
    { outliers: { trend_n: 1 }, error: "1 is not a valid value for trend_n" },
    { outliers: { trend_n: 2.5 }, error: "2.5 is not a valid value for trend_n" },
    { outliers: { shift_n: 0 }, error: "0 is not a valid value for shift_n" },
    { outliers: { shift_n: 2.5 }, error: "2.5 is not a valid value for shift_n" }
  ])("rejects $outliers as a settings error", ({ outliers, error }) => {
    const updated = update({ outliers });
    expect(updated.result.status).toBe(false);
    expect(updated.result.type).toBe("settings");
    expect(updated.result.error).toContain(error);
  });

  it("accepts the shortest whole-number runs", () => {
    const updated = update({ outliers: { trend: true, trend_n: 2, shift: true, shift_n: 1 } });
    expect(updated.result.status).toBe(true);
    expect(updated.viewModel.outliers[0].trend).toContain("improvement");
    expect(updated.viewModel.outliers[0].trend).toContain("deterioration");
  });
});
