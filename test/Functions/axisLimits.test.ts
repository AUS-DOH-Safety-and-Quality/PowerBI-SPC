import { describe, expect, it } from "vitest";
import { createVisualHost } from "powerbi-visuals-utils-testutils";
import viewModelClass from "../../src/Classes/viewModelClass";
import { defaultSettings, type settingsValueType } from "../../src/settings";
import axisRanges from "../../src/Functions/axisRanges";
import buildDataView from "../helpers/buildDataView";
import { updateViewModel, type LimitInputs } from "../helpers/calculateLimits";

type Bounds = Partial<Pick<settingsValueType["spc"], "ll_truncate" | "ul_truncate">
  & Pick<settingsValueType["x_axis"], "xlimit_l" | "xlimit_u">
  & Pick<settingsValueType["y_axis"], "ylimit_l" | "ylimit_u">>;

const inputs: LimitInputs = { numerators: [5, 7, 5, 9, 7, 5, 4, 9, 8, 13, 8, 7] };
const limitLines = ["ll99", "ll95", "ll68", "ul68", "ul95", "ul99"] as const;

function update(bounds: Bounds) {
  const settings: settingsValueType = {
    ...defaultSettings,
    spc: { ...defaultSettings.spc, ll_truncate: bounds.ll_truncate, ul_truncate: bounds.ul_truncate },
    x_axis: { ...defaultSettings.x_axis, xlimit_l: bounds.xlimit_l, xlimit_u: bounds.xlimit_u },
    y_axis: { ...defaultSettings.y_axis, ylimit_l: bounds.ylimit_l, ylimit_u: bounds.ylimit_u }
  };
  return updateViewModel(settings, inputs);
}

// Truncation inside the 3-sigma band so both clamps bite; axis limits outside the automatic range
const values: Required<Bounds> = { ll_truncate: 3, ul_truncate: 12, xlimit_l: 1, xlimit_u: 9, ylimit_l: -5, ylimit_u: 40 };
const names = Object.keys(values) as (keyof Bounds)[];
const combinations: Bounds[] = [];
for (let mask = 0; mask < 1 << names.length; mask++) {
  const bounds: Bounds = {};
  for (let n = 0; n < names.length; n++) {
    if ((mask & (1 << n)) !== 0) {
      bounds[names[n]] = values[names[n]];
    }
  }
  combinations.push(bounds);
}

describe("truncation and axis limit combinations", () => {
  const plain = update({});
  const untruncated = plain.viewModel.controlLimits[0];
  const automatic = axisRanges(plain.viewModel);

  it.each(combinations)("renders %o with the explicit bounds honoured", bounds => {
    const updated = update(bounds);
    expect(updated.result.status).toBe(true);
    const limits = updated.viewModel.controlLimits[0];
    const axes = axisRanges(updated.viewModel);

    // Truncation clamps the control limits only
    const lower = bounds.ll_truncate ?? Number.NEGATIVE_INFINITY;
    const upper = bounds.ul_truncate ?? Number.POSITIVE_INFINITY;
    for (let l = 0; l < limitLines.length; l++) {
      const series = limits[limitLines[l]];
      const reference = untruncated[limitLines[l]];
      for (let i = 0; i < series.length; i++) {
        expect(series[i], `${limitLines[l]} at ${i}`).toBe(Math.min(upper, Math.max(lower, reference[i]!)));
      }
    }
    expect(limits.values).toEqual(untruncated.values);
    expect(limits.targets).toEqual(untruncated.targets);

    // Explicit axis limits win; the automatic y range follows the truncated limits
    const truncatedOnly = update({ ll_truncate: bounds.ll_truncate, ul_truncate: bounds.ul_truncate });
    const automaticY = axisRanges(truncatedOnly.viewModel).y;
    expect(axes.x.lower).toBe(bounds.xlimit_l ?? automatic.x.lower);
    expect(axes.x.upper).toBe(bounds.xlimit_u ?? automatic.x.upper);
    expect(axes.y.lower).toBe(bounds.ylimit_l ?? automaticY.lower);
    expect(axes.y.upper).toBe(bounds.ylimit_u ?? automaticY.upper);
    expect(axes.x.lower).toBeLessThan(axes.x.upper);
    expect(axes.y.lower).toBeLessThan(axes.y.upper);
    if (bounds.ll_truncate !== undefined && bounds.ylimit_l === undefined) {
      expect(axes.y.lower).toBeGreaterThan(automatic.y.lower);
    }
    if (bounds.ul_truncate !== undefined && bounds.ylimit_u === undefined) {
      expect(axes.y.upper).toBeLessThan(automatic.y.upper);
    }
  });

  it("accepts explicit axis limits that exclude the data", () => {
    const outside = update({ ylimit_l: 100, ylimit_u: 200, xlimit_l: 20, xlimit_u: 30 });
    expect(outside.result.status).toBe(true);
    expect(axisRanges(outside.viewModel)).toEqual({ x: { lower: 20, upper: 30 }, y: { lower: 100, upper: 200 } });
  });

  it.each([
    { bounds: { ll_truncate: 5, ul_truncate: 5 }, error: "ll_truncate (5) must be below ul_truncate (5)" },
    { bounds: { ll_truncate: 6, ul_truncate: 5 }, error: "ll_truncate (6) must be below ul_truncate (5)" },
    { bounds: { xlimit_l: 5, xlimit_u: 5 }, error: "xlimit_l (5) must be below xlimit_u (5)" },
    { bounds: { xlimit_l: 6, xlimit_u: 5 }, error: "xlimit_l (6) must be below xlimit_u (5)" },
    { bounds: { ylimit_l: 5, ylimit_u: 5 }, error: "ylimit_l (5) must be below ylimit_u (5)" },
    { bounds: { ylimit_l: 6, ylimit_u: 5 }, error: "ylimit_l (6) must be below ylimit_u (5)" }
  ])("rejects $bounds as a settings error", ({ bounds, error }) => {
    const updated = update(bounds);
    expect(updated.result.status).toBe(false);
    expect(updated.result.type).toBe("settings");
    expect(updated.result.error).toBe(error);
  });

  it.each([
    { bounds: { xlimit_l: 50 }, error: `The x-axis lower limit (50) is above the upper limit (${automatic.x.upper})` },
    { bounds: { xlimit_u: -1 }, error: `The x-axis lower limit (${automatic.x.lower}) is above the upper limit (-1)` },
    { bounds: { ylimit_l: 100 }, error: `The y-axis lower limit (100) is above the upper limit (${automatic.y.upper})` },
    { bounds: { ylimit_u: -100 }, error: `The y-axis lower limit (${automatic.y.lower}) is above the upper limit (-100)` }
  ])("rejects $bounds against the automatic range as a settings error", ({ bounds, error }) => {
    const updated = update(bounds);
    expect(updated.result.status).toBe(false);
    expect(updated.result.type).toBe("settings");
    expect(updated.result.error).toBe(error);
  });

  it("does not check axis ranges for the grouped summary table", () => {
    const settings: settingsValueType = { ...defaultSettings, y_axis: { ...defaultSettings.y_axis, ylimit_l: 20 } };
    const dataView = buildDataView({
      key: ["1", "2", "3", "1", "2", "3"],
      indicator: ["A", "A", "A", "B", "B", "B"],
      numerators: [1, 2, 3, 30, 40, 50]
    }, settings);
    const viewModel = new viewModelClass();
    const result = viewModel.update({ dataViews: [dataView], viewport: { width: 500, height: 500 }, type: 2 }, createVisualHost({}));
    expect(result.status).toBe(true);
    expect(viewModel.groupedRows).toHaveLength(2);
  });
});

describe("percentage label axis bounds", () => {
  function yRange(perc_labels: "Yes" | "No", numerators: number[]) {
    const settings: settingsValueType = { ...defaultSettings, spc: { ...defaultSettings.spc, multiplier: 100, perc_labels } };
    return axisRanges(updateViewModel(settings, { numerators }).viewModel).y;
  }

  it("keeps negative values on the axis", () => {
    const values = [-0.05, 0.02, -0.04, 0.03, -0.06, 0.01, -0.04, 0.03];
    expect(yRange("Yes", values).lower).toBeLessThan(-6);
    expect(yRange("Yes", values).lower).toBe(yRange("No", values).lower);
  });

  it("starts the axis at 0% when no value is negative", () => {
    const values = [0.05, 0.01, 0.06, 0.02, 0.07, 0.01, 0.05, 0.02];
    expect(yRange("No", values).lower).toBeLessThan(0);
    expect(yRange("Yes", values).lower).toBe(0);
  });
});
