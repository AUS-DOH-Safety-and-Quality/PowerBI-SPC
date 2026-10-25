import { beforeEach, describe, expect, it, vi } from "vitest";
import * as calculators from "../src/Limit Calculations";
import type { controlLimitsArgs, controlLimitsObject } from "../src/Classes/viewModelClass";
import { renderVisual, settingsWith } from "./helpers/renderVisual";
import { sequentialKeys, type DataViewArgs } from "./helpers/buildDataView";
import { columnNames } from "./helpers/summaryTable";
import { frontend } from "../src/frontend";
import { makeUpdateValues, toDataViews } from "powerbi-visuals-core/frontends";
import { updateType } from "powerbi-visuals-core/powerbi";

/** Two indicator columns split groups as A, A, B, B; one column names each group A, B, C, D */
function indicatorName(multipleColumns: boolean, g: number): string {
  if (!multipleColumns) {
    return String.fromCharCode(65 + g);
  }
  return g < 2 ? "A" : "B";
}

vi.mock("../src/Limit Calculations", { spy: true });

const charts = ["run", "i", "i_m", "i_mm", "mr", "p", "pp", "u", "up", "c", "xbar", "s", "g", "t"] as const;
const layouts = [
  { name: "no grouping field", ends: [], present: false },
  { name: "constant grouping", ends: [], present: true },
  { name: "one rebaseline", ends: [3], present: true },
  { name: "multiple rebaselines", ends: [1, 4, 6], present: true },
  { name: "singleton ends", ends: [0, 6], present: true },
  { name: "every row a group", ends: [0, 1, 2, 3, 4, 5, 6], present: true }
] as const;
const splits = [
  { name: "no click splits", stored: [], ends: [] },
  { name: "one click split", stored: [3], ends: [3] },
  { name: "unsorted duplicate splits", stored: [5, 1, 5], ends: [1, 5] },
  { name: "only stale splits", stored: [-5, -1, 7, 8, 100], ends: [] },
  { name: "valid and stale splits", stored: [100, 7, 4, 8], ends: [4] }
] as const;
const modes = ["plot", "table", "one indicator group", "multiple indicator groups", "multiple indicator columns"] as const;
const numerators = [10, 12, 16, 22, 30, 34, 40, 48];
const denominators = [100, 200, 150, 120, 180, 110, 160, 130];
const sds = [1, 2, 3, 4, 5, 6, 7, 8];
const numericColumns = ["value", "numerator", "denominator", "target", "ll99", "ll95", "ll68", "ul68", "ul95", "ul99"] as const;

/** The limits series holding a summary table column */
function seriesOf(name: typeof numericColumns[number]): Exclude<keyof controlLimitsObject, "keys"> {
  switch (name) {
    case "value":
      return "values";
    case "numerator":
      return "numerators";
    case "denominator":
      return "denominators";
    default:
      return name;
  }
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe.each(charts)("%s rebaselines", chart => {
  describe.each(layouts)("$name", layout => {
    describe.each(splits)("$name", split => {
      describe.each([false, true])("split_on_click=%s", splitOnClick => {
        it.each(modes)("passes each segment's inputs through to the %s", mode => {
          const hasIndicator = mode !== "plot" && mode !== "table";
          const multipleColumns = mode === "multiple indicator columns";
          const indicatorCount = mode === "multiple indicator groups" || multipleColumns ? 3 : 1;
          const count = numerators.length * indicatorCount;
          const key = new Array<string>(count);
          const values = new Array<number>(count);
          const sizes = new Array<number>(count);
          const deviations = new Array<number>(count);
          const groupings = new Array<string>(count);
          const indicator = hasIndicator ? new Array<string>(count) : undefined;
          const indicator2 = multipleColumns ? new Array<string>(count) : undefined;
          const tooltips = new Array<string>(count);
          const keys = sequentialKeys(numerators.length);
          const expectedCalls: controlLimitsArgs[] = [];
          const expectedGroupingIndexes: number[][] = [];
          const expectedPositions: number[][] = [];
          const expectedRanges: number[][][] = [];
          const hasDenominators = ["p", "pp", "u", "up", "xbar", "s"].includes(chart);

          for (let g = 0; g < indicatorCount; g++) {
            const positions: number[] = [];
            const ranges: number[][] = [];
            let start = 0;
            let grouping = 0;
            // Different indicator boundaries expose indexing the raw column with group-local positions.
            const groupingEnds = new Array<number>(layout.ends.length);
            for (let i = 0; i < layout.ends.length; i++) {
              groupingEnds[i] = g === 1 ? 6 - layout.ends[layout.ends.length - i - 1] : layout.ends[i];
            }
            const ends = new Set<number>(groupingEnds);
            if (!hasIndicator) {
              for (let i = 0; i < split.ends.length; i++) {
                ends.add(split.ends[i]);
              }
            }
            expectedGroupingIndexes.push(groupingEnds);
            for (let i = 0; i < numerators.length; i++) {
              const row = i * indicatorCount + g;
              key[row] = keys[i];
              values[row] = numerators[i] + g;
              sizes[row] = denominators[i] + g;
              deviations[row] = sds[i] + g;
              groupings[row] = `G${grouping}`;
              tooltips[row] = `tooltip ${g}/${i}`;
              if (indicator !== undefined) {
                indicator[row] = indicatorName(multipleColumns, g);
              }
              if (indicator2 !== undefined) {
                indicator2[row] = g === 1 ? "Y" : "X";
              }
              if (groupingEnds.includes(i)) {
                grouping++;
              }
              if (ends.has(i) || i === numerators.length - 1) {
                const segmentKeys = new Array<controlLimitsArgs["keys"][number]>(i - start + 1);
                const segmentValues = new Array<number>(segmentKeys.length);
                const segmentSizes = hasDenominators ? new Array<number>(segmentKeys.length) : undefined;
                const segmentSds = chart === "xbar" ? new Array<number>(segmentKeys.length) : undefined;
                const subset = new Array<number>(segmentKeys.length);
                const resultStart = positions.length;
                for (let j = start; j <= i; j++) {
                  const local = j - start;
                  segmentKeys[local] = { x: j, id: j * indicatorCount + g, label: chart === "g" || chart === "t" ? String(j) : keys[j] };
                  segmentValues[local] = numerators[j] + g;
                  if (segmentSizes !== undefined) {
                    segmentSizes[local] = denominators[j] + g;
                  }
                  if (segmentSds !== undefined) {
                    segmentSds[local] = sds[j] + g;
                  }
                  subset[local] = local;
                  if (chart !== "mr" || j > start) {
                    positions.push(j);
                  }
                }
                expectedCalls.push({
                  keys: segmentKeys, numerators: segmentValues, denominators: segmentSizes, xbar_sds: segmentSds,
                  subset_points: subset, outliers_in_limits: true
                });
                ranges.push([resultStart, positions.length]);
                start = i + 1;
              }
            }
            expectedPositions.push(positions);
            expectedRanges.push(ranges);
          }

          const settings = settingsWith({
            spc: { chart_type: chart, split_on_click: splitOnClick, perc_labels: "No", outliers_in_limits: true },
            summary_table: { show_table: mode !== "plot" },
            lines: { show_68: true, show_95: true }
          });
          const data: DataViewArgs = {
            key, numerators: values, denominators: hasDenominators ? sizes : undefined,
            xbar_sds: chart === "xbar" ? deviations : undefined,
            groupings: layout.present ? groupings : undefined, indicator, indicator2, tooltips
          };
          const rendered = renderVisual(settings, data, { splitIndexes: [...split.stored] });
          const model = rendered.visual.viewModel;
          const calls = vi.mocked(calculators[chart]).mock.calls;
          expect(calls).toHaveLength(expectedCalls.length);
          for (let i = 0; i < expectedCalls.length; i++) {
            expect(calls[i][0]).toEqual(expectedCalls[i]);
          }
          if (indicatorCount === 1 && expectedPositions[0].length === 0) {
            expect(rendered.element.querySelector(".errormessage")?.textContent)
              .toBe("Moving range charts need at least two observations in the same rebaseline group!");
            expect(model.controlLimits).toEqual([]);
            expect(model.plotPoints).toEqual([]);
            return;
          }
          expect(rendered.element.querySelector(".errormessage")).toBeNull();
          expect(model.inputData).toHaveLength(indicatorCount);
          expect(model.groupStartEndIndexes).toEqual(expectedRanges);
          for (let g = 0; g < indicatorCount; g++) {
            expect(model.inputData[g].groupingIndexes).toEqual(expectedGroupingIndexes[g]);
            const limits = model.controlLimits[g];
            expect(limits.keys).toHaveLength(expectedPositions[g].length);
            for (let i = 0; i < limits.keys.length; i++) {
              expect(limits.keys[i].x).toBe(expectedPositions[g][i]);
              expect(limits.keys[i].id).toBe(expectedPositions[g][i] * indicatorCount + g);
            }
          }
          const rows = rendered.element.querySelectorAll("tbody tr");
          const output = frontend.limits(rendered.visual);
          const expectedRowIds: number[] = [];
          for (let g = 0; g < indicatorCount; g++) {
            for (let i = 0; i < expectedPositions[g].length; i++) {
              expectedRowIds.push(expectedPositions[g][i] * indicatorCount + g);
            }
          }
          expect(output.rowIds).toEqual(expectedRowIds);
          expect(output.limits).toHaveLength(expectedRowIds.length);
          if (indicatorCount > 1) {
            expect(rows).toHaveLength(indicatorCount);
            const columns = columnNames(rendered.visual);
            for (let g = 0; g < indicatorCount; g++) {
              const limits = model.controlLimits[g];
              const last = limits.keys.length - 1;
              const row = model.groupedRows[g].table_row;
              expect(row.indicator_0).toBe(indicatorName(multipleColumns, g));
              if (multipleColumns) {
                expect(row.indicator_1).toBe(g === 1 ? "Y" : "X");
              }
              expect(row.latest_date).toBe(limits.keys[last]?.label ?? "");
              expect(row.tooltip_0).toBe(last < 0 ? "" : `tooltip ${g}/${expectedPositions[g][last]}`);
              const cells = rows[g].querySelectorAll("td");
              for (let c = 0; c < numericColumns.length; c++) {
                const name = numericColumns[c];
                const value = limits[seriesOf(name)][last];
                const format = model.inputSettings.derivedSettings[g].formatValue;
                expect(row[name]).toBe(format(value, name === "numerator" || name === "denominator" ? "input" : "value"));
              }
              const rowCells: Readonly<Record<string, string>> = row;
              for (let c = 0; c < columns.length; c++) {
                expect(cells[c].textContent).toBe(rowCells[columns[c]]);
              }
            }
          } else {
            expect(model.plotPoints).toHaveLength(expectedPositions[0].length);
            if (mode !== "plot") {
              expect(rows).toHaveLength(expectedPositions[0].length);
            }
          }
        });
      });
    });
  });
});

it.each(charts)("recovers %s after filtering below saved splits and restoring the data", chart => {
  const settings = settingsWith({ spc: { chart_type: chart, perc_labels: "No" } });
  const data = { key: sequentialKeys(8), numerators, denominators, xbar_sds: sds };
  const rendered = renderVisual(settings, data, { splitIndexes: [3, 6, 100] });
  expect(rendered.element.querySelector(".errormessage")).toBeNull();
  const original = structuredClone(rendered.visual.viewModel.controlLimits);
  rendered.update(settings, {
    key: sequentialKeys(2), numerators: numerators.slice(0, 2),
    denominators: denominators.slice(0, 2), xbar_sds: sds.slice(0, 2)
  });
  expect(rendered.element.querySelector(".errormessage")).toBeNull();
  expect(rendered.visual.viewModel.controlLimits[0].values).toHaveLength(chart === "mr" ? 1 : 2);
  expect(rendered.visual.viewModel.splitIndexes).toEqual([3, 6, 100]);
  rendered.update(settings, data);
  expect(rendered.element.querySelector(".errormessage")).toBeNull();
  expect(rendered.visual.viewModel.controlLimits).toEqual(original);
});

it("keeps an empty moving-range indicator beside an indicator with results", () => {
  const rendered = renderVisual(settingsWith({
    spc: { chart_type: "mr" },
    lines: { show_alt_target: true, alt_target: 5 },
    outliers: { astronomical: true },
    nhs_icons: { show_variation_icons: true, show_assurance_icons: true }
  }), {
    key: ["1", "1", "2", "2", "3", "3"],
    indicator: ["A", "B", "A", "B", "A", "B"],
    numerators: [10, 20, 12, 22, 14, 24],
    groupings: ["one", "all", "two", "all", "three", "all"],
    tooltips: ["a1", "b1", "a2", "b2", "a3", "b3"]
  });
  expect(rendered.element.querySelector(".errormessage")).toBeNull();
  const rows = rendered.visual.viewModel.groupedRows;
  expect(rows).toHaveLength(2);
  expect(rows[0].table_row.indicator_0).toBe("A");
  expect(rows[0].table_row.latest_date).toBe("");
  expect(rows[0].table_row.tooltip_0).toBe("");
  for (let i = 0; i < numericColumns.length; i++) {
    expect(rows[0].table_row[numericColumns[i]]).toBe("");
  }
  expect(rows[0].table_row.alt_target).toBe("");
  expect(rows[0].variation_icons).toEqual([]);
  expect(rows[0].table_row.assurance).toBe("none");
  expect(rows[1].table_row.indicator_0).toBe("B");
  expect(rows[1].table_row.latest_date).toBe("3");
  expect(rows[1].table_row.value).toBe("2.00");
  expect(rows[1].table_row.tooltip_0).toBe("b3");
  const tableRows = rendered.element.querySelectorAll("tbody tr");
  expect(tableRows).toHaveLength(2);
  expect(tableRows[0].querySelectorAll("svg")).toHaveLength(0);
  expect(frontend.limits(rendered.visual).rowIds).toEqual([3, 5]);
});

it.each(charts)("keeps %s grouping boundaries aligned after dropping missing observations", chart => {
  const rendered = renderVisual(settingsWith({ spc: { chart_type: chart, perc_labels: "No" } }), {
    key: sequentialKeys(6), numerators: [0, null, 30, 40, null, 60],
    denominators: denominators.slice(0, 6), xbar_sds: sds.slice(0, 6),
    groupings: ["A", "B", "A", "B", "C", "B"]
  }, { splitIndexes: [1, 5, 100] });
  expect(rendered.element.querySelector(".errormessage")).toBeNull();
  const model = rendered.visual.viewModel;
  expect(model.inputData[0].groupingIndexes).toEqual([1]);
  expect(model.groupStartEndIndexes[0]).toEqual(chart === "mr" ? [[0, 1], [1, 2]] : [[0, 2], [2, 4]]);
  const keys = model.controlLimits[0].keys;
  const expectedIds = chart === "mr" ? [2, 5] : [0, 2, 3, 5];
  expect(keys).toHaveLength(expectedIds.length);
  for (let i = 0; i < keys.length; i++) {
    expect(keys[i].id).toBe(expectedIds[i]);
  }
});

it.each(charts)("passes frontend grouping data to the %s summary table after sorting indicators", chart => {
  const settings = settingsWith({ spc: { chart_type: chart, perc_labels: "No" } });
  const rendered = renderVisual(settings, {
    key: ["1", "2"], numerators: [10, 12], denominators: [100, 100], xbar_sds: [1, 1]
  });
  const aggregated = makeUpdateValues({
    categories: ["2024-01-04", "2024-01-04", "2024-01-01", "2024-01-01", "2024-01-03", "2024-01-03", "2024-01-02", "2024-01-02"], category_name: "key",
    indicators: { Site: ["A", "A", "A", "A", "A", "A", "A", "A"], Measure: ["X", "Y", "X", "Y", "X", "Y", "X", "Y"] },
    numerators: [14, 24, 10, 20, 12, 22, 11, 21], denominators: new Array<number>(8).fill(100), xbar_sds: new Array<number>(8).fill(1),
    groupings: ["late", "late", "early", "early", "late", "late", "early", "late"]
  }, settings, { numerators: "sum", denominators: "sum", groupings: "first", xbar_sds: "first", tooltips: "first", labels: "first" });
  rendered.visual.update({
    dataViews: toDataViews(aggregated.dataViews), viewport: { width: 500, height: 500 },
    type: updateType.data, frontend: true, headless: true
  });
  expect(rendered.element.querySelector(".errormessage")).toBeNull();
  const model = rendered.visual.viewModel;
  expect(model.inputData[0].groupingIndexes).toEqual([1]);
  expect(model.inputData[1].groupingIndexes).toEqual([0]);
  expect(model.groupStartEndIndexes).toEqual(chart === "mr"
    ? [[[0, 1], [1, 2]], [[0, 0], [0, 2]]]
    : [[[0, 2], [2, 4]], [[0, 1], [1, 4]]]);
  expect(model.groupedRows[0].table_row.indicator_1).toBe("X");
  expect(model.groupedRows[1].table_row.indicator_1).toBe("Y");
  expect(rendered.element.querySelectorAll("tbody tr")).toHaveLength(2);
  expect(frontend.limits(rendered.visual).rowIds).toEqual(chart === "mr" ? [1, 3, 6, 7] : [0, 1, 2, 3, 4, 5, 6, 7]);
});
