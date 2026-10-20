import { describe, expect, it, vi } from "vitest";
import { createVisualHost } from "powerbi-visuals-utils-testutils";
import type powerbi from "powerbi-visuals-api";
import type { controlLimitsObject } from "../../src/Classes/viewModelClass";
import type { settingsValueType } from "../../src/settings";
import type { Visual } from "../../src/visual";
import { frontend } from "../../src/frontend";
import { renderVisual, settingsWith, type SettingsOverrides } from "../helpers/renderVisual";
import { sequentialKeys, type DataViewArgs } from "../helpers/buildDataView";
import { columnNames, groupedRow } from "../helpers/summaryTable";
import type { PrimitiveValue } from "powerbi-visuals-core/powerbi";
import { must } from "powerbi-visuals-core/testing";

type ChartType = settingsValueType["spc"]["chart_type"];

const optionalTypes = ["i", "i_m", "i_mm", "run", "mr"] as const;
const requiredTypes = ["p", "pp", "u", "up", "xbar", "s"] as const;
const numerators = [5, 9, 6, 8, 7, 12, 6];
const denominators = [10, 12, 10, 11, 10, 14, 9];

function chart(chart_type: ChartType, overrides: SettingsOverrides = {}): settingsValueType {
  return settingsWith({ ...overrides, spc: { ...overrides.spc, chart_type } });
}

function filled(value: PrimitiveValue, n = numerators.length): PrimitiveValue[] {
  return new Array<PrimitiveValue>(n).fill(value);
}

function labels(name: string): string[] {
  return new Array<string>(numerators.length).fill(name);
}

/** The visual, its error text and the warning it sent the host */
function render(settings: settingsValueType | settingsValueType[], args: DataViewArgs) {
  const host = createVisualHost({});
  const shown = vi.spyOn(host, "displayWarningIcon");
  const rendered = renderVisual(settings, { key: sequentialKeys(args.numerators?.length ?? 0), ...args }, { host });
  return {
    visual: rendered.visual,
    error: rendered.element.querySelector(".errormessage")?.textContent ?? null,
    warning: shown.mock.calls.length === 0 ? undefined : shown.mock.calls[0][1]
  };
}

/** Every series but the keys, whose ids are data view positions */
function series(limits: controlLimitsObject): Omit<controlLimitsObject, "keys"> {
  const { keys, ...rest } = limits;
  expect(keys.length).toBe(rest.values.length);
  return rest;
}

function groupLimits(visual: Visual, indicator: string): controlLimitsObject {
  for (let i = 0; i < visual.viewModel.groupNames.length; i++) {
    if (visual.viewModel.groupNames[i][0] === indicator) {
      return visual.viewModel.controlLimits[i];
    }
  }
  throw new Error(`Missing group ${indicator}`);
}

function tooltipNames(items: readonly powerbi.extensibility.VisualTooltipDataItem[]): string[] {
  const names = new Array<string>(items.length);
  for (let i = 0; i < items.length; i++) {
    names[i] = items[i].displayName ?? "";
  }
  return names;
}

describe.each(optionalTypes)("%s chart with a bound but empty denominator column", chart_type => {
  it.each([
    { label: "null", value: null },
    { label: "blank", value: "" }
  ])("plots the numerators when every denominator is $label", ({ value }) => {
    const withoutColumn = render(chart(chart_type), { numerators });
    const result = render(chart(chart_type), { numerators, denominators: filled(value) });
    expect(withoutColumn.error).toBeNull();
    expect(result.error).toBeNull();
    expect(result.warning).toBeUndefined();
    const limits = result.visual.viewModel.controlLimits[0];
    expect(series(limits)).toEqual(series(withoutColumn.visual.viewModel.controlLimits[0]));
    expect(limits.denominators).toEqual(filled(undefined, limits.keys.length));
    expect(limits.numerators).toEqual(filled(undefined, limits.keys.length));
    if (chart_type !== "mr") {
      expect(limits.values).toEqual(numerators);
    }
  });

  it("leaves the counts out of the tooltip and single-group table", () => {
    const result = render(chart(chart_type, { summary_table: { show_table: true } }), { numerators, denominators: filled(null) });
    expect(result.error).toBeNull();
    expect(columnNames(result.visual)).not.toContain("numerator");
    expect(columnNames(result.visual)).not.toContain("denominator");
    const names = tooltipNames(result.visual.viewModel.plotPoints[0].tooltip);
    expect(names).not.toContain("Numerator");
    expect(names).not.toContain("Denominator");
  });

  it("plots ratios and removes rows missing a denominator when any row has one", () => {
    const partial: PrimitiveValue[] = [...denominators];
    partial[1] = null;
    partial[5] = null;
    const result = render(chart(chart_type), { numerators, denominators: partial });
    expect(result.error).toBeNull();
    expect(result.warning).toBe("Category 2 removed due to: Denominator missing.\nCategory 6 removed due to: Denominator missing.");
    const kept = [0, 2, 3, 4, 6];
    const limits = result.visual.viewModel.controlLimits[0];
    for (let i = 0; i < kept.length && chart_type !== "mr"; i++) {
      expect(limits.values[i]).toBeCloseTo(numerators[kept[i]] / denominators[kept[i]], 12);
      expect(limits.denominators[i]).toBe(denominators[kept[i]]);
    }
  });

  it.each([
    { label: "not numbers", value: "a", error: "All denominators are not numbers!" },
    { label: "zero", value: 0, error: "All denominators are zero!" },
    { label: "negative", value: -1, error: "All denominators are negative!" }
  ])("still rejects denominators that are all $label", ({ value, error }) => {
    expect(render(chart(chart_type), { numerators, denominators: filled(value) }).error).toBe(error);
  });
});

it.each(requiredTypes)("still rejects a %s chart whose bound denominators are all null", chart_type => {
  const result = render(chart(chart_type), { numerators, denominators: filled(null), xbar_sds: filled(1) });
  expect(result.error).toBe("All denominators are missing or null!");
});

describe.each(optionalTypes)("%s indicator without denominators in a summary table", chart_type => {
  const plainLimits = () => series(render(chart(chart_type), { numerators }).visual.viewModel.controlLimits[0]);

  it.each([
    { order: "after", first: "Ratio", second: "Plain" },
    { order: "before", first: "Plain", second: "Ratio" }
  ])("is summarised from its numerators $order a p indicator with denominators", ({ first, second }) => {
    const settingsFor = (name: string) => name === "Ratio" ? chart("p") : chart(chart_type);
    const denominatorsFor = (name: string) => name === "Ratio" ? denominators : filled(null);
    const settings = new Array<settingsValueType>(numerators.length * 2);
    settings.fill(settingsFor(first), 0, numerators.length).fill(settingsFor(second), numerators.length);
    const result = render(settings, {
      key: [...sequentialKeys(numerators.length), ...sequentialKeys(numerators.length)],
      indicator: [...labels(first), ...labels(second)],
      numerators: [...numerators, ...numerators],
      denominators: [...denominatorsFor(first), ...denominatorsFor(second)]
    });
    expect(result.error).toBeNull();
    expect(result.warning).toBeUndefined();
    expect(series(groupLimits(result.visual, "Plain"))).toEqual(plainLimits());
    expect(series(groupLimits(result.visual, "Ratio"))).toEqual(series(render(chart("p"), { numerators, denominators }).visual.viewModel.controlLimits[0]));

    const names = columnNames(result.visual);
    expect(names).toContain("numerator");
    expect(names).toContain("denominator");
    const rows = result.visual.viewModel.groupedRows;
    expect(rows).toHaveLength(2);
    const plain = groupedRow(rows, "Plain").table_row;
    expect(plain.numerator).toBe("");
    expect(plain.denominator).toBe("");
    const ratio = groupedRow(rows, "Ratio").table_row;
    expect(ratio.numerator).toBe("6");
    expect(ratio.denominator).toBe("9");
  });

  it("keeps a same-type indicator with denominators as ratios", () => {
    const result = render(chart(chart_type), {
      key: [...sequentialKeys(numerators.length), ...sequentialKeys(numerators.length)],
      indicator: [...labels("Ratio"), ...labels("Plain")],
      numerators: [...numerators, ...numerators],
      denominators: [...denominators, ...filled(null)]
    });
    expect(result.error).toBeNull();
    const ratioSame = render(chart(chart_type), { numerators, denominators });
    expect(series(groupLimits(result.visual, "Plain"))).toEqual(plainLimits());
    expect(series(groupLimits(result.visual, "Ratio"))).toEqual(series(ratioSame.visual.viewModel.controlLimits[0]));
    // mr's first value is the range ending at the second row
    expect(must(groupLimits(result.visual, "Ratio").denominators[0])).toBe(denominators[chart_type === "mr" ? 1 : 0]);
  });
});

it("leaves the counts out of frontend limits only for the indicator without denominators", () => {
  const n = numerators.length;
  const result = render([...new Array<settingsValueType>(n).fill(chart("p")), ...new Array<settingsValueType>(n).fill(chart("i"))], {
    key: [...sequentialKeys(n), ...sequentialKeys(n)],
    indicator: [...labels("Ratio"), ...labels("Plain")],
    numerators: [...numerators, ...numerators],
    denominators: [...denominators, ...filled(null)]
  });
  const limits = frontend.limits(result.visual);
  expect(limits).toHaveProperty(["limits", "0", "denominator"], denominators[0]);
  expect(limits).toHaveProperty(["limits", `${n}`, "Indicator"], "Plain");
  expect(limits).not.toHaveProperty(["limits", `${n}`, "denominator"]);
  expect(limits).not.toHaveProperty(["limits", `${n}`, "numerator"]);
  expect(limits).toHaveProperty(["limits", `${n}`, "value"], numerators[0]);
});
