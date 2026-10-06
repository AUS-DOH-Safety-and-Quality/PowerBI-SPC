import type powerbi from "powerbi-visuals-api";
import { describe, expect, it, vi } from "vitest";
import { createVisualHost, testDom } from "powerbi-visuals-utils-testutils";
import { createDefaultValues } from "powerbi-visuals-core/settings";
import { indexColumnsByRole, formatPrimitiveValue } from "powerbi-visuals-core/powerbi";
import { pickRows } from "powerbi-visuals-core/data";
import settingsModel from "../../src/settings";
import derivedSettingsClass from "../../src/Classes/derivedSettingsClass";
import viewModelClass from "../../src/Classes/viewModelClass";
import extractInputData from "../../src/Functions/extractInputData";
import extractKeys from "../../src/Functions/extractKeys";
import validateInputData from "../../src/Functions/validateInputData";
import valueFormatter from "../../src/Functions/valueFormatter";
import { Visual } from "../../src/visual";
import buildDataView from "../helpers/buildDataView";

function extract(view: powerbi.DataView, indices: number[], chart: "i" | "p" | "xbar" = "i") {
  const settings = createDefaultValues(settingsModel);
  settings.spc.chart_type = chart;
  const categorical = view.categorical!;
  const positions = new Map<number, number>();
  const messages: string[][] = [];
  for (let i = 0; i < indices.length; i++) {
    positions.set(indices[i], i);
    messages.push([]);
  }
  return extractInputData(categorical, {
    categories: indexColumnsByRole(categorical.categories ?? []), values: indexColumnsByRole(categorical.values ?? [])
  }, settings, new derivedSettingsClass(settings.spc), messages, indices, positions);
}

describe("input row contracts", () => {
  it("preserves selection positions and keeps shortened optional columns aligned", () => {
    expect(pickRows([10, 20], [1, 5, 0, 1])).toEqual([20, undefined, 10, 20]);
    const rows = [];
    for (let i = 0; i < 4; i++) {
      const settings = createDefaultValues(settingsModel);
      settings.scatter.size = i + 1;
      rows.push(settings);
    }
    const view = buildDataView({ key: ["A", "B", "C", "D"], numerators: [1, null, 3, 4],
      labels: [null, "removed", "C label"], tooltips: [0, "removed", false], groupings: ["one", "one", null, "two"] }, rows);
    view.categorical!.values![0].highlights = [0, 2];
    const result = extract(view, [3, 1, 0, 2, 5, 3]);
    if (result.status !== "valid") throw new Error(result.error);
    expect(result.data.limitInputArgs.keys).toEqual([
      { x: 0, id: 3, label: "D" }, { x: 1, id: 0, label: "A" },
      { x: 2, id: 2, label: "C" }, { x: 3, id: 3, label: "D" }
    ]);
    expect(result.data.limitInputArgs.numerators).toEqual([4, 1, 3, 4]);
    expect(result.data.labels).toEqual([undefined, undefined, "C label", undefined]);
    expect(result.data.highlights).toEqual([undefined, 0, undefined, undefined]);
    expect(result.data.tooltips).toEqual([
      [{ displayName: "Extra Tooltip", value: "" }], [{ displayName: "Extra Tooltip", value: "0" }],
      [{ displayName: "Extra Tooltip", value: "false" }], [{ displayName: "Extra Tooltip", value: "" }]
    ]);
    expect(result.data.groupings).toEqual(["two", "one", undefined, "two"]);
    expect(result.data.groupingIndexes).toEqual([0, 1, 2]);
    expect(result.data.scatter_formatting[0].size).toBe(4);
    expect(result.data.scatter_formatting[1].size).toBe(1);
    expect(result.data.scatter_formatting[2].size).toBe(3);
    expect(result.data.scatter_formatting[0]).not.toBe(result.data.scatter_formatting[3]);
    expect(result.data.anyHighlights).toBe(true);
    expect(result.data.anyLabels).toBe(true);
    expect(result.data.warningMessage).toBe("Category B removed due to: Numerator missing.\nCategory undefined removed due to: Numerator missing.");
  });

  it("distinguishes absent optional columns from present empty columns", () => {
    const absent = extract(buildDataView({ key: ["A", "B"], numerators: [1, 2] }), [0, 1]);
    if (absent.status !== "valid") throw new Error(absent.error);
    expect(absent.data.labels).toBeUndefined();
    expect(absent.data.tooltips).toBeUndefined();
    expect(absent.data.highlights).toBeUndefined();
    expect(absent.data.limitInputArgs.denominators).toBeUndefined();
    const view = buildDataView({ key: ["A", "B"], numerators: [1, 2], labels: [], tooltips: [] });
    view.categorical!.values![0].highlights = [];
    const present = extract(view, [0, 1]);
    if (present.status !== "valid") throw new Error(present.error);
    expect(present.data.labels).toEqual([undefined, undefined]);
    expect(present.data.highlights).toEqual([undefined, undefined]);
    expect(present.data.anyLabels).toBe(false);
    expect(present.data.anyHighlights).toBe(false);
    expect(present.data.tooltips).toHaveLength(2);
  });

  it("narrows required numerics and returns errors without fabricated data", () => {
    const valid = extract(buildDataView({ key: ["A", "B", "C"], numerators: [1, 2, 3], denominators: [10, null, 20], xbar_sds: [1, 2, 3] }), [0, 1, 2], "xbar");
    if (valid.status !== "valid") throw new Error(valid.error);
    expect(valid.data.limitInputArgs.numerators).toEqual([1, 3]);
    expect(valid.data.limitInputArgs.denominators).toEqual([10, 20]);
    expect(valid.data.limitInputArgs.xbar_sds).toEqual([1, 3]);
    expect("subset_points" in valid.data.limitInputArgs).toBe(false);
    expect(extract(buildDataView({ key: ["A"], numerators: [null] }), [0])).toEqual({ status: "invalid", error: "All numerators are missing or null!" });
    expect(extract(buildDataView({ key: ["A"], numerators: [1] }), [0], "p")).toEqual({ status: "invalid", error: "All denominators missing or null!" });
    expect(extract(buildDataView({ key: ["A"], numerators: [1] }), [])).toEqual({ status: "invalid", error: "No valid data found!" });
    expect(extract(buildDataView({ key: ["A"] }), [0])).toEqual({ status: "invalid", error: "No Numerators passed!" });
  });

  it("preserves local row-message priority and uniform versus mixed failure errors", () => {
    const settings = createDefaultValues(settingsModel);
    settings.spc.chart_type = "p";
    const chart = new derivedSettingsClass(settings.spc).chart_type_props;
    expect(validateInputData([undefined, "B"], [undefined, -1], [undefined, 2], undefined, chart)).toEqual({
      status: 1, messages: ["Denominator missing", "Numerator negative"], error: "No valid data found!"
    });
    expect(validateInputData(["A", "B"], [NaN, NaN], [1, 2], undefined, chart)).toEqual({
      status: 1, messages: ["Numerator is not a number", "Numerator is not a number"], error: "All numerators are not numbers!"
    });
  });

  it("retains scalar key conversion, duplicate query groups and complete date hierarchies", () => {
    const settings = createDefaultValues(settingsModel);
    const column = (queryName: string, values: powerbi.PrimitiveValue[], category?: string): powerbi.DataViewCategoryColumn => ({
      source: { displayName: queryName, queryName, roles: { key: true }, type: category === undefined ? { text: true } : { temporal: true, category } as powerbi.ValueTypeDescriptor }, values
    });
    expect(extractKeys([column("key", [0, false, null, ""])], settings, [1, 0, 3, 2])).toEqual(["false", "0", "", undefined]);
    expect(extractKeys([column("key", ["A", "B"]), column("key", ["X", "Y"])], settings, [1, 0])).toEqual(["B Y", "A X"]);
    expect(extractKeys([column("key", [null]), column("key", [null])], settings, [0])).toStrictEqual([undefined]);
    expect(extractKeys([], settings, [0])).toStrictEqual([undefined]);
    const dates = extractKeys([
      column("Date Hierarchy.Year", [2024, 2025], "Years"), column("Date Hierarchy.Month", ["January", "February"], "Months"),
      column("Date Hierarchy.Day", [15, 20], "DayOfMonth"), column("label", ["A", "B"])
    ], settings, [1, 0]);
    expect(dates[0]?.trim()).toBe("20/02/2025 B");
    expect(dates[1]?.trim()).toBe("15/01/2024 A");
    expect(formatPrimitiveValue(false)).toBe("false");
  });

  it("chooses chart-specific count precision and percentage suffixes locally", () => {
    const settings = createDefaultValues(settingsModel);
    settings.spc.sig_figs = 2;
    settings.spc.chart_type = "i";
    let formatter = valueFormatter(settings, new derivedSettingsClass(settings.spc));
    expect(formatter(12.625, "integer")).toBe("12.63");
    settings.spc.chart_type = "p";
    formatter = valueFormatter(settings, new derivedSettingsClass(settings.spc));
    expect(formatter(12.625, "integer")).toBe("13");
    expect(formatter(12.625, "value")).toBe("12.63%");
    expect(formatter(undefined, "value")).toBe("");
  });

  it("builds grouped selection identities only for accepted raw rows", () => {
    const host = createVisualHost({});
    const createdRows: number[] = [];
    const original = host.createSelectionIdBuilder.bind(host);
    vi.spyOn(host, "createSelectionIdBuilder").mockImplementation(() => {
      const builder = original();
      const withCategory = builder.withCategory.bind(builder);
      builder.withCategory = (category, index) => { createdRows.push(index); return withCategory(category, index); };
      return builder;
    });
    const model = new viewModelClass();
    const view = buildDataView({ key: ["A0", "B0", "A1", "B1", "A2", "B2"], indicator: ["A", "B", "A", "B", "A", "B"], numerators: [1, 3, null, 4, 2, 5] });
    expect(model.update({ dataViews: [view], viewport: { width: 500, height: 500 }, type: 2 }, host).status).toBe(true);
    expect(createdRows).toEqual([0, 4, 1, 3, 5]);
    expect(model.identities[0]).toHaveLength(2);
    expect(model.identities[1]).toHaveLength(3);
  });

  it("clears failed extraction state and recovers on the next visual update", () => {
    const element = testDom("500", "500");
    const host = createVisualHost({});
    const failed = vi.spyOn(host.eventService, "renderingFailed");
    const visual = new Visual({ element, host });
    try {
      const update = (numerators: (number | null)[]) => visual.update({ dataViews: [buildDataView({ key: ["A", "B", "C"], numerators })], viewport: { width: 500, height: 500 }, type: 2 });
      update([1, 2, 3]);
      expect(failed).not.toHaveBeenCalled();
      update([null, null, null]);
      expect(visual.viewModel.inputData).toEqual([]);
      expect(visual.viewModel.plotPoints).toEqual([]);
      update([2, 3, 4]);
      expect(visual.viewModel.inputData[0].limitInputArgs.numerators).toEqual([2, 3, 4]);
      expect(visual.viewModel.plotPoints[0]).toHaveLength(3);
    } finally {
      failed.mockRestore();
      element.remove();
    }
  });
});
