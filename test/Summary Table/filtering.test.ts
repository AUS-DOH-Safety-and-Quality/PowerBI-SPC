import type { settingsValueType } from "../../src/settings";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../../src/visual";
import buildDataView from "../helpers/buildDataView";
import { columnValues } from "../helpers/summaryTable";
import { rep } from "powerbi-visuals-core/math";
import { describe, it, expect } from "vitest";
import { updateType } from "powerbi-visuals-core/powerbi";
import { cloneSettings } from "../helpers/renderVisual";
import { must } from "powerbi-visuals-core/testing";

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
      type: updateType.data
    });

    const rows = visual.viewModel.groupedRows;
    expect(rows.length).toBe(1);
    expect(rows[0].table_row["Indicator"]).toBe("Extreme");
    expect(rows[0].variation_icons).toEqual(["improvementHigh"]);
    expect(tableDivElement.querySelectorAll('tbody tr').length).toBe(1);
  });

  // Mixed flags an improvement (50) and a deterioration (-30) before its last point
  it.each([
    { filter: "improvement", kept: ["Mixed"] },
    { filter: "deterioration", kept: ["Mixed"] },
    { filter: "special", kept: ["Mixed"] },
    { filter: "neutral", kept: [] },
    { filter: "common", kept: ["Stable"] },
    { filter: "all", kept: ["Stable", "Mixed"] }
  ] as const)("table_variation_filter='$filter' considers every variation icon of a group", ({ filter, kept }) => {
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
      type: updateType.data
    });

    expect(columnValues(visual.viewModel.groupedRows, "Indicator")).toEqual(kept);
  });

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

  // 99% limits (%) are Low [0, 11.74], Mid [8.10, 32.15] and High [30.20, 60.05]:
  // a 25% target fails, is inconsistent and passes respectively
  it.each([
    { filter: "all", kept: ["Low Site", "Mid Site", "High Site"] },
    { filter: "any", kept: ["Low Site", "High Site"] },
    { filter: "pass", kept: ["High Site"] },
    { filter: "fail", kept: ["Low Site"] },
    { filter: "inconsistent", kept: ["Mid Site"] }
  ] as const)("table_assurance_filter='$filter' keeps the groups with that assurance", ({ filter, kept }) => {
    const settings = cloneSettings();
    settings.spc.chart_type = "p";
    settings.nhs_icons.show_assurance_icons = true;
    settings.lines.show_alt_target = true;
    settings.lines.alt_target = 25;
    settings.summary_table.table_assurance_filter = filter;
    visual.update({
      dataViews: [ buildDataView(pArgs, settings) ],
      viewport: { width: 500, height: 500 },
      type: updateType.data
    });

    expect(columnValues(visual.viewModel.groupedRows, "Indicator")).toEqual(kept);
    expect(visualClassElement.querySelector('.errormessage')).toBeNull();
    expect(tableDivElement.querySelectorAll('tbody tr').length).toBe(kept.length);
  });

  // Regression: filtering down to a single surviving group crashed if it wasn't the first in the data
  describe("Regression: rendering a single surviving indicator group after filtering", () => {
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
        type: updateType.data
      });

      const rows = visual2.viewModel.groupedRows;
      expect(rows.length).toBe(1);
      expect(rows[0].table_row["Indicator"]).toBe("High Site");

      expect(element2.querySelector('.errormessage')).toBeFalsy();
      const bodyRows = element2.querySelectorAll('tbody tr');
      expect(bodyRows.length).toBe(1);
      expect(bodyRows[0].querySelectorAll('td').length).toBe(visual2.viewModel.tableColumns[0].length);
      expect(must(bodyRows[0].querySelector('td')).textContent).toBe("High Site");

      element2.remove();
    });
  });

  // Remove visual element from DOM to avoid interfering with other tests
  element.remove();
});
