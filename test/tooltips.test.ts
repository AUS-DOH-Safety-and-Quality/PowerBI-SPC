import { describe, expect, it, vi } from "vitest";
import { createVisualHost } from "powerbi-visuals-utils-testutils";
import type powerbi from "powerbi-visuals-api";
import type { settingsValueType } from "../src/settings";
import { sequentialKeys } from "./helpers/buildDataView";
import { updateViewModel, type LimitInputs } from "./helpers/calculateLimits";
import { renderVisual, settingsWith, type SettingsOverrides } from "./helpers/renderVisual";

type Lines = settingsValueType["lines"];
type ChartType = settingsValueType["spc"]["chart_type"];
type Tooltip = powerbi.extensibility.VisualTooltipDataItem[];

const numerators = [5, 7, 5, 9, 7, 5, 4, 9, 8, 13, 8, 7];
const denominators = [20, 22, 21, 24, 20, 23, 19, 25, 22, 27, 21, 22];
const xbar_sds = [1.2, 1.5, 1.1, 1.8, 1.4, 1.3, 1.6, 1.2, 1.7, 1.5, 1.3, 1.4];

function inputsFor(chart_type: ChartType): LimitInputs {
  return {
    numerators,
    denominators: ["p", "pp", "u", "up", "xbar", "s"].includes(chart_type) ? denominators : undefined,
    xbar_sds: chart_type === "xbar" ? xbar_sds : undefined
  };
}

function tooltip(overrides: SettingsOverrides, index = 0, inputs: LimitInputs = { numerators }): Tooltip {
  const updated = updateViewModel(settingsWith(overrides), inputs);
  expect(updated.result.status).toBe(true);
  return updated.viewModel.plotPoints[index].tooltip;
}

function names(items: Tooltip): (string | undefined)[] {
  const result = new Array<string | undefined>(items.length);
  for (let i = 0; i < items.length; i++) {
    result[i] = items[i].displayName;
  }
  return result;
}

function lineOverrides(key: string, values: Readonly<Record<string, string | boolean>>): Partial<Lines> {
  const result: Partial<Lines> = {};
  const settings = Object.keys(values);
  for (let i = 0; i < settings.length; i++) {
    Object.assign(result, { [settings[i].replace("<key>", key)]: values[settings[i]] });
  }
  return result;
}

describe("tooltip contents", () => {
  it("lists the date, value, counts, limits and target in order for a proportion chart", () => {
    const items = tooltip({ spc: { chart_type: "p" } }, 0, inputsFor("p"));
    expect(names(items)).toEqual([
      "Date", "Proportion", "Numerator", "Denominator",
      "Upper 99% Limit", "Upper 95% Limit", "Centerline", "Lower 95% Limit", "Lower 99% Limit"
    ]);
    expect(items[1].value).toBe("25.00%");
    expect(items[2].value).toBe("5");
    expect(items[3].value).toBe("20");
  });

  it("renames and hides the date, value and count entries", () => {
    const items = tooltip({
      spc: {
        chart_type: "u", ttip_label_date: "Month", ttip_label_value: "Rate per bed", ttip_label_numerator: "Falls",
        ttip_show_denominator: false
      },
      lines: { show_95: false, show_99: false }
    }, 0, inputsFor("u"));
    expect(names(items)).toEqual(["Month", "Rate per bed", "Falls", "Centerline"]);
    // Integral counts have no decimals on every chart type
    expect(items[2].value).toBe("5");
    const hidden = tooltip({ spc: { ttip_show_date: false, ttip_show_value: false, ttip_show_numerator: false }, lines: { show_95: false, show_99: false } });
    expect(names(hidden)).toEqual(["Centerline"]);
  });

  it("omits counts for charts without denominators", () => {
    expect(names(tooltip({ spc: { chart_type: "c" } }, 0, inputsFor("c")))).not.toContain("Numerator");
  });

  it.each([
    { chart_type: "run", date: "Date", value: "Observation" },
    { chart_type: "i", date: "Date", value: "Observation" },
    { chart_type: "i_m", date: "Date", value: "Observation" },
    { chart_type: "i_mm", date: "Date", value: "Observation" },
    { chart_type: "mr", date: "Date", value: "Moving Range" },
    { chart_type: "p", date: "Date", value: "Proportion" },
    { chart_type: "pp", date: "Date", value: "Proportion" },
    { chart_type: "u", date: "Date", value: "Rate" },
    { chart_type: "up", date: "Date", value: "Rate" },
    { chart_type: "c", date: "Date", value: "Count" },
    { chart_type: "xbar", date: "Date", value: "Group Mean" },
    { chart_type: "s", date: "Date", value: "Group SD" },
    { chart_type: "g", date: "Event", value: "Non-Events" },
    { chart_type: "t", date: "Event", value: "Time" }
  ] as const)("names the $chart_type chart's date '$date' and value '$value' automatically", ({ chart_type, date, value }) => {
    const items = tooltip({ spc: { chart_type } }, 1, inputsFor(chart_type));
    expect(items[0].displayName).toBe(date);
    expect(items[1].displayName).toBe(value);
  });

  it("formats values with the reported decimals and percentage setting", () => {
    expect(tooltip({ spc: { sig_figs: 0 } })[1].value).toBe("5");
    expect(tooltip({ spc: { sig_figs: 3, multiplier: 2 } })[1].value).toBe("10.000");
    expect(tooltip({ spc: { sig_figs: 1, perc_labels: "Yes" } })[1].value).toBe("500.0%");
  });
});

describe("line tooltip settings", () => {
  const lineGroups: { key: string; enable: Partial<Lines>; upper: string; lower?: string }[] = [
    { key: "target", enable: {}, upper: "Centerline" },
    { key: "alt_target", enable: { show_alt_target: true, alt_target: 6 }, upper: "Alt. Target" },
    { key: "68", enable: { show_68: true }, upper: "Upper 68% Limit", lower: "Lower 68% Limit" },
    { key: "95", enable: {}, upper: "Upper 95% Limit", lower: "Lower 95% Limit" },
    { key: "99", enable: {}, upper: "Upper 99% Limit", lower: "Lower 99% Limit" },
    { key: "specification", enable: { show_specification: true, specification_lower: 2, specification_upper: 12 },
      upper: "Upper Specification Limit", lower: "Lower Specification Limit" },
    { key: "trend", enable: { show_trend: true }, upper: "Trend" }
  ];

  it.each(lineGroups)("shows, renames and hides the $key entries", ({ key, enable, upper, lower }) => {
    const shown = names(tooltip({ lines: enable }));
    expect(shown).toContain(upper);
    if (lower !== undefined) {
      expect(shown).toContain(lower);
    }

    const renamed = names(tooltip({ lines: { ...enable, ...lineOverrides(key, { "ttip_label_<key>": "Bound" }) } }));
    if (lower === undefined) {
      expect(renamed).toContain("Bound");
    } else {
      expect(renamed).toContain("Upper Bound");
      expect(renamed).toContain("Lower Bound");
      const prefixed = names(tooltip({ lines: { ...enable, ...lineOverrides(key, {
        "ttip_label_<key>_prefix_upper": "Max ", "ttip_label_<key>_prefix_lower": "Min "
      }) } }));
      expect(prefixed).toContain(upper.replace("Upper ", "Max "));
      expect(prefixed).toContain(lower.replace("Lower ", "Min "));
    }
    expect(renamed).not.toContain(upper);

    const untipped = names(tooltip({ lines: { ...enable, ...lineOverrides(key, { "ttip_show_<key>": false }) } }));
    const unshown = names(tooltip({ lines: { ...enable, ...lineOverrides(key, { "show_<key>": false }) } }));
    expect(untipped).not.toContain(upper);
    expect(unshown).not.toContain(upper);
    expect(untipped.length).toBe(shown.length - (lower === undefined ? 1 : 2));
    expect(unshown).toEqual(untipped);
  });

  it("keeps blank limit prefixes rather than restoring the defaults", () => {
    const items = names(tooltip({ lines: { ttip_label_95_prefix_lower: "", ttip_label_95_prefix_upper: "" } }));
    expect(items).toEqual(["Date", "Observation", "Upper 99% Limit", "95% Limit", "Centerline", "95% Limit", "Lower 99% Limit"]);
  });

  it("formats each line's value with the chart's percentage suffix", () => {
    const items = tooltip({
      spc: { chart_type: "p" },
      lines: { show_alt_target: true, alt_target: 30, show_specification: true, specification_upper: 40, show_trend: true }
    }, 0, inputsFor("p"));
    for (let i = 1; i < items.length; i++) {
      if (items[i].displayName !== "Numerator" && items[i].displayName !== "Denominator") {
        expect(items[i].value, items[i].displayName).toMatch(/%$/);
      }
    }
  });

  it("leaves out limit entries on a run chart but keeps the target", () => {
    const items = names(tooltip({ spc: { chart_type: "run" }, lines: { show_68: true } }));
    expect(items).toEqual(["Date", "Observation", "Centerline"]);
  });
});

describe("pattern tooltips", () => {
  const flagged = [10, 11, 9, 10, 11, 9, 30, 10, 12, 13, 14, 15, 16, 10, 9, 11, 3, 4, 3, 4, 10, 8, 7, 6, 5, 4, 10, -12, 10, 11];

  function patterns(outliers: Partial<settingsValueType["outliers"]>, index: number): string | undefined {
    const items = tooltip({ outliers }, index, { numerators: flagged });
    for (let i = 0; i < items.length; i++) {
      if (items[i].displayName === "Pattern(s)") {
        return items[i].value;
      }
    }
    return undefined;
  }

  it("names each pattern a point is flagged by, one per line", () => {
    const all = { astronomical: true, shift: true, shift_n: 4, trend: true, trend_n: 4, two_in_three: true };
    expect(patterns(all, 11)).toBe("Astronomical Point\nTrend\nShift\nTwo-in-Three");
    expect(patterns(all, 0)).toBeUndefined();
  });

  it.each([
    { outliers: { astronomical: true, astronomical_limit: "2 Sigma" }, index: 6, expected: "Astronomical Point (2 Sigma)" },
    { outliers: { two_in_three: true, two_in_three_limit: "1 Sigma" }, index: 11, expected: "Two-in-Three (1 Sigma)" },
    { outliers: { two_in_three: true, two_in_three_limit: "2 Sigma" }, index: 11, expected: "Two-in-Three" }
  ] as const)("names the limit a pattern used when it is not the default: $expected", ({ outliers, index, expected }) => {
    expect(patterns(outliers, index)).toBe(expected);
  });

  it("appends the report's tooltip columns after the patterns", () => {
    const updated = updateViewModel(settingsWith({ outliers: { astronomical: true } }), { numerators: flagged });
    const view = renderVisual(settingsWith({ outliers: { astronomical: true } }), {
      key: sequentialKeys(flagged.length), numerators: flagged, tooltips: sequentialKeys(flagged.length)
    });
    const items = view.visual.viewModel.plotPoints[6].tooltip;
    expect(names(items).slice(-2)).toEqual(["Pattern(s)", "Extra Tooltip"]);
    expect(items[items.length - 1].value).toBe("7");
    expect(names(updated.viewModel.plotPoints[6].tooltip)).not.toContain("Extra Tooltip");
  });
});

it("passes a hovered dot's tooltip and identity to the host", () => {
  const host = createVisualHost({});
  const show = vi.spyOn(host.tooltipService, "show");
  const rendered = renderVisual(settingsWith({ spc: { ttip_label_value: "Falls" } }), { key: sequentialKeys(numerators.length), numerators }, { host });
  const dot = rendered.element.querySelectorAll(".dotsgroup path")[3];
  dot.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
  const point = rendered.visual.viewModel.plotPoints[3];
  expect(show).toHaveBeenCalledWith(expect.objectContaining({ dataItems: point.tooltip, identities: [point.identity] }));
  expect(names(point.tooltip)[1]).toBe("Falls");
});
