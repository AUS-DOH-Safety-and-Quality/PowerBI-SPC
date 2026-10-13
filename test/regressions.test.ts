import type powerbi from "powerbi-visuals-api";
import { describe, expect, it } from "vitest";
import { createDefaultValues } from "powerbi-visuals-core/settings";
import type { PrimitiveValue } from "powerbi-visuals-core/powerbi";
import { cells, findBy, must } from "powerbi-visuals-core/testing";
import settingsModel, { type settingsValueType } from "../src/settings";
import extractKeys from "../src/Functions/extractKeys";
import parseInputDates from "../src/Functions/parseInputDates";
import { sequentialKeys } from "./helpers/buildDataView";
import { columnValues } from "./helpers/summaryTable";
import { renderVisual, settingsWith, type SettingsOverrides } from "./helpers/renderVisual";

/** Two indicators, A then B, sharing keys */
function twoGroups(a: number[], b: number[]): { key: string[]; indicator: string[]; numerators: number[] } {
  const key = sequentialKeys(a.length);
  const indicator: string[] = [];
  for (let i = 0; i < a.length + b.length; i++) {
    indicator.push(i < a.length ? "A" : "B");
  }
  return { key: [...key, ...sequentialKeys(b.length)], indicator, numerators: [...a, ...b] };
}

/** One settings object per row, with the alt. target given row by row */
function perRowTargets(targets: (number | undefined)[], overrides: SettingsOverrides): settingsValueType[] {
  const settings: settingsValueType[] = [];
  for (let i = 0; i < targets.length; i++) {
    settings.push(settingsWith({ ...overrides, lines: { ...overrides.lines, show_alt_target: true, alt_target: targets[i] } }));
  }
  return settings;
}

function chartIcons(element: HTMLElement): (string | null)[] {
  const groups = element.querySelectorAll("svg > .icongroup > g");
  const names: (string | null)[] = [];
  for (let i = 0; i < groups.length; i++) {
    names.push(groups[i].getAttribute("class"));
  }
  return names;
}

function yTicks(element: HTMLElement): (string | null)[] {
  const ticks = element.querySelectorAll(".yaxisgroup text");
  const labels: (string | null)[] = [];
  for (let i = 0; i < ticks.length; i++) {
    labels.push(ticks[i].textContent);
  }
  return labels;
}

function keyColumn(queryName: string, values: PrimitiveValue[], category?: string): powerbi.DataViewCategoryColumn {
  const type = category === undefined ? { dateTime: true, temporal: true } : { temporal: true, category };
  return {
    source: { displayName: queryName, queryName, roles: { key: true }, type: type as unknown as powerbi.ValueTypeDescriptor },
    values: cells(values)
  };
}

const varying = [5, 6, 7, 5, 6, 8, 5, 6, 7, 5];

describe("reported issues", () => {
  it("#396 draws an empty data view as a blank canvas, whatever show_errors is", () => {
    const shows = [true, false];
    for (let s = 0; s < shows.length; s++) {
      const rendered = renderVisual(settingsWith({ canvas: { show_errors: shows[s] } }), { key: [], numerators: [] });
      expect(rendered.element.querySelector(".errormessage")).toBeNull();
      expect(rendered.element.textContent).toBe("");
    }
  });

  it("#202 reports a capitalised improvement direction as a settings error naming the value", () => {
    const settings = settingsWith({ outliers: { improvement_direction: "Increase" as settingsValueType["outliers"]["improvement_direction"] } });
    const rendered = renderVisual(settings, { key: sequentialKeys(5), numerators: [1, 2, 3, 4, 5] });
    expect(must(rendered.element.querySelector(".errormessage")).textContent).toContain("Increase is not a valid value for improvement_direction");
  });

  it("#485 explains a moving range chart with fewer than two observations", () => {
    const inputs = [{ key: ["1"], numerators: [5] }, { key: ["1", "2", "3"], numerators: [5, null, null] }];
    for (let i = 0; i < inputs.length; i++) {
      const rendered = renderVisual(settingsWith({ spc: { chart_type: "mr" } }), inputs[i]);
      expect(rendered.element.textContent).toBe("Moving range charts need at least two valid observations!");
    }
  });

  it("#488 keeps rates above one but removes proportions with a numerator above the denominator", () => {
    const charts = [
      { chart: "u", values: [0.5, 1.2, 0.3, 0.4], warning: "" },
      { chart: "up", values: [0.5, 1.2, 0.3, 0.4], warning: "" },
      { chart: "p", values: [50, 30, 40], warning: "Category 2 removed due to: Denominator < numerator." },
      { chart: "pp", values: [50, 30, 40], warning: "Category 2 removed due to: Denominator < numerator." }
    ] as const;
    for (let c = 0; c < charts.length; c++) {
      const viewModel = renderVisual(settingsWith({ spc: { chart_type: charts[c].chart } }), {
        key: sequentialKeys(4), numerators: [5, 12, 3, 4], denominators: [10, 10, 10, 10]
      }).visual.viewModel;
      expect(viewModel.controlLimits[0].values).toEqual(charts[c].values);
      expect(viewModel.inputData[0].warningMessage).toBe(charts[c].warning);
    }
  });

  it("removes zero denominators with a warning, and rejects a series of only zero denominators", () => {
    const charts = ["u", "p"] as const;
    for (let c = 0; c < charts.length; c++) {
      const viewModel = renderVisual(settingsWith({ spc: { chart_type: charts[c] } }), {
        key: sequentialKeys(4), numerators: [1, 2, 3, 4], denominators: [10, 0, 10, 10]
      }).visual.viewModel;
      const keys = viewModel.controlLimits[0].keys;
      const labels: string[] = [];
      for (let i = 0; i < keys.length; i++) {
        labels.push(keys[i].label);
      }
      expect(labels).toEqual(["1", "3", "4"]);
      expect(viewModel.inputData[0].warningMessage).toBe("Category 2 removed due to: Denominator is zero.");
    }
    const zeros = renderVisual(settingsWith({ spc: { chart_type: "p" } }), { key: ["1", "2"], numerators: [0, 0], denominators: [0, 0] });
    expect(zeros.element.textContent).toBe("All denominators are zero!");
  });

  it("#508 shows a constant series above its target as common cause and passing, on the chart and in the table", () => {
    const settings = settingsWith({
      spc: { chart_type: "p" },
      outliers: { astronomical: true, shift: true, trend: true, two_in_three: true, improvement_direction: "increase" },
      nhs_icons: { show_variation_icons: true, show_assurance_icons: true },
      lines: { show_alt_target: true, alt_target: 95 }
    });
    const constant = new Array<number>(12).fill(10);
    const chart = renderVisual(settings, { key: sequentialKeys(12), numerators: constant, denominators: constant });
    expect(chartIcons(chart.element)).toEqual(["commonCause", "consistentPass"]);
    const table = renderVisual(settings, { ...twoGroups(constant, constant), denominators: [...constant, ...constant] });
    const rows = table.visual.viewModel.groupedRows;
    for (let i = 0; i < rows.length; i++) {
      expect(rows[i].variation_icons).toEqual(["commonCause"]);
      expect(rows[i].table_row.assurance).toBe("consistentPass");
    }
  });

  it("#360 #257 draws no assurance icon without an alt. target at the last point", () => {
    const icons = { nhs_icons: { show_assurance_icons: true }, spc: { chart_type: "i" } } as const;
    const ending: (number | undefined)[] = [6, 6, 6, 6, 6, 6, 6, 6, undefined, undefined];
    const chart = renderVisual(perRowTargets(ending, icons), { key: sequentialKeys(10), numerators: varying });
    expect(chartIcons(chart.element)).toEqual([]);
    const mixed: (number | undefined)[] = [];
    for (let i = 0; i < 20; i++) {
      mixed.push(i < 10 ? 100 : undefined);
    }
    const filters = [{ filter: "all", expected: [["A", "consistentFail"], ["B", "none"]] }, { filter: "any", expected: [["A", "consistentFail"]] }] as const;
    for (let f = 0; f < filters.length; f++) {
      const table = renderVisual(perRowTargets(mixed, { ...icons, summary_table: { table_assurance_filter: filters[f].filter } }),
                                 twoGroups(varying, [1, 2, 1, 2, 1, 2, 1, 2, 1, 2]));
      const rows = table.visual.viewModel.groupedRows;
      const assurance: string[][] = [];
      for (let i = 0; i < rows.length; i++) {
        assurance.push([rows[i].table_row.Indicator, rows[i].table_row.assurance]);
      }
      expect(assurance).toEqual(filters[f].expected);
    }
  });

  it("#510 keeps an alt. target that changes every row visible, stepping at each change", () => {
    const targets = [10, 11, 12, 13, 14];
    const joins = [false, true];
    for (let j = 0; j < joins.length; j++) {
      const rendered = renderVisual(perRowTargets(targets, { spc: { chart_type: "i" }, lines: { join_rebaselines_alt_target: joins[j] } }), {
        key: sequentialKeys(5), numerators: [12, 13, 14, 12, 16]
      });
      const line = must(findBy(rendered.visual.viewModel.groupedLines, 0, "alt_target"))[1];
      const expected: [number, number | undefined][] = [[0, 10]];
      for (let i = 1; i < targets.length; i++) {
        expected.push([i, targets[i - 1]], [i, joins[j] ? targets[i] : undefined], [i, targets[i]]);
      }
      const points: [number, number | undefined][] = [];
      for (let i = 0; i < line.length; i++) {
        points.push([line[i].x, line[i].line_value]);
      }
      expect(points).toEqual(expected);
      // Each old target is drawn as a segment up to its change; joined, the steps are one path
      const path = must(rendered.element.querySelector(".alt_target-linegroup path")?.getAttribute("d"));
      expect(path.split("M").length - 1).toBe(joins[j] ? 1 : targets.length);
      expect(path.split("L").length - 1).toBe(joins[j] ? 3 * (targets.length - 1) : targets.length - 1);
    }
  });

  it("#514 labels count charts with whole-number ticks unless decimals are asked for", () => {
    const charts = [
      { settings: settingsWith({ spc: { chart_type: "c" } }), expected: ["0", "1", "2", "3", "4", "5", "6"] },
      { settings: settingsWith({ spc: { chart_type: "g" } }), expected: ["0", "1", "2", "3", "4", "5", "6", "7", "8"] },
      { settings: settingsWith({ spc: { chart_type: "c" }, y_axis: { ylimit_sig_figs: 2 } }), expected: ["0.00", "1.00", "2.00", "3.00", "4.00", "5.00", "6.00"] }
    ];
    for (let c = 0; c < charts.length; c++) {
      const rendered = renderVisual(charts[c].settings, { key: sequentialKeys(8), numerators: [1, 2, 1, 0, 2, 1, 1, 2] });
      expect(yTicks(rendered.element)).toEqual(charts[c].expected);
    }
  });

  it("#321 groups rows with a blank indicator under a blank name", () => {
    const rendered = renderVisual(settingsWith({ spc: { chart_type: "i" } }), {
      key: ["1", "2", "3", "4", "1", "2", "3", "4"], indicator: ["A", "A", "A", "A", null, null, null, null] as string[], numerators: [1, 2, 3, 4, 5, 6, 7, 8]
    });
    expect(columnValues(rendered.visual.viewModel.groupedRows, "Indicator")).toEqual(["A", ""]);
  });

  it("#475 extends every line to the last point after a click split", () => {
    const rendered = renderVisual(settingsWith({ spc: { chart_type: "i", split_on_click: true } }), { key: sequentialKeys(10), numerators: varying }, { splitIndexes: [4] });
    const lines = rendered.visual.viewModel.groupedLines;
    expect(lines.length).toBeGreaterThan(0);
    for (let i = 0; i < lines.length; i++) {
      expect(lines[i][1][lines[i][1].length - 1].x).toBe(9);
    }
  });

  it("#556 filters the table by variation with icons drawn when the first group is excluded", () => {
    const rendered = renderVisual(settingsWith({
      spc: { chart_type: "i" },
      outliers: { astronomical: true },
      nhs_icons: { show_variation_icons: true, show_assurance_icons: true },
      summary_table: { table_variation_filter: "special" },
      lines: { show_alt_target: true, alt_target: 7 }
    }), twoGroups(varying, [5, 6, 7, 5, 6, 8, 5, 6, 7, 30]));
    expect(rendered.element.querySelector(".errormessage")).toBeNull();
    const rows = rendered.element.querySelectorAll("tbody tr");
    expect(rows).toHaveLength(1);
    expect(must(rows[0].querySelector("td")).textContent).toBe("B");
    expect(rows[0].querySelectorAll("svg")).toHaveLength(2);
  });

  it("shows each group's own last tooltip in a grouped moving range table", () => {
    const rendered = renderVisual(settingsWith({ spc: { chart_type: "mr" } }), {
      ...twoGroups([10, 12, 16, 22], [30, 34, 40, 48]), tooltips: ["t1", "t2", "t3", "t4", "t5", "t6", "t7", "t8"]
    });
    expect(columnValues(rendered.visual.viewModel.groupedRows, "Extra Tooltip")).toEqual(["t4", "t8"]);
  });
});

describe("date keys", () => {
  it("reads a date-only string as a local date", () => {
    expect(parseInputDates([keyColumn("key", ["2024-01-15"])], [0]).dates).toEqual([new Date(2024, 0, 15)]);
  });

  it("keeps each row's quarter when an earlier quarter is blank", () => {
    const keys = extractKeys([
      keyColumn("Date Hierarchy.Year", [2024, 2024], "Years"), keyColumn("Date Hierarchy.Quarter", [null, "Qtr 2"], "Quarters"),
      keyColumn("Date Hierarchy.Month", ["January", "April"], "Months"), keyColumn("Date Hierarchy.Day", [15, 3], "DayOfMonth")
    ], createDefaultValues(settingsModel), [0, 1]);
    expect(keys).toEqual(["15/01/2024", "03/04/Qtr 2/2024"]);
  });
});
