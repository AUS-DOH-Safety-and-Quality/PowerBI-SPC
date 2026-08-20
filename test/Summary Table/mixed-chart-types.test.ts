import { defaultSettings, type settingsValueType } from "../../src/settings";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../../src/visual";
import buildDataView from "../helpers/buildDataView";
import rep from "../../src/Functions/rep";
import { type plotData, type plotDataGrouped } from "../../src/Classes/viewModelClass";
import { describe, it, expect } from "vitest";

function settingsFor(chartType: string): settingsValueType {
  const s: settingsValueType = JSON.parse(JSON.stringify(defaultSettings));
  s.spc.chart_type = chartType;
  return s;
}

const pKeys: string[] = ["p1", "p2", "p3", "p4", "p5", "p6"];
const pNumerators: number[] = [10, 12, 9, 11, 10, 13];
const pDenominators: number[] = [20, 20, 20, 20, 20, 20];

const uKeys: string[] = ["u1", "u2", "u3", "u4", "u5", "u6"];
const uNumerators: number[] = [5, 6, 4, 7, 5, 6];
const uDenominators: number[] = [1000, 1000, 1000, 1000, 1000, 1000];

const cKeys: string[] = ["c1", "c2", "c3", "c4", "c5", "c6"];
const cNumerators: number[] = [20, 22, 19, 21, 20, 23];

// "run" charts have no control limits at all
const runKeys: string[] = ["r1", "r2", "r3", "r4", "r5", "r6"];
const runNumerators: number[] = [50, 52, 49, 51, 50, 53];

const mixedKeys: string[] = pKeys.concat(uKeys).concat(cKeys).concat(runKeys);
const mixedNumerators: number[] = pNumerators.concat(uNumerators).concat(cNumerators).concat(runNumerators);
const mixedDenominators: number[] = pDenominators.concat(uDenominators).concat(rep(100, 6)).concat(rep(100, 6));
const mixedIndicator: string[] = rep("Proportion Site", 6).concat(rep("Rate Site", 6)).concat(rep("Count Site", 6)).concat(rep("Trend Site", 6));
const mixedSettingsByRow: settingsValueType[] = rep(settingsFor("p"), 6)
  .concat(rep(settingsFor("u"), 6))
  .concat(rep(settingsFor("c"), 6))
  .concat(rep(settingsFor("run"), 6));

describe("Summary Table - combining indicators of different chart types", () => {
  const element = testDom("500", "500");
  const visual = new Visual({ element: element, host: createVisualHost({}) });
  const visualClassElement: Element = document.body.querySelector('.visual') as Element;
  const tableDivElement: Element = visualClassElement.querySelector('div') as Element;

  it("renders one row per group without crashing, each formatted according to its own chart type", () => {
    visual.update({
      dataViews: [ buildDataView({ key: mixedKeys, indicator: mixedIndicator, numerators: mixedNumerators, denominators: mixedDenominators }, mixedSettingsByRow) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    expect(visualClassElement.querySelector('.errormessage')).toBeFalsy();
    const rows = visual.viewModel.plotPoints.flat() as plotDataGrouped[];
    expect(rows.length).toBe(4);

    const byIndicator = new Map(rows.map(r => [r.table_row["Indicator"] as string, r.table_row]));

    expect(byIndicator.get("Proportion Site")!.value).toMatch(/%$/);
    expect(byIndicator.get("Rate Site")!.value).not.toMatch(/%$/);
    expect(byIndicator.get("Count Site")!.value).not.toMatch(/%$/);
    expect(byIndicator.get("Trend Site")!.value).not.toMatch(/%$/);

    expect(byIndicator.get("Count Site")!.numerator).toBe("");
    expect(byIndicator.get("Count Site")!.denominator).toBe("");

    const trendSite = byIndicator.get("Trend Site")!;
    expect(trendSite.ucl99).toBe("");
    expect(trendSite.ucl95).toBe("");
    expect(trendSite.lcl95).toBe("");
    expect(trendSite.lcl99).toBe("");
    expect(trendSite.value).not.toBe("");
    expect(trendSite.target).not.toBe("");
    expect(trendSite.assurance).toBe("none");

    const bodyRows: Element[] = Array.from(tableDivElement.querySelectorAll('tbody tr'));
    expect(bodyRows.length).toBe(4);
    bodyRows.forEach(row => expect(row.querySelectorAll('td').length).toBe(visual.viewModel.tableColumns[0].length));
  });

  it("a group's computed value is identical whether it is rendered alone or alongside differently-typed groups", () => {
    const isolatedSettings = settingsFor("p");
    visual.update({
      dataViews: [ buildDataView({ key: pKeys, numerators: pNumerators, denominators: pDenominators }, isolatedSettings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });
    const isolatedLastPoint = (visual.viewModel.plotPoints[0] as plotData[])[pKeys.length - 1];
    const isolatedValueTooltip = isolatedLastPoint.tooltip.find(t => t.displayName === "Proportion")!.value;
    const isolatedUl99 = isolatedLastPoint.table_row.ul99;

    visual.update({
      dataViews: [ buildDataView({ key: mixedKeys, indicator: mixedIndicator, numerators: mixedNumerators, denominators: mixedDenominators }, mixedSettingsByRow) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });
    const colNames: string[] = visual.viewModel.tableColumns[0].map(c => c.name);
    const valueIdx: number = colNames.indexOf("value");
    const ucl99Idx: number = colNames.indexOf("ucl99");
    const proportionRow = Array.from(tableDivElement.querySelectorAll('tbody tr'))
      .find(r => r.querySelector('td')!.textContent === "Proportion Site")!;

    expect(proportionRow.querySelectorAll('td')[valueIdx].textContent).toBe(isolatedValueTooltip);
    expect(proportionRow.querySelectorAll('td')[ucl99Idx].textContent).toBe(`${isolatedUl99!.toFixed(2)}%`);
  });

  it("assurance filtering excludes chart types without control limits from pass/fail/inconsistent, but not from 'all'/'any'", () => {
    const settingsAll = mixedSettingsByRow.map(s => {
      const clone: settingsValueType = JSON.parse(JSON.stringify(s));
      clone.nhs_icons.show_assurance_icons = true;
      clone.lines.show_alt_target = true;
      clone.lines.alt_target = 1000000; // guarantees "fail" for every chart type with control limits
      clone.summary_table.table_assurance_filter = "all";
      return clone;
    });
    visual.update({
      dataViews: [ buildDataView({ key: mixedKeys, indicator: mixedIndicator, numerators: mixedNumerators, denominators: mixedDenominators }, settingsAll) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });
    const allRows = visual.viewModel.plotPoints.flat() as plotDataGrouped[];
    expect(allRows.length).toBe(4);
    const categories = new Map(allRows.map(r => [r.table_row["Indicator"] as string, r.table_row.assurance]));
    expect(categories.get("Trend Site")).toBe("none");
    expect(categories.get("Proportion Site")).toBe("consistentFail");
    expect(categories.get("Rate Site")).toBe("consistentFail");
    expect(categories.get("Count Site")).toBe("consistentFail");

    const settingsFail = settingsAll.map(s => {
      const clone: settingsValueType = JSON.parse(JSON.stringify(s));
      clone.summary_table.table_assurance_filter = "fail";
      return clone;
    });
    visual.update({
      dataViews: [ buildDataView({ key: mixedKeys, indicator: mixedIndicator, numerators: mixedNumerators, denominators: mixedDenominators }, settingsFail) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });
    const failRows = visual.viewModel.plotPoints.flat() as plotDataGrouped[];
    expect(failRows.map(r => r.table_row["Indicator"]).sort()).toEqual(["Count Site", "Proportion Site", "Rate Site"]);

    const settingsAny = settingsAll.map(s => {
      const clone: settingsValueType = JSON.parse(JSON.stringify(s));
      clone.summary_table.table_assurance_filter = "any";
      return clone;
    });
    visual.update({
      dataViews: [ buildDataView({ key: mixedKeys, indicator: mixedIndicator, numerators: mixedNumerators, denominators: mixedDenominators }, settingsAny) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });
    const anyRows = visual.viewModel.plotPoints.flat() as plotDataGrouped[];
    // "any" excludes only "inconsistent" - the run chart's "none" is not "inconsistent", so it stays
    expect(anyRows.map(r => r.table_row["Indicator"]).sort()).toEqual(["Count Site", "Proportion Site", "Rate Site", "Trend Site"]);
  });

  it("differing sig_figs settings per group round each row to its own group's precision", () => {
    const settingsByRow = mixedSettingsByRow.map((s, idx) => {
      const clone: settingsValueType = JSON.parse(JSON.stringify(s));
      // First group (Proportion Site, idx 0-5) uses 0 decimals; second (Rate Site, idx 6-11) uses 4
      if (idx < 6) {
        clone.spc.sig_figs = 0;
      } else if (idx < 12) {
        clone.spc.sig_figs = 4;
      }
      return clone;
    });
    visual.update({
      dataViews: [ buildDataView({ key: mixedKeys, indicator: mixedIndicator, numerators: mixedNumerators, denominators: mixedDenominators }, settingsByRow) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    const rows = visual.viewModel.plotPoints.flat() as plotDataGrouped[];
    const proportionValue = rows.find(r => r.table_row["Indicator"] === "Proportion Site")!.table_row.value;
    const rateValue = rows.find(r => r.table_row["Indicator"] === "Rate Site")!.table_row.value;
    expect(proportionValue).toMatch(/^\d+%$/); // 0 decimal places
    expect(rateValue).toMatch(/^\d+\.\d{4}$/); // 4 decimal places
  });

  // Remove visual element from DOM to avoid interfering with other tests
  element.remove();
});
