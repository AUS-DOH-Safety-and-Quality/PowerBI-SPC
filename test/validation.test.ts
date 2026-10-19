import { describe, expect, it, vi } from "vitest";
import { createVisualHost } from "powerbi-visuals-utils-testutils";
import type { settingsValueType } from "../src/settings";
import type { controlLimitsObject } from "../src/Classes/viewModelClass";
import { updateViewModel, type LimitInputs } from "./helpers/calculateLimits";
import { renderVisual, settingsWith, type SettingsOverrides, type Rendered } from "./helpers/renderVisual";
import { sequentialKeys, type DataViewArgs } from "./helpers/buildDataView";

type ChartType = settingsValueType["spc"]["chart_type"];

function chart(chart_type: ChartType, overrides: SettingsOverrides = {}): settingsValueType {
  return settingsWith({ ...overrides, spc: { ...overrides.spc, chart_type } });
}

/** The rendered visual and the warning text it sent the host, if any */
function renderWithWarnings(settings: settingsValueType, args: DataViewArgs): { rendered: Rendered; warning: string | undefined } {
  const host = createVisualHost({});
  const shown = vi.spyOn(host, "displayWarningIcon");
  const rendered = renderVisual(settings, { key: sequentialKeys(args.numerators?.length ?? 0), ...args }, { host });
  const warning = shown.mock.calls.length === 0 ? undefined : shown.mock.calls[0][1];
  return { rendered, warning };
}

function rowIds(limits: controlLimitsObject): number[] {
  const ids = new Array<number>(limits.keys.length);
  for (let i = 0; i < ids.length; i++) {
    ids[i] = limits.keys[i].id;
  }
  return ids;
}

function errorText(settings: settingsValueType, args: DataViewArgs): string | null {
  return renderWithWarnings(settings, args).rendered.element.textContent;
}

describe("chart type column requirements", () => {
  it.each<ChartType>(["p", "pp", "u", "up", "xbar", "s"])("rejects a %s chart without denominators", chart_type => {
    expect(errorText(chart(chart_type), { numerators: [1, 2, 3], xbar_sds: [1, 1, 1] })).toBe(`Chart type '${chart_type}' requires denominators!`);
  });

  it("rejects an xbar chart without SDs once denominators are present", () => {
    expect(errorText(chart("xbar"), { numerators: [1, 2, 3], denominators: [5, 5, 5] })).toBe("Chart type 'xbar' requires SDs!");
  });

  it("reports the first group whose chart type lacks its columns", () => {
    const rendered = renderVisual([chart("i"), chart("i"), chart("p"), chart("p")], {
      key: ["1", "2", "1", "2"], numerators: [1, 2, 3, 4], indicator: ["A", "A", "B", "B"]
    });
    expect(rendered.element.textContent).toBe("Chart type 'p' requires denominators!");
  });
});

describe("SD validation", () => {
  const inputs: DataViewArgs = { numerators: [10, 11, 12], denominators: [5, 5, 5] };

  it.each([
    { label: "missing", xbar_sds: [null, null, null], error: "All SDs are missing or null!" },
    { label: "not numbers", xbar_sds: ["a", "b", "c"], error: "All SDs are not numbers!" },
    { label: "negative", xbar_sds: [-1, -2, -3], error: "All SDs are negative!" }
  ])("rejects SDs that are all $label", ({ xbar_sds, error }) => {
    expect(errorText(chart("xbar"), { ...inputs, xbar_sds })).toBe(error);
  });

  it("removes rows by their first failing rule, SD rules first but after a missing numerator", () => {
    const { rendered, warning } = renderWithWarnings(chart("xbar"), {
      numerators: [10, 11, 12, 13, null, 15, 16],
      denominators: [5, 0, 5, 5, 5, 0, 5],
      xbar_sds: [1, null, "x", -2, "y", 2, 2]
    });
    expect(rendered.element.querySelector(".errormessage")).toBeNull();
    expect(rendered.visual.viewModel.plotPoints).toHaveLength(2);
    expect(warning).toBe([
      "Category 2 removed due to: SD missing.",
      "Category 3 removed due to: SD is not a number.",
      "Category 4 removed due to: SD negative.",
      "Category 5 removed due to: Numerator missing.",
      "Category 6 removed due to: Denominator is zero."
    ].join("\n"));
  });
});

describe("group size validation", () => {
  it.each<ChartType>(["xbar", "s"])("removes %s groups whose size is one or less, after the zero rule", chart_type => {
    const { rendered, warning } = renderWithWarnings(chart(chart_type), {
      numerators: [10, 11, 12, 13, 14],
      denominators: [5, 1, 0.5, 0, 6],
      xbar_sds: [1, 1, 1, 1, 1]
    });
    expect(rendered.visual.viewModel.plotPoints).toHaveLength(2);
    expect(warning).toBe([
      "Category 2 removed due to: Denominator <= 1.",
      "Category 3 removed due to: Denominator <= 1.",
      "Category 4 removed due to: Denominator is zero."
    ].join("\n"));
  });

  it.each<ChartType>(["xbar", "s"])("rejects a %s chart whose every group size is one or less", chart_type => {
    expect(errorText(chart(chart_type), { numerators: [10, 11], denominators: [1, 0.5], xbar_sds: [1, 1] }))
      .toBe("All denominators are less than or equal to one!");
  });

  it("keeps a denominator of one on charts without the rule", () => {
    const result = updateViewModel(chart("p"), { numerators: [1, 1], denominators: [1, 1] }).result;
    expect(result).toEqual({ status: true, warning: undefined });
  });
});

describe("negative numerators", () => {
  const rejecting: ChartType[] = ["c", "g", "t", "s", "p", "pp", "u", "up"];
  const keeping: ChartType[] = ["i", "i_m", "i_mm", "run", "mr", "xbar"];
  const inputs: LimitInputs = { numerators: [7, -3, 4], denominators: [10, 10, 10], xbar_sds: [2, 2, 2] };

  it.each(rejecting)("removes a negative numerator from a %s chart with a warning", chart_type => {
    const updated = updateViewModel(chart(chart_type), inputs);
    expect(updated.result).toEqual({ status: true, warning: "Category 2 removed due to: Numerator negative." });
    expect(rowIds(updated.viewModel.controlLimits[0])).toEqual(chart_type === "mr" ? [2] : [0, 2]);
  });

  it.each(rejecting)("rejects a %s chart whose numerators are all negative", chart_type => {
    expect(updateViewModel(chart(chart_type), { ...inputs, numerators: [-7, -3, -4] }).result)
      .toEqual({ status: false, error: "All numerators are negative!" });
  });

  it.each(keeping)("keeps negative numerators on a %s chart", chart_type => {
    const updated = updateViewModel(chart(chart_type), { ...inputs, numerators: [-7, -3, -4] });
    expect(updated.result).toEqual({ status: true, warning: undefined });
    expect(updated.viewModel.controlLimits[0].values.length).toBe(chart_type === "mr" ? 2 : 3);
  });
});

describe("assurance icon warnings", () => {
  const numerators = [5, 6, 5, 7, 6];

  it("warns that a run chart has no limits to judge the alt. target against", () => {
    const result = updateViewModel(chart("run", {
      nhs_icons: { show_assurance_icons: true }, lines: { show_alt_target: true, alt_target: 6 }
    }), { numerators }).result;
    expect(result).toEqual({ status: true, warning: "NHS Assurance icon requires chart with control limits." });
  });

  it("warns when the shown alt. target is unset at the last observation", () => {
    const result = updateViewModel(chart("i", {
      nhs_icons: { show_assurance_icons: true }, lines: { show_alt_target: true }
    }), { numerators }).result;
    expect(result).toEqual({ status: true, warning: "NHS Assurance icon requires a valid alt. target at last observation." });
  });

  it("reports both reasons, the alt. target first", () => {
    const result = updateViewModel(chart("run", {
      nhs_icons: { show_assurance_icons: true }, lines: { show_alt_target: true }
    }), { numerators }).result;
    expect(result).toEqual({
      status: true,
      warning: "NHS Assurance icon requires a valid alt. target at last observation.\nNHS Assurance icon requires chart with control limits."
    });
  });

  it("is silent with a valid alt. target on a limits chart, or when the icon is off", () => {
    const shown = updateViewModel(chart("i", {
      nhs_icons: { show_assurance_icons: true }, lines: { show_alt_target: true, alt_target: 6 }
    }), { numerators }).result;
    const hidden = updateViewModel(chart("run", { lines: { show_alt_target: true } }), { numerators }).result;
    expect(shown).toEqual({ status: true, warning: undefined });
    expect(hidden).toEqual({ status: true, warning: undefined });
  });
});

describe("stored split indexes", () => {
  it("ignores splits outside the series, including at its last point", () => {
    const numerators = [5, 6, 5, 7, 6];
    const rendered = renderVisual(chart("i"), { key: sequentialKeys(5), numerators }, { splitIndexes: [-1, 4, 99] });
    expect(rendered.element.querySelector(".errormessage")).toBeNull();
    expect(rendered.visual.viewModel.groupStartEndIndexes[0]).toEqual([[0, 5]]);
    expect(rendered.visual.viewModel.controlLimits[0].target).toEqual([5.8, 5.8, 5.8, 5.8, 5.8]);
  });
});

describe("a single observation", () => {
  const inputs: LimitInputs = { numerators: [7], denominators: [10], xbar_sds: [2] };
  const limited: ChartType[] = ["c", "g", "p", "u", "xbar", "s"];
  const unlimited: ChartType[] = ["i_m", "i_mm", "t", "pp", "up"];
  /** 7 of 10 as the chart plots it: a count, a percentage or a ratio */
  const plotted: Partial<Record<ChartType, number>> = { c: 7, g: 7, xbar: 7, s: 7, t: 7, p: 70, pp: 70 };

  it.each(limited)("plots a %s chart with limits around its one value", chart_type => {
    const { rendered, warning } = renderWithWarnings(chart(chart_type), inputs);
    const limits = rendered.visual.viewModel.controlLimits[0];
    expect(warning).toBeUndefined();
    expect(rendered.element.querySelector(".errormessage")).toBeNull();
    expect(rendered.element.querySelectorAll(".dotsgroup path")).toHaveLength(1);
    expect(limits.values).toEqual([plotted[chart_type] ?? 0.7]);
    expect(limits.target).toEqual(limits.values);
    expect(limits.ll99[0]).toBeLessThan(limits.values[0]);
    expect(limits.ul99[0]).toBeGreaterThan(limits.values[0]);
  });

  it.each(unlimited)("plots a %s chart without limits, as one value has no moving range", chart_type => {
    const { rendered, warning } = renderWithWarnings(chart(chart_type), inputs);
    const limits = rendered.visual.viewModel.controlLimits[0];
    expect(warning).toBeUndefined();
    expect(rendered.element.querySelector(".errormessage")).toBeNull();
    expect(rendered.element.querySelectorAll(".dotsgroup path")).toHaveLength(1);
    expect(limits.values).toEqual([plotted[chart_type] ?? 0.7]);
    expect(limits.target[0]).toBeCloseTo(limits.values[0], 12);
    expect(limits.ll99).toEqual([undefined]);
    expect(limits.ul99).toEqual([undefined]);
  });

  it("plots a run chart's one value as its own median", () => {
    const { rendered } = renderWithWarnings(chart("run"), inputs);
    expect(rendered.element.querySelectorAll(".dotsgroup path")).toHaveLength(1);
    expect(rendered.visual.viewModel.controlLimits[0].target).toEqual([0.7]);
  });
});
