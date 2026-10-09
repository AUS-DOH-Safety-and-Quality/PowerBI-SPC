import { describe, expect, it } from "vitest";
import type { controlLimitsObject } from "../../src/Classes/viewModelClass";
import { defaultSettings, type settingsValueType } from "../../src/settings";
import { rep } from "powerbi-visuals-core/math";
import calculateLimits, { type LimitInputs } from "../helpers/calculateLimits";

type ChartType = settingsValueType["spc"]["chart_type"];
type Series = (number | undefined)[];

const chartTypes: ChartType[] = ["run", "i", "i_m", "i_mm", "mr", "p", "pp", "u", "up", "c", "xbar", "s", "g", "t"];
const screeningCharts: ChartType[] = ["i", "i_m", "i_mm", "t", "pp", "up"];
const limitLines = ["ll99", "ll95", "ll68", "ul68", "ul95", "ul99"] as const;
const chartLines = ["values", "targets", "trend_line", ...limitLines] as const;
const extraLines = ["alt_targets", "speclimits_lower", "speclimits_upper"] as const;

const numerators = [5, 7, 5, 9, 7, 5, 4, 9, 8, 13, 8, 7];
const denominators = [20, 22, 21, 24, 20, 23, 19, 25, 22, 27, 21, 22];
const xbar_sds = [1.2, 1.5, 1.1, 1.8, 1.4, 1.3, 1.6, 1.2, 1.7, 1.5, 1.3, 1.4];

function inputsFor(chart_type: ChartType, values: number[], counts: number[]): LimitInputs {
  const ratio = ["p", "pp", "u", "up", "xbar", "s"].includes(chart_type);
  return {
    numerators: values,
    denominators: ratio ? counts : undefined,
    xbar_sds: chart_type === "xbar" ? xbar_sds.slice(0, values.length) : undefined
  };
}

function settingsFor(chart_type: ChartType, spc: Partial<settingsValueType["spc"]> = {},
                     lines: Partial<settingsValueType["lines"]> = {}): settingsValueType {
  return {
    ...defaultSettings,
    spc: { ...defaultSettings.spc, chart_type, perc_labels: "No", ...spc },
    lines: { ...defaultSettings.lines, ...lines }
  };
}

function sliceInputs(inputs: LimitInputs, start: number, end: number): LimitInputs {
  return {
    numerators: inputs.numerators.slice(start, end),
    denominators: inputs.denominators?.slice(start, end),
    xbar_sds: inputs.xbar_sds?.slice(start, end)
  };
}

function reverseInputs(inputs: LimitInputs): LimitInputs {
  return {
    numerators: inputs.numerators.slice().reverse(),
    denominators: inputs.denominators?.slice().reverse(),
    xbar_sds: inputs.xbar_sds?.slice().reverse()
  };
}

function mapSeries(series: Series, fn: (value: number) => number): Series {
  const result: Series = new Array<number | undefined>(series.length);
  for (let i = 0; i < series.length; i++) {
    const value = series[i];
    result[i] = value === undefined ? undefined : fn(value);
  }
  return result;
}

function expectSeriesClose(actual: Series, expected: Series, label: string): void {
  expect(actual, label).toHaveLength(expected.length);
  for (let i = 0; i < expected.length; i++) {
    const value = expected[i];
    if (value === undefined) {
      expect(actual[i], `${label} at ${i}`).toBeUndefined();
    } else {
      expect(actual[i], `${label} at ${i}`).toBeCloseTo(value, 9);
    }
  }
}

function expectAllLinesClose(actual: controlLimitsObject, expected: controlLimitsObject,
                             lines: readonly (typeof chartLines[number] | typeof extraLines[number])[], transform?: (value: number) => number): void {
  for (let l = 0; l < lines.length; l++) {
    const series = expected[lines[l]];
    expectSeriesClose(actual[lines[l]], transform === undefined ? series : mapSeries(series, transform), lines[l]);
  }
}

describe.each(chartTypes)("%s chart limit options", chart_type => {
  const inputs = inputsFor(chart_type, numerators, denominators);

  it("subsets from the end as the reversed data subset from the start", () => {
    const fromEnd = calculateLimits(settingsFor(chart_type, { num_points_subset: 5, subset_points_from: "End" }), inputs);
    const reversed = calculateLimits(settingsFor(chart_type, { num_points_subset: 5, subset_points_from: "Start" }), reverseInputs(inputs));
    for (let l = 0; l < chartLines.length; l++) {
      expectSeriesClose(fromEnd[chartLines[l]], reversed[chartLines[l]].slice().reverse(), chartLines[l]);
    }
  });

  it.each([true, false])("rebaselines with subset_rebaselines=%s as standalone segments", rebaselines => {
    const combined = calculateLimits(settingsFor(chart_type, { num_points_subset: 3, subset_rebaselines: rebaselines }), inputs, [5]);
    const first = calculateLimits(settingsFor(chart_type, { num_points_subset: 3 }), sliceInputs(inputs, 0, 6));
    const second = calculateLimits(settingsFor(chart_type, { num_points_subset: rebaselines ? 3 : undefined }), sliceInputs(inputs, 6, 12));
    let boundary = 0;
    while (boundary < combined.keys.length && combined.keys[boundary].x < 6) {
      boundary++;
    }
    for (let l = 0; l < chartLines.length; l++) {
      const line = chartLines[l];
      expectSeriesClose(combined[line].slice(0, boundary), first[line], `first segment ${line}`);
      expectSeriesClose(combined[line].slice(boundary), second[line], `second segment ${line}`);
    }
  });

  it("scales chart lines by the multiplier and extra lines only when their toggles are on", () => {
    const lines = { show_alt_target: true, alt_target: 6, show_specification: true, specification_lower: 2, specification_upper: 20 };
    const unscaled = calculateLimits(settingsFor(chart_type, {}, lines), inputs);
    const scaled = calculateLimits(settingsFor(chart_type, { multiplier: 7 }, lines), inputs);
    const scaledAll = calculateLimits(settingsFor(chart_type, { multiplier: 7 },
      { ...lines, multiplier_alt_target: true, multiplier_specification: true }), inputs);
    const percent = calculateLimits(settingsFor(chart_type, { perc_labels: "Yes" }, lines), inputs);

    expectAllLinesClose(scaled, unscaled, chartLines, value => value * 7);
    expectAllLinesClose(scaled, unscaled, extraLines);
    expectAllLinesClose(scaledAll, unscaled, chartLines, value => value * 7);
    expectAllLinesClose(scaledAll, unscaled, extraLines, value => value * 7);
    expectAllLinesClose(percent, unscaled, chartLines, value => value * 100);
    expectAllLinesClose(percent, unscaled, extraLines);
  });

  it("truncates the control limits at the configured bounds", () => {
    const unclamped = calculateLimits(settingsFor(chart_type), inputs);
    // Bounds halfway between the centreline and the 3-sigma limits, or around the median for run charts
    let lower: number;
    let upper: number;
    if (chart_type === "run") {
      const sorted = numerators.slice().sort((a, b) => a - b);
      lower = sorted[3];
      upper = sorted[8];
    } else {
      const target = unclamped.targets[0]!;
      lower = (unclamped.ll99[0]! + target) / 2;
      upper = (unclamped.ul99[0]! + target) / 2;
    }
    const clamped = calculateLimits(settingsFor(chart_type, { ll_truncate: lower, ul_truncate: upper }), inputs);

    expectAllLinesClose(clamped, unclamped, limitLines, value => Math.min(upper, Math.max(lower, value)));
    expectAllLinesClose(clamped, unclamped, ["values", "targets", "trend_line"]);
    if (chart_type !== "run") {
      expect(clamped.ll99[0]).toBe(lower);
      expect(clamped.ul99[0]).toBe(upper);
    }
  });

  it("screens outlying moving ranges only on moving-range charts", () => {
    const outliers = inputsFor(chart_type, [5, 9, 4, 10, 3, 12, 2, 2000, 14, 1, 16, 2], rep(5000, 12));
    const kept = calculateLimits(settingsFor(chart_type, { outliers_in_limits: true }), outliers);
    const screened = calculateLimits(settingsFor(chart_type, { outliers_in_limits: false }), outliers);
    if (screeningCharts.includes(chart_type)) {
      for (let i = 0; i < kept.keys.length; i++) {
        expect(screened.ul99[i], `ul99 at ${i}`).toBeLessThan(kept.ul99[i]!);
      }
    } else {
      expectAllLinesClose(screened, kept, chartLines);
    }
  });
});

describe("median centreline charts", () => {
  const values = [10, 11, 12, 13, 113, 14, 15, 16];
  const centre = 13.5;

  // Moving ranges [1, 1, 1, 100, 99, 1, 1]: screening drops the two large ranges
  it.each([
    { chart_type: "i_m", kept: (204 / 7) / 1.128, screened: 1 / 1.128 },
    { chart_type: "i_mm", kept: 1 / 0.954, screened: 1 / 0.954 }
  ] as const)("$chart_type matches the hand-derived sigma with and without screening", ({ chart_type, kept, screened }) => {
    const cases = [{ outliers_in_limits: true, sigma: kept }, { outliers_in_limits: false, sigma: screened }];
    for (let c = 0; c < cases.length; c++) {
      const limits = calculateLimits(settingsFor(chart_type, { outliers_in_limits: cases[c].outliers_in_limits }), { numerators: values });
      const sigma = cases[c].sigma;
      expectSeriesClose(limits.targets, rep(centre, values.length), "targets");
      expectSeriesClose(limits.ll99, rep(centre - 3 * sigma, values.length), "ll99");
      expectSeriesClose(limits.ul68, rep(centre + sigma, values.length), "ul68");
      expectSeriesClose(limits.ul99, rep(centre + 3 * sigma, values.length), "ul99");
    }
  });
});
