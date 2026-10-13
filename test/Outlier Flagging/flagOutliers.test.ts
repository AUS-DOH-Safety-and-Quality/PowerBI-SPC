import { describe, expect, it } from "vitest";
import { defaultSettings, type settingsValueType } from "../../src/settings";
import { rep } from "powerbi-visuals-core/math";
import { updateViewModel, type LimitInputs } from "../helpers/calculateLimits";
import { settingsWith } from "../helpers/renderVisual";
import { must } from "powerbi-visuals-core/testing";

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
    { outliers: { trend_n: 1 }, error: "1 is not a valid value for trend_n. Valid values are whole numbers, at least 2" },
    { outliers: { trend_n: 2.5 }, error: "2.5 is not a valid value for trend_n. Valid values are whole numbers, at least 2" },
    { outliers: { shift_n: 0 }, error: "0 is not a valid value for shift_n. Valid values are whole numbers, at least 1" },
    { outliers: { shift_n: 2.5 }, error: "2.5 is not a valid value for shift_n. Valid values are whole numbers, at least 1" }
  ])("rejects $outliers as a settings error", ({ outliers, error }) => {
    expect(update({ outliers }).result).toEqual({ status: false, type: "settings", error });
  });

  it("accepts the shortest whole-number runs", () => {
    const updated = update({ outliers: { trend: true, trend_n: 2, shift: true, shift_n: 1 } });
    expect(updated.result.status).toBe(true);
    expect(updated.viewModel.outliers[0].trend).toContain("improvement");
    expect(updated.viewModel.outliers[0].trend).toContain("deterioration");
  });
});

describe("sigma levels", () => {
  const spread = [10, 11, 9, 10, 11, 9, 10, 11, 9, 10, 13.5, 10, 11, 9, 15.5, 10, 11, 9, 18, 10, 11, 9, 10, 6.5, 10, 11, 9, 10];
  const bands = { "1 Sigma": ["ll68", "ul68"], "2 Sigma": ["ll95", "ul95"], "3 Sigma": ["ll99", "ul99"] } as const;

  it("flags astronomical points beyond the band of the chosen level only", () => {
    const counts: number[] = [];
    const levels = ["1 Sigma", "2 Sigma", "3 Sigma"] as const;
    for (let l = 0; l < levels.length; l++) {
      const updated = updateViewModel(settingsWith({ outliers: { astronomical: true, astronomical_limit: levels[l] } }), { numerators: spread });
      const limits = updated.viewModel.controlLimits[0];
      const astpoint = updated.viewModel.outliers[0].astpoint;
      let count = 0;
      for (let i = 0; i < spread.length; i++) {
        const lower = must(limits[bands[levels[l]][0]][i]);
        const upper = must(limits[bands[levels[l]][1]][i]);
        const expected = spread[i] > upper ? "improvement" : (spread[i] < lower ? "deterioration" : "none");
        expect(astpoint[i], `${levels[l]} at ${i}`).toBe(expected);
        count += expected === "none" ? 0 : 1;
      }
      counts.push(count);
    }
    expect(counts[0]).toBeGreaterThan(counts[1]);
    expect(counts[1]).toBeGreaterThan(counts[2]);
    expect(counts[2]).toBeGreaterThan(0);
  });

  // 14 and 6 fall beyond the 1-sigma limits only, two of three on the same side
  const pattern = [10, 11, 9, 10, 11, 9, 10, 14, 10, 14, 10, 11, 9, 10, 6, 11, 6, 10, 9, 11];

  it.each([
    { highlight: false, flags: "nnnnnnnininnnndndnnn" },
    { highlight: true, flags: "nnnnnnniiinnnndddnnn" }
  ])("flags two-in-three patterns with highlight_series=$highlight", ({ highlight, flags }) => {
    const updated = updateViewModel(settingsWith({
      outliers: { two_in_three: true, two_in_three_limit: "1 Sigma", two_in_three_highlight_series: highlight }
    }), { numerators: pattern });
    let actual = "";
    const two_in_three = updated.viewModel.outliers[0].two_in_three;
    for (let i = 0; i < two_in_three.length; i++) {
      actual += two_in_three[i][0];
    }
    expect(actual).toBe(flags);
  });

  it.each(["2 Sigma", "3 Sigma"] as const)("does not flag the 1-sigma pattern against the %s limits", level => {
    const updated = updateViewModel(settingsWith({ outliers: { two_in_three: true, two_in_three_limit: level } }), { numerators: pattern });
    expect(updated.viewModel.outliers[0].two_in_three).toEqual(rep("none", pattern.length));
  });

  it("flags the same points whatever the multiplier, as values and limits scale together", () => {
    const outliers = { astronomical: true, astronomical_limit: "1 Sigma", two_in_three: true, two_in_three_limit: "1 Sigma" } as const;
    const plain = updateViewModel(settingsWith({ outliers }), { numerators: spread }).viewModel.outliers[0];
    const scaled = updateViewModel(settingsWith({ outliers, spc: { multiplier: 7 } }), { numerators: spread }).viewModel.outliers[0];
    const percent = updateViewModel(settingsWith({ outliers, spc: { perc_labels: "Yes" } }), { numerators: spread }).viewModel.outliers[0];
    expect(scaled).toEqual(plain);
    expect(percent).toEqual(plain);
  });
});

describe("run lengths", () => {
  // Mean 10: five points above (4-8) and five below (13-17), alternating elsewhere
  const shifted = [11, 9, 11, 9, 12, 12, 12, 12, 12, 9, 11, 9, 11, 8, 8, 8, 8, 8, 11, 9];
  // Five steadily rising points, then five steadily falling
  const trending = [10, 11, 12, 13, 14, 9, 10, 9, 10, 9, 14, 13, 12, 11, 10, 11, 10, 11, 10, 11];

  it.each([
    { n: 4, flagged: true },
    { n: 5, flagged: true },
    { n: 6, flagged: false }
  ])("flags a five-point shift with shift_n=$n only if it is long enough", ({ n, flagged }) => {
    const shift = updateViewModel(settingsWith({ outliers: { shift: true, shift_n: n } }), { numerators: shifted }).viewModel.outliers[0].shift;
    const expected = rep<string>("none", shifted.length);
    if (flagged) {
      for (let i = 4; i < 9; i++) {
        expected[i] = "improvement";
      }
      for (let i = 13; i < 18; i++) {
        expected[i] = "deterioration";
      }
    }
    expect(shift).toEqual(expected);
  });

  it.each([
    { n: 4, flagged: true },
    { n: 5, flagged: true },
    { n: 6, flagged: false }
  ])("flags a five-point trend with trend_n=$n only if it is long enough", ({ n, flagged }) => {
    const trend = updateViewModel(settingsWith({ outliers: { trend: true, trend_n: n } }), { numerators: trending }).viewModel.outliers[0].trend;
    const expected = rep<string>("none", trending.length);
    if (flagged) {
      for (let i = 0; i < 5; i++) {
        expected[i] = "improvement";
        expected[i + 10] = "deterioration";
      }
    }
    expect(trend).toEqual(expected);
  });

  it("does not run a trend or shift across a rebaseline", () => {
    const outliers = { trend: true, trend_n: 5, shift: true, shift_n: 5 };
    const whole = updateViewModel(settingsWith({ outliers }), { numerators: trending }).viewModel.outliers[0];
    const split = updateViewModel(settingsWith({ outliers }), { numerators: trending }, [2]).viewModel.outliers[0];
    expect(whole.trend.slice(0, 5)).toEqual(rep("improvement", 5));
    expect(split.trend.slice(0, 5)).toEqual(rep("none", 5));
    expect(split.trend.slice(10, 15)).toEqual(rep("deterioration", 5));
  });
});

describe("pattern rules and chart limits", () => {
  const values = [10, 11, 9, 10, 11, 9, 30, 10, 12, 13, 14, 15, 16, 10, 9, 11, 3, 4, 3, 4, 10, 8, 7, 6, 5, 4, 10, -12, 10, 11];
  const allPatterns = { astronomical: true, two_in_three: true, shift: true, shift_n: 4, trend: true, trend_n: 4 };

  it("flags only the rules without control limits on a run chart", () => {
    const run = updateViewModel(settingsWith({ spc: { chart_type: "run" }, outliers: allPatterns }), { numerators: values });
    expect(run.result.status).toBe(true);
    const outliers = run.viewModel.outliers[0];
    expect(outliers.astpoint).toEqual(rep("none", values.length));
    expect(outliers.two_in_three).toEqual(rep("none", values.length));
    expect(outliers.shift).toContain("improvement");
    expect(outliers.trend).toContain("deterioration");
  });

  // Truncation precedes flagging, so flags compare against the drawn limits
  it("flags against the truncated limits", () => {
    const plain = updateViewModel(settingsWith({ outliers: allPatterns }), { numerators: values });
    const truncated = updateViewModel(settingsWith({ outliers: allPatterns, spc: { ll_truncate: 5, ul_truncate: 12 } }), { numerators: values });
    const limits = truncated.viewModel.controlLimits[0];
    const astpoint = truncated.viewModel.outliers[0].astpoint;
    expect(limits.ul99[0]).toBe(12);
    expect(limits.ll99[0]).toBe(5);
    for (let i = 0; i < values.length; i++) {
      const upper = must(limits.ul99[i]);
      const lower = must(limits.ll99[i]);
      expect(astpoint[i], `at ${i}`).toBe(values[i] > upper ? "improvement" : (values[i] < lower ? "deterioration" : "none"));
    }
    // 13 lies beyond the truncated upper limit but within the calculated one
    expect(values[9]).toBeGreaterThan(12);
    expect(plain.viewModel.outliers[0].astpoint[9]).toBe("none");
    expect(astpoint[9]).toBe("improvement");
    // Shift and trend rules do not use the limits
    expect(truncated.viewModel.outliers[0].shift).toEqual(plain.viewModel.outliers[0].shift);
    expect(truncated.viewModel.outliers[0].trend).toEqual(plain.viewModel.outliers[0].trend);
  });
});
