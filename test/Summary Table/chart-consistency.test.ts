import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../../src/visual";
import buildDataView from "../helpers/buildDataView";
import { findBy, must } from "powerbi-visuals-core/testing";
import { columnNames, tableRow } from "../helpers/summaryTable";
import { rep } from "powerbi-visuals-core/math";
import { describe, it, expect } from "vitest";
import { updateType } from "powerbi-visuals-core/powerbi";
import { cloneSettings } from "../helpers/renderVisual";

const keys: string[] = ["1", "2", "3", "4", "5", "6", "7", "8"];
const numerators: number[] = [10, 12, 9, 11, 10, 13, 9, 11];
const denominators: number[] = [20, 20, 20, 20, 20, 20, 20, 20];

describe("Summary Table - numeric/tooltip consistency with the individual chart", () => {
  const element = testDom("500", "500");
  const visual = new Visual({ element: element, host: createVisualHost({}) });
  const visualClassElement: Element = document.body.querySelector('.visual') as Element;
  const tableDivElement: Element = visualClassElement.querySelector('div') as Element;

  it("writes the value and 68% limit cells as the chart tooltip does, in the single and grouped tables", () => {
    const settings = cloneSettings();
    settings.spc.chart_type = "p";
    settings.lines.show_68 = true;
    visual.update({
      dataViews: [ buildDataView({ key: keys, numerators: numerators, denominators: denominators }, settings) ],
      viewport: { width: 500, height: 500 },
      type: updateType.data
    });
    const lastTooltip = visual.viewModel.plotPoints[keys.length - 1].tooltip;
    const value = must(findBy(lastTooltip, "displayName", "Proportion")).value;
    const upper68 = must(findBy(lastTooltip, "displayName", "Upper 68% Limit")).value;
    // 11 / 20
    expect(value).toBe("55.00%");

    settings.summary_table.show_table = true;
    visual.update({
      dataViews: [ buildDataView({ key: keys, numerators: numerators, denominators: denominators }, settings) ],
      viewport: { width: 500, height: 500 },
      type: updateType.data
    });
    let colNames: string[] = columnNames(visual);
    const lastCells = tableDivElement.querySelectorAll('tbody tr')[keys.length - 1].querySelectorAll('td');
    expect(lastCells[colNames.indexOf("value")].textContent).toBe(value);
    expect(lastCells[colNames.indexOf("ul68")].textContent).toBe(upper68);

    // A second group only triggers grouped mode; Test Group's last point is unchanged
    const indicator: string[] = rep("Test Group", keys.length).concat(["Dummy Group", "Dummy Group"]);
    visual.update({
      dataViews: [ buildDataView({
        key: keys.concat(["9", "10"]),
        indicator: indicator,
        numerators: numerators.concat([5, 6]),
        denominators: denominators.concat([20, 20])
      }, settings) ],
      viewport: { width: 500, height: 500 },
      type: updateType.data
    });
    colNames = columnNames(visual);
    const groupCells = tableRow(tableDivElement, "Test Group").querySelectorAll('td');
    expect(groupCells[colNames.indexOf("value")].textContent).toBe(value);
    expect(groupCells[colNames.indexOf("ul68")].textContent).toBe(upper68);
  });

  // Remove visual element from DOM to avoid interfering with other tests
  element.remove();
});
