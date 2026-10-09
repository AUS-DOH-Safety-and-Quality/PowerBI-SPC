import { defaultSettings, type settingsValueType } from "../../src/settings";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../../src/visual";
import buildDataView from "../helpers/buildDataView";
import { columnValues } from "../helpers/summaryTable";
import { rep } from "powerbi-visuals-core/math";
import { isNullOrUndefined } from "powerbi-visuals-core/data";
import { describe, it, expect } from "vitest";

function cloneSettings() {
  return JSON.parse(JSON.stringify(defaultSettings));
}

function prefixedKeys(prefix: string, n: number): string[] {
  const keys = new Array<string>(n);
  for (let i = 0; i < n; i++) {
    keys[i] = `${prefix}${i}`;
  }
  return keys;
}

describe("Summary Table - variation and assurance filters", () => {
  const element = testDom("500", "500");
  const visual = new Visual({ element: element, host: createVisualHost({}) });
  const visualClassElement: Element = document.body.querySelector('.visual') as Element;
  const tableDivElement: Element = visualClassElement.querySelector('div') as Element;

  const stableValues: number[] = [10, 11, 9, 10, 11, 9, 10, 11, 9, 10, 11, 9];
  const outlierValues: number[] = [10, 11, 9, 10, 11, 9, 10, 11, 9, 10, 11, 1000];
  const stableKeys: string[] = prefixedKeys("s", stableValues.length);
  const outlierKeys: string[] = prefixedKeys("o", outlierValues.length);

  function buildVariationDataView(settings: settingsValueType) {
    const keys: string[] = stableKeys.concat(outlierKeys);
    const numerators: number[] = stableValues.concat(outlierValues);
    const indicator: string[] = rep("Stable", stableValues.length).concat(rep("Extreme", outlierValues.length));
    return buildDataView({ key: keys, indicator: indicator, numerators: numerators }, settings);
  }

  it("table_variation_filter='improvement' keeps only groups flagged with an improvement icon", () => {
    const settings = cloneSettings();
    settings.spc.chart_type = "i";
    settings.outliers.astronomical = true;
    settings.summary_table.table_variation_filter = "improvement";
    visual.update({
      dataViews: [ buildVariationDataView(settings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    const rows = visual.viewModel.groupedRows;
    expect(rows.length).toBe(1);
    expect(rows[0].table_row["Indicator"]).toBe("Extreme");
    expect(rows[0].table_row.variation).toBe("improvementHigh");
    expect(tableDivElement.querySelectorAll('tbody tr').length).toBe(1);
  });

  it("table_variation_filter='common' keeps only common-cause groups", () => {
    const settings = cloneSettings();
    settings.spc.chart_type = "i";
    settings.outliers.astronomical = true;
    settings.summary_table.table_variation_filter = "common";
    visual.update({
      dataViews: [ buildVariationDataView(settings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    const rows = visual.viewModel.groupedRows;
    expect(rows.length).toBe(1);
    expect(rows[0].table_row["Indicator"]).toBe("Stable");
    expect(rows[0].table_row.variation).toBe("commonCause");
  });

  it("table_variation_filter='deterioration' excludes both groups when neither shows deterioration", () => {
    const settings = cloneSettings();
    settings.spc.chart_type = "i";
    settings.outliers.astronomical = true;
    settings.summary_table.table_variation_filter = "deterioration";
    visual.update({
      dataViews: [ buildVariationDataView(settings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    const rows = visual.viewModel.groupedRows;
    expect(rows.length).toBe(0);
    expect(tableDivElement.querySelectorAll('tbody tr').length).toBe(0);
  });

  it("table_variation_filter='all' (default) keeps every group regardless of variation type", () => {
    const settings = cloneSettings();
    settings.spc.chart_type = "i";
    settings.outliers.astronomical = true;
    settings.summary_table.table_variation_filter = "all";
    visual.update({
      dataViews: [ buildVariationDataView(settings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    expect(visual.viewModel.groupedRows.length).toBe(2);
    expect(tableDivElement.querySelectorAll('tbody tr').length).toBe(2);
  });

  // Mixed flags an improvement (50) and a deterioration (-30) before its last point
  it.each([
    { filter: "improvement", kept: ["Mixed"] },
    { filter: "deterioration", kept: ["Mixed"] },
    { filter: "special", kept: ["Mixed"] },
    { filter: "neutral", kept: [] },
    { filter: "common", kept: ["Stable"] }
  ])("table_variation_filter='$filter' considers every variation icon of a group", ({ filter, kept }) => {
    const settings = cloneSettings();
    settings.spc.chart_type = "i";
    settings.outliers.astronomical = true;
    settings.nhs_icons.flag_last_point = false;
    settings.summary_table.table_variation_filter = filter;
    const mixedValues: number[] = [10, 10, 11, 10, 9, 10, 50, 10, 11, 10, 9, 10, -30, 10, 10];
    const keys: string[] = stableKeys.concat(prefixedKeys("m", mixedValues.length));
    const indicator: string[] = rep("Stable", stableValues.length).concat(rep("Mixed", mixedValues.length));
    visual.update({
      dataViews: [ buildDataView({ key: keys, indicator: indicator, numerators: stableValues.concat(mixedValues) }, settings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    expect(columnValues(visual.viewModel.groupedRows, "Indicator")).toEqual(kept);
  });

  const highVolumeNumerators: number[] = [17,12,27,20,20,18,22,19,19,24,17,16,24,19,19,22,25,19,17,6,25,17,11,14];
  const lowVolumeNumerators: number[] = [9,11,7,13,5,5,3,5,9,4,5,9];
  const cKeys: string[] = prefixedKeys("h", highVolumeNumerators.length).concat(prefixedKeys("l", lowVolumeNumerators.length));
  const cNumerators: number[] = highVolumeNumerators.concat(lowVolumeNumerators);
  const cIndicator: string[] = rep("High Volume", highVolumeNumerators.length).concat(rep("Low Volume", lowVolumeNumerators.length));

  function buildAssuranceSettings() {
    const settings = cloneSettings();
    settings.spc.chart_type = "c";
    settings.nhs_icons.show_assurance_icons = true;
    settings.lines.show_alt_target = true;
    settings.lines.alt_target = 3;
    return settings;
  }

  it("table_assurance_filter reproduces exactly the subset implied by each group's actual assurance category", () => {
    const discoverySettings = buildAssuranceSettings();
    discoverySettings.summary_table.table_assurance_filter = "all";
    visual.update({
      dataViews: [ buildDataView({ key: cKeys, indicator: cIndicator, numerators: cNumerators }, discoverySettings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    const allRows = visual.viewModel.groupedRows;
    expect(allRows.length).toBe(2);
    const names: string[] = columnValues(allRows, "Indicator");
    const assurances: string[] = columnValues(allRows, "assurance");
    const categories: string[] = Array.from(new Set(assurances));
    expect(categories.length).toBeGreaterThan(1);

    const filterKeywordFor: Record<string, string | undefined> = {
      consistentPass: "pass",
      consistentFail: "fail",
      inconsistent: "inconsistent",
      none: undefined
    };

    for (let c = 0; c < categories.length; c++) {
      const category = categories[c];
      const filterKeyword: string | undefined = filterKeywordFor[category];
      if (isNullOrUndefined(filterKeyword)) {
        continue;
      }
      const filterSettings = buildAssuranceSettings();
      filterSettings.summary_table.table_assurance_filter = filterKeyword;
      visual.update({
        dataViews: [ buildDataView({ key: cKeys, indicator: cIndicator, numerators: cNumerators }, filterSettings) ],
        viewport: { width: 500, height: 500 },
        type: 2
      });

      const expectedGroups: string[] = [];
      for (let i = 0; i < names.length; i++) {
        if (assurances[i] === category) {
          expectedGroups.push(names[i]);
        }
      }
      expect(columnValues(visual.viewModel.groupedRows, "Indicator").sort()).toEqual(expectedGroups.sort());
      expect(tableDivElement.querySelectorAll('tbody tr').length).toBe(expectedGroups.length);
    }
  });

  it("table_assurance_filter='any' excludes only groups categorised as inconsistent", () => {
    const discoverySettings = buildAssuranceSettings();
    discoverySettings.summary_table.table_assurance_filter = "all";
    visual.update({
      dataViews: [ buildDataView({ key: cKeys, indicator: cIndicator, numerators: cNumerators }, discoverySettings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });
    const allRows = visual.viewModel.groupedRows;
    const expectedGroups: string[] = [];
    for (let i = 0; i < allRows.length; i++) {
      if (allRows[i].table_row.assurance !== "inconsistent") {
        expectedGroups.push(allRows[i].table_row["Indicator"]);
      }
    }

    const filterSettings = buildAssuranceSettings();
    filterSettings.summary_table.table_assurance_filter = "any";
    visual.update({
      dataViews: [ buildDataView({ key: cKeys, indicator: cIndicator, numerators: cNumerators }, filterSettings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });
    expect(columnValues(visual.viewModel.groupedRows, "Indicator").sort()).toEqual(expectedGroups.sort());
  });

  // Regression: filtering down to a single surviving group crashed if it wasn't the first in the data
  describe("Regression: rendering a single surviving indicator group after filtering", () => {
    const groupLowNumerators: number[] = [5, 6, 4, 5, 6, 4, 5, 6];
    const groupMidNumerators: number[] = [20, 21, 19, 20, 21, 19, 20, 21];
    const groupHighNumerators: number[] = [45, 46, 44, 45, 46, 44, 45, 46];
    const denominators: number[] = rep(100, 8);
    const pKeys: string[] = prefixedKeys("l", groupLowNumerators.length)
      .concat(prefixedKeys("m", groupMidNumerators.length))
      .concat(prefixedKeys("h", groupHighNumerators.length));
    const pNumerators: number[] = groupLowNumerators.concat(groupMidNumerators).concat(groupHighNumerators);
    const pDenominators: number[] = denominators.concat(denominators).concat(denominators);
    const pIndicator: string[] = rep("Low Site", 8).concat(rep("Mid Site", 8)).concat(rep("High Site", 8));
    const pArgs = {
      key: pKeys,
      indicator: pIndicator,
      numerators: pNumerators,
      denominators: pDenominators
    };

    it("keeps rendering correctly when the single surviving group is not the first indicator in the data", () => {
      const element2 = testDom("500", "500");
      const visual2 = new Visual({ element: element2, host: createVisualHost({}) });

      const settings = cloneSettings();
      settings.spc.chart_type = "p";
      settings.nhs_icons.show_assurance_icons = true;
      settings.lines.show_alt_target = true;
      // Isolates "High Site" (last group) as the sole "pass"
      settings.lines.alt_target = 25;
      settings.summary_table.table_assurance_filter = "pass";

      visual2.update({
        dataViews: [ buildDataView(pArgs, settings) ],
        viewport: { width: 500, height: 500 },
        type: 2
      });

      const rows = visual2.viewModel.groupedRows;
      expect(rows.length).toBe(1);
      expect(rows[0].table_row["Indicator"]).toBe("High Site");

      expect(element2.querySelector('.errormessage')).toBeFalsy();
      const bodyRows = element2.querySelectorAll('tbody tr');
      expect(bodyRows.length).toBe(1);
      expect(bodyRows[0].querySelectorAll('td').length).toBe(visual2.viewModel.tableColumns[0].length);
      expect(bodyRows[0].querySelector('td')!.textContent).toBe("High Site");

      element2.remove();
    });

    it("keeps rendering correctly when the single surviving group is the first indicator in the data", () => {
      const settings = cloneSettings();
      settings.spc.chart_type = "p";
      settings.nhs_icons.show_assurance_icons = true;
      settings.lines.show_alt_target = true;
      // Isolates "Low Site" (first group) as the sole "fail"
      settings.lines.alt_target = 25;
      settings.summary_table.table_assurance_filter = "fail";

      visual.update({
        dataViews: [ buildDataView(pArgs, settings) ],
        viewport: { width: 500, height: 500 },
        type: 2
      });

      const rows = visual.viewModel.groupedRows;
      expect(rows.length).toBe(1);
      expect(rows[0].table_row["Indicator"]).toBe("Low Site");
      expect(visualClassElement.querySelector('.errormessage')).toBeFalsy();
      expect(tableDivElement.querySelectorAll('tbody tr').length).toBe(1);
    });
  });

  // Remove visual element from DOM to avoid interfering with other tests
  element.remove();
});
