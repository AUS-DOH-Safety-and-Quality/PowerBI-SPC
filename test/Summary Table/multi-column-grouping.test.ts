import { defaultSettings, type settingsValueType } from "../../src/settings";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../../src/visual";
import buildDataView from "../helpers/buildDataView";
import { type plotDataGrouped } from "../../src/Classes/viewModelClass";
import { describe, it, expect } from "vitest";

function cloneSettings() {
  return JSON.parse(JSON.stringify(defaultSettings));
}

describe("Summary Table - multiple grouping columns (indicator + cohort)", () => {
  const element = testDom("500", "500");
  const visual = new Visual({ element: element, host: createVisualHost({}) });
  const visualClassElement: Element = document.body.querySelector('.visual') as Element;
  const tableDivElement: Element = visualClassElement.querySelector('div') as Element;

  it("produces one row per distinct (indicator, cohort) combination, each reflecting only its own data slice", () => {
    const keys: string[] = ["1", "2", "3", "4", "5", "6", "7", "8"];
    const numerators: number[] = [10, 11, 20, 21, 30, 31, 40, 41];
    const indicator: string[] = ["Ward A", "Ward A", "Ward A", "Ward A", "Ward B", "Ward B", "Ward B", "Ward B"];
    const cohort: string[] = ["2023", "2023", "2024", "2024", "2023", "2023", "2024", "2024"];
    const settings = cloneSettings();
    settings.spc.chart_type = "i";

    visual.update({
      dataViews: [ buildDataView({
        key: keys,
        indicator: indicator,
        indicators: [{ name: "Cohort", values: cohort }],
        numerators: numerators
      }, settings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    expect(visualClassElement.querySelector('.errormessage')).toBeFalsy();
    expect(visual.viewModel.indicatorVarNames).toEqual(["Indicator", "Cohort"]);

    const rows = visual.viewModel.plotPoints.flat() as plotDataGrouped[];
    expect(rows.length).toBe(4);

    const byCombo = new Map(rows.map(r => [`${r.table_row["Indicator"]}|${r.table_row["Cohort"]}`, r.table_row]));
    expect(byCombo.get("Ward A|2023")!.latest_date).toBe(keys[1]);
    expect(byCombo.get("Ward A|2023")!.value).toBe("11.00");
    expect(byCombo.get("Ward A|2024")!.latest_date).toBe(keys[3]);
    expect(byCombo.get("Ward A|2024")!.value).toBe("21.00");
    expect(byCombo.get("Ward B|2023")!.latest_date).toBe(keys[5]);
    expect(byCombo.get("Ward B|2023")!.value).toBe("31.00");
    expect(byCombo.get("Ward B|2024")!.latest_date).toBe(keys[7]);
    expect(byCombo.get("Ward B|2024")!.value).toBe("41.00");

    const colNames: string[] = visual.viewModel.tableColumns[0].map(c => c.name);
    expect(colNames.slice(0, 2)).toEqual(["Indicator", "Cohort"]);
    const bodyRows: Element[] = Array.from(tableDivElement.querySelectorAll('tbody tr'));
    expect(bodyRows.length).toBe(4);
    bodyRows.forEach(row => {
      const cells = row.querySelectorAll('td');
      expect(cells.length).toBe(colNames.length);
    });
  });

  it("a repeated (indicator, cohort) combination that is not contiguous is still merged into a single row using all of its points", () => {
    const keys: string[] = ["1", "2", "3", "4", "5", "6"];
    const numerators: number[] = [10, 11, 20, 21, 30, 31];
    const indicator: string[] = ["Ward A", "Ward A", "Ward B", "Ward B", "Ward A", "Ward A"];
    const cohort: string[] = ["2023", "2023", "2023", "2023", "2023", "2023"];
    const settings = cloneSettings();
    settings.spc.chart_type = "i";

    visual.update({
      dataViews: [ buildDataView({
        key: keys,
        indicator: indicator,
        indicators: [{ name: "Cohort", values: cohort }],
        numerators: numerators
      }, settings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    const rows = visual.viewModel.plotPoints.flat() as plotDataGrouped[];
    expect(rows.length).toBe(2);

    const wardARows = rows.filter(r => r.table_row["Indicator"] === "Ward A" && r.table_row["Cohort"] === "2023");
    expect(wardARows.length).toBe(1);
    expect(wardARows[0].table_row.latest_date).toBe(keys[5]);
    expect(wardARows[0].table_row.value).toBe("31.00");
    // Mean of all four points (10, 11, 30, 31), not just the last run (30, 31)
    expect(Number(wardARows[0].table_row.target)).toBeCloseTo(20.5, 2);

    const wardBRows = rows.filter(r => r.table_row["Indicator"] === "Ward B" && r.table_row["Cohort"] === "2023");
    expect(wardBRows.length).toBe(1);
    expect(wardBRows[0].table_row.latest_date).toBe(keys[3]);
    expect(wardBRows[0].table_row.value).toBe("21.00");

    expect(tableDivElement.querySelectorAll('tbody tr').length).toBe(2);
  });

  it("three grouping columns combine correctly, producing one row per distinct triple", () => {
    const keys: string[] = ["1", "2", "3", "4", "5", "6", "7", "8"];
    const numerators: number[] = [1, 2, 3, 4, 5, 6, 7, 8];
    const indicator: string[] = ["Ind A", "Ind A", "Ind A", "Ind A", "Ind B", "Ind B", "Ind B", "Ind B"];
    const cohort: string[] = ["2023", "2023", "2024", "2024", "2023", "2023", "2024", "2024"];
    const region: string[] = ["North", "South", "North", "South", "North", "South", "North", "South"];
    const settings = cloneSettings();
    settings.spc.chart_type = "i";

    visual.update({
      dataViews: [ buildDataView({
        key: keys,
        indicator: indicator,
        indicators: [{ name: "Cohort", values: cohort }, { name: "Region", values: region }],
        numerators: numerators
      }, settings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    expect(visualClassElement.querySelector('.errormessage')).toBeFalsy();
    expect(visual.viewModel.indicatorVarNames).toEqual(["Indicator", "Cohort", "Region"]);
    const rows = visual.viewModel.plotPoints.flat() as plotDataGrouped[];
    expect(rows.length).toBe(8);

    const colNames: string[] = visual.viewModel.tableColumns[0].map(c => c.name);
    expect(colNames.slice(0, 3)).toEqual(["Indicator", "Cohort", "Region"]);
    const bodyRows: Element[] = Array.from(tableDivElement.querySelectorAll('tbody tr'));
    expect(bodyRows.length).toBe(8);
  });

  it("groups purely by the varying column when one grouping column is constant across all rows", () => {
    const keys: string[] = ["1", "2", "3", "4", "5", "6"];
    const numerators: number[] = [10, 11, 20, 21, 30, 31];
    const indicator: string[] = ["Ward A", "Ward A", "Ward A", "Ward A", "Ward A", "Ward A"]; // constant
    const cohort: string[] = ["2022", "2022", "2023", "2023", "2024", "2024"]; // varies
    const settings = cloneSettings();
    settings.spc.chart_type = "i";

    visual.update({
      dataViews: [ buildDataView({
        key: keys,
        indicator: indicator,
        indicators: [{ name: "Cohort", values: cohort }],
        numerators: numerators
      }, settings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    expect(visual.viewModel.showGrouped).toBe(true);
    const rows = visual.viewModel.plotPoints.flat() as plotDataGrouped[];
    expect(rows.length).toBe(3);
    rows.forEach(r => expect(r.table_row["Indicator"]).toBe("Ward A"));
    expect(rows.map(r => r.table_row["Cohort"]).sort()).toEqual(["2022", "2023", "2024"]);
  });

  it("variation filtering narrows rows correctly when grouped by two columns, including when the excluded row is the first combination in the data", () => {
    const keys: string[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
    // First combination (Ward A) has the outlier, so filtering to "common" excludes group index 0
    const numerators: number[] = [10, 11, 9, 10, 11, 1000, 10, 11, 9, 10, 11, 9];
    const indicator: string[] = ["Ward A", "Ward A", "Ward A", "Ward A", "Ward A", "Ward A", "Ward B", "Ward B", "Ward B", "Ward B", "Ward B", "Ward B"];
    const cohort: string[] = ["2023", "2023", "2023", "2023", "2023", "2023", "2023", "2023", "2023", "2023", "2023", "2023"];
    const settings = cloneSettings();
    settings.spc.chart_type = "i";
    settings.outliers.astronomical = true;
    settings.summary_table.table_variation_filter = "common";

    visual.update({
      dataViews: [ buildDataView({
        key: keys,
        indicator: indicator,
        indicators: [{ name: "Cohort", values: cohort }],
        numerators: numerators
      }, settings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    expect(visualClassElement.querySelector('.errormessage')).toBeFalsy();
    const rows = visual.viewModel.plotPoints.flat() as plotDataGrouped[];
    expect(rows.length).toBe(1);
    expect(rows[0].table_row["Indicator"]).toBe("Ward B");
    expect(rows[0].table_row["Cohort"]).toBe("2023");
    expect(tableDivElement.querySelectorAll('tbody tr').length).toBe(1);
  });

  it("regression: a non-contiguous group's own per-row settings are not swapped with a different group's settings", () => {
    const keys: string[] = ["1", "2", "3", "4", "5", "6"];
    const numerators: number[] = [10.123, 11.456, 20.789, 21.012, 30.345, 31.678];
    const indicator: string[] = ["Ward A", "Ward A", "Ward B", "Ward B", "Ward A", "Ward A"];

    function settingsWithSigFigs(sigFigs: number): settingsValueType {
      const s: settingsValueType = cloneSettings();
      s.spc.chart_type = "i";
      s.spc.sig_figs = sigFigs;
      return s;
    }
    const settingsByRow: settingsValueType[] = [
      settingsWithSigFigs(0), settingsWithSigFigs(0),  // Ward A, rows 0-1
      settingsWithSigFigs(4), settingsWithSigFigs(4),  // Ward B, rows 2-3
      settingsWithSigFigs(0), settingsWithSigFigs(0)   // Ward A again, rows 4-5
    ];

    visual.update({
      dataViews: [ buildDataView({ key: keys, indicator: indicator, numerators: numerators }, settingsByRow) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    expect(visualClassElement.querySelector('.errormessage')).toBeFalsy();
    const rows = visual.viewModel.plotPoints.flat() as plotDataGrouped[];
    expect(rows.length).toBe(2);

    const wardA = rows.find(r => r.table_row["Indicator"] === "Ward A")!;
    const wardB = rows.find(r => r.table_row["Indicator"] === "Ward B")!;

    expect(wardA.table_row.value).toBe("32");
    // Should be sig_figs=4, not "21" which is what Ward A's sig_figs=0 would produce
    expect(wardB.table_row.value).toBe("21.0120");
  });

  // Remove visual element from DOM to avoid interfering with other tests
  element.remove();
});
