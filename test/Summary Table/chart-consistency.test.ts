import { defaultSettings } from "../../src/settings";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../../src/visual";
import buildDataView from "../helpers/buildDataView";
import { type plotData } from "../../src/Classes/viewModelClass";
import { describe, it, expect } from "vitest";

function cloneSettings() {
  return JSON.parse(JSON.stringify(defaultSettings));
}

const keys: string[] = ["1", "2", "3", "4", "5", "6", "7", "8"];
const numerators: number[] = [10, 12, 9, 11, 10, 13, 9, 11];
const denominators: number[] = [20, 20, 20, 20, 20, 20, 20, 20];

describe("Summary Table - numeric/tooltip consistency with the individual chart", () => {
  const element = testDom("500", "500");
  const visual = new Visual({ element: element, host: createVisualHost({}) });
  const visualClassElement: Element = document.body.querySelector('.visual') as Element;
  const tableDivElement: Element = visualClassElement.querySelector('div') as Element;

  it("the chart tooltip's formatted value matches the grouped summary table's formatted value for the same point", () => {
    const chartSettings = cloneSettings();
    chartSettings.spc.chart_type = "p";
    visual.update({
      dataViews: [ buildDataView({ key: keys, numerators: numerators, denominators: denominators }, chartSettings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    const lastPoint = (visual.viewModel.plotPoints[0] as plotData[])[keys.length - 1];
    const valueTooltipEntry = lastPoint.tooltip.find(t => t.displayName === "Proportion")!;
    expect(valueTooltipEntry).toBeTruthy();
    expect(valueTooltipEntry.value).toMatch(/%$/);

    const groupedSettings = cloneSettings();
    groupedSettings.spc.chart_type = "p";
    const indicator = keys.map((_, i) => i < 4 ? "Group A" : "Group B");
    visual.update({
      dataViews: [ buildDataView({ key: keys, indicator: indicator, numerators: numerators, denominators: denominators }, groupedSettings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });
    const groupBRow = Array.from(tableDivElement.querySelectorAll('tbody tr'))
      .find(r => r.querySelector('td')!.textContent === "Group B")!;
    const colNames: string[] = visual.viewModel.tableColumns[0].map(c => c.name);
    const valueIdx: number = colNames.indexOf("value");
    expect(groupBRow.querySelectorAll('td')[valueIdx].textContent).toBe(valueTooltipEntry.value);
  });

  it("regression: the single-indicator forced table (show_table=true) must not drop the percent suffix that the chart and grouped table both show", () => {
    const settings = cloneSettings();
    settings.spc.chart_type = "p";
    settings.summary_table.show_table = true;
    visual.update({
      dataViews: [ buildDataView({ key: keys, numerators: numerators, denominators: denominators }, settings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    const colNames: string[] = visual.viewModel.tableColumns[0].map(c => c.name);
    const valueIdx: number = colNames.indexOf("value");
    const lastRow = tableDivElement.querySelectorAll('tbody tr')[keys.length - 1];
    const cellText = lastRow.querySelectorAll('td')[valueIdx].textContent;

    expect(cellText).toMatch(/%$/);
    expect(cellText).toBe("55.00%");
  });

  it("regression: the chart tooltip includes the Upper 68% control limit, matching the summary table's ucl68 value", () => {
    const settings = cloneSettings();
    settings.spc.chart_type = "p";
    settings.lines.show_68 = true;
    visual.update({
      dataViews: [ buildDataView({ key: keys, numerators: numerators, denominators: denominators }, settings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    const lastPoint = (visual.viewModel.plotPoints[0] as plotData[])[keys.length - 1];
    const upper68TooltipEntry = lastPoint.tooltip.find(t => t.displayName === "Upper 68% Limit");
    expect(upper68TooltipEntry).toBeTruthy();

    // Dummy second group appended purely to trigger grouped mode; Test Group's last point is unchanged
    const groupedSettings = cloneSettings();
    groupedSettings.spc.chart_type = "p";
    groupedSettings.lines.show_68 = true;
    const groupedKeys: string[] = keys.concat(["9", "10"]);
    const groupedNumerators: number[] = numerators.concat([5, 6]);
    const groupedDenominators: number[] = denominators.concat([20, 20]);
    const indicator: string[] = keys.map(() => "Test Group").concat(["Dummy Group", "Dummy Group"]);
    visual.update({
      dataViews: [ buildDataView({ key: groupedKeys, indicator: indicator, numerators: groupedNumerators, denominators: groupedDenominators }, groupedSettings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });
    const colNames: string[] = visual.viewModel.tableColumns[0].map(c => c.name);
    const ucl68Idx: number = colNames.indexOf("ucl68");
    expect(ucl68Idx).toBeGreaterThanOrEqual(0);
    const testGroupRow = Array.from(tableDivElement.querySelectorAll('tbody tr'))
      .find(r => r.querySelector('td')!.textContent === "Test Group")!;
    expect(testGroupRow.querySelectorAll('td')[ucl68Idx].textContent).toBe(upper68TooltipEntry!.value);
  });

  // Remove visual element from DOM to avoid interfering with other tests
  element.remove();
});
