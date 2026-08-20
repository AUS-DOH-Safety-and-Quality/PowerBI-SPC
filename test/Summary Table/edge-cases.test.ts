import { defaultSettings } from "../../src/settings";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../../src/visual";
import buildDataView from "../helpers/buildDataView";
import rep from "../../src/Functions/rep";
import { type plotDataGrouped } from "../../src/Classes/viewModelClass";
import { describe, it, expect, vi } from "vitest";

function cloneSettings() {
  return JSON.parse(JSON.stringify(defaultSettings));
}

describe("Summary Table - edge cases in grouping, filtering and re-rendering", () => {
  const element = testDom("500", "500");
  const visual = new Visual({ element: element, host: createVisualHost({}) });
  const visualClassElement: Element = document.body.querySelector('.visual') as Element;
  const tableDivElement: Element = visualClassElement.querySelector('div') as Element;

  it("Filtering out every indicator group still renders a clean, empty (but headered) table with no crash", () => {
    const keys: string[] = ["1", "2", "3", "4", "5", "6", "7", "8"];
    const numerators: number[] = [10, 11, 9, 10, 11, 9, 10, 11];
    const indicator: string[] = rep("A", 4).concat(rep("B", 4));
    const settings = cloneSettings();
    settings.spc.chart_type = "i";
    settings.outliers.astronomical = true;
    // Both groups are flat/common-cause, so a "deterioration"-only filter excludes everything
    settings.summary_table.table_variation_filter = "deterioration";

    visual.update({
      dataViews: [ buildDataView({ key: keys, indicator: indicator, numerators: numerators }, settings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    expect((visual.viewModel.plotPoints.flat() as plotDataGrouped[]).length).toBe(0);
    expect(visualClassElement.querySelector('.errormessage')).toBeFalsy();
    // The header row (with its full set of columns) must still render even with zero data rows
    expect(tableDivElement.querySelectorAll('.table-header th').length).toBe(visual.viewModel.tableColumns[0].length);
    expect(tableDivElement.querySelectorAll('tbody tr').length).toBe(0);
  });

  it("A single-point indicator group (insufficient history for its own limits) renders alongside a normal multi-point group without crashing", () => {
    const keys: string[] = ["a1", "a2", "a3", "a4", "a5", "b1"];
    const numerators: number[] = [10, 11, 9, 10, 11, 50];
    const indicator: string[] = rep("Established Site", 5).concat(rep("New Site", 1));
    const settings = cloneSettings();
    settings.spc.chart_type = "i";

    visual.update({
      dataViews: [ buildDataView({ key: keys, indicator: indicator, numerators: numerators }, settings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    expect(visualClassElement.querySelector('.errormessage')).toBeFalsy();
    const rows: Element[] = Array.from(tableDivElement.querySelectorAll('tbody tr'));
    expect(rows.length).toBe(2);

    const newSiteRow = rows.find(r => r.querySelector('td')!.textContent === "New Site")!;
    const colNames: string[] = visual.viewModel.tableColumns[0].map(c => c.name);
    const valueIdx: number = colNames.indexOf("value");
    // A lone point's own value is its own mean - the value column is still well-defined even
    // though there isn't enough history to compute a moving-range-based control limit
    expect(newSiteRow.querySelectorAll('td')[valueIdx].textContent).toBe("50.00");
  });

  it("Re-rendering with a different column count (toggling an icon column on) keeps headers and row cells in sync", () => {
    const keys: string[] = ["1", "2", "3", "4", "5", "6"];
    const numerators: number[] = [10, 11, 9, 10, 11, 9];
    const indicator: string[] = rep("A", 3).concat(rep("B", 3));

    const settingsOff = cloneSettings();
    settingsOff.spc.chart_type = "i";
    visual.update({
      dataViews: [ buildDataView({ key: keys, indicator: indicator, numerators: numerators }, settingsOff) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });
    const colCountOff: number = visual.viewModel.tableColumns[0].length;
    expect(tableDivElement.querySelectorAll('.table-header th').length).toBe(colCountOff);

    const settingsOn = cloneSettings();
    settingsOn.spc.chart_type = "i";
    settingsOn.nhs_icons.show_variation_icons = true;
    settingsOn.outliers.astronomical = true;
    visual.update({
      dataViews: [ buildDataView({ key: keys, indicator: indicator, numerators: numerators }, settingsOn) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });
    const colCountOn: number = visual.viewModel.tableColumns[0].length;
    expect(colCountOn).toBe(colCountOff + 1);
    expect(tableDivElement.querySelectorAll('.table-header th').length).toBe(colCountOn);
    Array.from(tableDivElement.querySelectorAll('tbody tr')).forEach(row => {
      expect(row.querySelectorAll('td').length).toBe(colCountOn);
    });
  });

  it("Selecting a row and then filtering it out of view does not crash highlight recalculation", () => {
    const keys: string[] = ["1","2","3","4","5","6","7","8","9","10","11","12"];
    const numerators: number[] = [10, 11, 9, 10, 11, 9, 10, 11, 9, 10, 11, 1000];
    const indicator: string[] = rep("Stable", 6).concat(rep("Extreme", 6));

    const settingsAll = cloneSettings();
    settingsAll.spc.chart_type = "i";
    settingsAll.outliers.astronomical = true;
    settingsAll.summary_table.table_variation_filter = "all";
    visual.update({
      dataViews: [ buildDataView({ key: keys, indicator: indicator, numerators: numerators }, settingsAll) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    const extremeRow = (visual.viewModel.plotPoints.flat() as plotDataGrouped[]).find(p => p.table_row["Indicator"] === "Extreme")!;
    visual.selectionManager.select(extremeRow.identity[0], false);
    visual.updateHighlighting();
    expect(tableDivElement.querySelectorAll('tbody tr').length).toBe(2);

    const settingsCommonOnly = cloneSettings();
    settingsCommonOnly.spc.chart_type = "i";
    settingsCommonOnly.outliers.astronomical = true;
    settingsCommonOnly.summary_table.table_variation_filter = "common";
    expect(() => {
      visual.update({
        dataViews: [ buildDataView({ key: keys, indicator: indicator, numerators: numerators }, settingsCommonOnly) ],
        viewport: { width: 500, height: 500 },
        type: 2
      });
    }).not.toThrow();

    expect(visualClassElement.querySelector('.errormessage')).toBeFalsy();
    expect(tableDivElement.querySelectorAll('tbody tr').length).toBe(1);
    expect(tableDivElement.querySelector('tbody tr td')!.textContent).toBe("Stable");
  });

  it("table_variation_filter still narrows rows even when variation icons themselves are not displayed", () => {
    const keys: string[] = ["1","2","3","4","5","6","7","8","9","10","11","12"];
    const numerators: number[] = [10, 11, 9, 10, 11, 9, 10, 11, 9, 10, 11, 1000];
    const indicator: string[] = rep("Stable", 6).concat(rep("Extreme", 6));
    const settings = cloneSettings();
    settings.spc.chart_type = "i";
    settings.outliers.astronomical = true;
    settings.nhs_icons.show_variation_icons = false;
    settings.summary_table.table_variation_filter = "common";

    visual.update({
      dataViews: [ buildDataView({ key: keys, indicator: indicator, numerators: numerators }, settings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    const rows = visual.viewModel.plotPoints.flat() as plotDataGrouped[];
    expect(rows.length).toBe(1);
    expect(rows[0].table_row["Indicator"]).toBe("Stable");
    expect(visual.viewModel.tableColumns[0].map(c => c.name)).not.toContain("variation");
  });

  it("Growing the surviving row count back up on re-render (1 row -> 2 rows) renders correctly", () => {
    const keys: string[] = ["1","2","3","4","5","6","7","8","9","10","11","12"];
    const numerators: number[] = [10, 11, 9, 10, 11, 9, 10, 11, 9, 10, 11, 1000];
    const indicator: string[] = rep("Stable", 6).concat(rep("Extreme", 6));
    const baseSettings = () => {
      const s = cloneSettings();
      s.spc.chart_type = "i";
      s.outliers.astronomical = true;
      return s;
    };

    const narrowed = baseSettings();
    narrowed.summary_table.table_variation_filter = "common";
    visual.update({
      dataViews: [ buildDataView({ key: keys, indicator: indicator, numerators: numerators }, narrowed) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });
    expect(tableDivElement.querySelectorAll('tbody tr').length).toBe(1);

    const widened = baseSettings();
    widened.summary_table.table_variation_filter = "all";
    expect(() => {
      visual.update({
        dataViews: [ buildDataView({ key: keys, indicator: indicator, numerators: numerators }, widened) ],
        viewport: { width: 500, height: 500 },
        type: 2
      });
    }).not.toThrow();
    expect(visualClassElement.querySelector('.errormessage')).toBeFalsy();
    expect(tableDivElement.querySelectorAll('tbody tr').length).toBe(2);
  });

  it("Right-clicking a grouped table row passes a single ISelectionId (not an array) to the context menu", () => {
    const keys: string[] = ["1", "2", "3", "4"];
    const numerators: number[] = [10, 11, 9, 10];
    const indicator: string[] = rep("Site A", 2).concat(rep("Site B", 2));
    const settings = cloneSettings();
    settings.spc.chart_type = "i";

    visual.update({
      dataViews: [ buildDataView({ key: keys, indicator: indicator, numerators: numerators }, settings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    const rows = visual.viewModel.plotPoints.flat() as plotDataGrouped[];
    const siteBRow = rows.find(r => r.table_row["Indicator"] === "Site B")!;
    expect(Array.isArray(siteBRow.identity)).toBe(true);
    expect(siteBRow.identity.length).toBeGreaterThan(1);

    const showContextMenuSpy = vi.fn(() => Promise.resolve({}));
    visual.selectionManager.showContextMenu = showContextMenuSpy;

    const bodyRows: HTMLElement[] = Array.from(tableDivElement.querySelectorAll('tbody tr')) as HTMLElement[];
    const siteBTr = bodyRows.find(r => r.querySelector('td')!.textContent === "Site B")!;
    siteBTr.dispatchEvent(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 10, clientY: 10 }));

    expect(showContextMenuSpy).toHaveBeenCalledTimes(1);
    const passedIdentity = showContextMenuSpy.mock.calls[0][0];
    expect(Array.isArray(passedIdentity)).toBe(false);
    expect(passedIdentity).toBe(siteBRow.identity[0]);
  });

  // Remove visual element from DOM to avoid interfering with other tests
  element.remove();
});
