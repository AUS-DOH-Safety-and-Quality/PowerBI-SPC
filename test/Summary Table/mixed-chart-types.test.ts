import { defaultSettings, type settingsValueType } from "../../src/settings";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../../src/visual";
import buildDataView from "../helpers/buildDataView";
import findBy from "../helpers/findBy";
import { columnNames, columnValues, groupedRow, tableRow } from "../helpers/summaryTable";
import { rep } from "powerbi-visuals-core/math";
import { describe, it, expect } from "vitest";

function settingsFor(chartType: settingsValueType["spc"]["chart_type"]): settingsValueType {
  const s: settingsValueType = JSON.parse(JSON.stringify(defaultSettings));
  s.spc.chart_type = chartType;
  return s;
}

function cloneRows(rows: settingsValueType[]): settingsValueType[] {
  const clones = new Array<settingsValueType>(rows.length);
  for (let i = 0; i < rows.length; i++) {
    clones[i] = JSON.parse(JSON.stringify(rows[i]));
  }
  return clones;
}

const pKeys: string[] = ["p1", "p2", "p3", "p4", "p5", "p6"];
const pNumerators: number[] = [10, 12, 9, 11, 10, 13];
const pDenominators: number[] = [20, 20, 20, 20, 20, 20];

const uKeys: string[] = ["u1", "u2", "u3", "u4", "u5", "u6"];
const uNumerators: number[] = [5, 6, 4, 7, 5, 6];
const uDenominators: number[] = [1000, 1000, 1000, 1000, 1000, 1000];

const cKeys: string[] = ["c1", "c2", "c3", "c4", "c5", "c6"];
const cNumerators: number[] = [20, 22, 19, 21, 20, 23];

/** "run" charts have no control limits at all */
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
const mixedArgs = {
  key: mixedKeys,
  indicator: mixedIndicator,
  numerators: mixedNumerators,
  denominators: mixedDenominators
};

describe("Summary Table - combining indicators of different chart types", () => {
  const element = testDom("500", "500");
  const visual = new Visual({ element: element, host: createVisualHost({}) });
  const visualClassElement: Element = document.body.querySelector('.visual') as Element;
  const tableDivElement: Element = visualClassElement.querySelector('div') as Element;

  it("renders one row per group without crashing, each formatted according to its own chart type", () => {
    visual.update({
      dataViews: [ buildDataView(mixedArgs, mixedSettingsByRow) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    expect(visualClassElement.querySelector('.errormessage')).toBeFalsy();
    const rows = visual.viewModel.groupedRows;
    expect(rows.length).toBe(4);

    const countSite = groupedRow(rows, "Count Site").table_row;
    const trendSite = groupedRow(rows, "Trend Site").table_row;

    expect(groupedRow(rows, "Proportion Site").table_row.value).toMatch(/%$/);
    expect(groupedRow(rows, "Rate Site").table_row.value).not.toMatch(/%$/);
    expect(countSite.value).not.toMatch(/%$/);
    expect(trendSite.value).not.toMatch(/%$/);

    expect(countSite.numerator).toBe("");
    expect(countSite.denominator).toBe("");

    expect(trendSite.ul99).toBe("");
    expect(trendSite.ul95).toBe("");
    expect(trendSite.ll95).toBe("");
    expect(trendSite.ll99).toBe("");
    expect(trendSite.value).not.toBe("");
    expect(trendSite.target).not.toBe("");
    expect(trendSite.assurance).toBe("none");

    const bodyRows = tableDivElement.querySelectorAll('tbody tr');
    expect(bodyRows.length).toBe(4);
    for (let i = 0; i < bodyRows.length; i++) {
      expect(bodyRows[i].querySelectorAll('td').length).toBe(visual.viewModel.tableColumns[0].length);
    }
  });

  it("a group's computed value is identical whether it is rendered alone or alongside differently-typed groups", () => {
    const isolatedSettings = settingsFor("p");
    visual.update({
      dataViews: [ buildDataView({ key: pKeys, numerators: pNumerators, denominators: pDenominators }, isolatedSettings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });
    const isolatedLastPoint = visual.viewModel.plotPoints[pKeys.length - 1];
    const isolatedValueTooltip = findBy(isolatedLastPoint.tooltip, "displayName", "Proportion")!.value;
    const isolatedUl99 = isolatedLastPoint.table_row.ul99;

    visual.update({
      dataViews: [ buildDataView(mixedArgs, mixedSettingsByRow) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });
    const colNames: string[] = columnNames(visual);
    const valueIdx: number = colNames.indexOf("value");
    const ul99Idx: number = colNames.indexOf("ul99");
    const proportionRow = tableRow(tableDivElement, "Proportion Site");

    expect(proportionRow.querySelectorAll('td')[valueIdx].textContent).toBe(isolatedValueTooltip);
    expect(proportionRow.querySelectorAll('td')[ul99Idx].textContent).toBe(`${isolatedUl99!.toFixed(2)}%`);
  });

  it("assurance filtering excludes chart types without control limits from pass/fail/inconsistent, but not from 'all'/'any'", () => {
    const settingsAll = cloneRows(mixedSettingsByRow);
    for (let i = 0; i < settingsAll.length; i++) {
      settingsAll[i].nhs_icons.show_assurance_icons = true;
      settingsAll[i].lines.show_alt_target = true;
      settingsAll[i].lines.alt_target = 1000000; // guarantees "fail" for every chart type with control limits
      settingsAll[i].summary_table.table_assurance_filter = "all";
    }
    visual.update({
      dataViews: [ buildDataView(mixedArgs, settingsAll) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });
    const allRows = visual.viewModel.groupedRows;
    expect(allRows.length).toBe(4);
    expect(groupedRow(allRows, "Trend Site").table_row.assurance).toBe("none");
    expect(groupedRow(allRows, "Proportion Site").table_row.assurance).toBe("consistentFail");
    expect(groupedRow(allRows, "Rate Site").table_row.assurance).toBe("consistentFail");
    expect(groupedRow(allRows, "Count Site").table_row.assurance).toBe("consistentFail");

    const settingsFail = cloneRows(settingsAll);
    for (let i = 0; i < settingsFail.length; i++) {
      settingsFail[i].summary_table.table_assurance_filter = "fail";
    }
    visual.update({
      dataViews: [ buildDataView(mixedArgs, settingsFail) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });
    expect(columnValues(visual.viewModel.groupedRows, "Indicator").sort()).toEqual(["Count Site", "Proportion Site", "Rate Site"]);

    const settingsAny = cloneRows(settingsAll);
    for (let i = 0; i < settingsAny.length; i++) {
      settingsAny[i].summary_table.table_assurance_filter = "any";
    }
    visual.update({
      dataViews: [ buildDataView(mixedArgs, settingsAny) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });
    // "any" excludes only "inconsistent" - the run chart's "none" is not "inconsistent", so it stays
    expect(columnValues(visual.viewModel.groupedRows, "Indicator").sort()).toEqual(["Count Site", "Proportion Site", "Rate Site", "Trend Site"]);
  });

  it("differing sig_figs settings per group round each row to its own group's precision", () => {
    const settingsByRow = cloneRows(mixedSettingsByRow);
    // First group (Proportion Site, idx 0-5) uses 0 decimals; second (Rate Site, idx 6-11) uses 4
    for (let i = 0; i < 12; i++) {
      settingsByRow[i].spc.sig_figs = i < 6 ? 0 : 4;
    }
    visual.update({
      dataViews: [ buildDataView(mixedArgs, settingsByRow) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    const rows = visual.viewModel.groupedRows;
    const proportionValue = groupedRow(rows, "Proportion Site").table_row.value;
    const rateValue = groupedRow(rows, "Rate Site").table_row.value;
    expect(proportionValue).toMatch(/^\d+%$/); // 0 decimal places
    expect(rateValue).toMatch(/^\d+\.\d{4}$/); // 4 decimal places
  });

  // Remove visual element from DOM to avoid interfering with other tests
  element.remove();
});
