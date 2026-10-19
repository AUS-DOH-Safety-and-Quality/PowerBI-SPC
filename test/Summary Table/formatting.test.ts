import { testDom } from "powerbi-visuals-utils-testutils";
import { Visual } from "../../src/visual";
import buildDataView from "../helpers/buildDataView";
import { columnNames, tableRow } from "../helpers/summaryTable";
import { keyedHost, must } from "powerbi-visuals-core/testing";
import { rep } from "powerbi-visuals-core/math";
import { afterAll, describe, it, expect } from "vitest";
import { updateType } from "powerbi-visuals-core/powerbi";
import { cloneSettings } from "../helpers/renderVisual";

/** Small "run" chart dataset (no control limits) - 3 indicator groups */
const keys: string[] = ["1","2","3","4","5","6","7","8","9","10","11","12"];
const numerators: number[] = [12.111, 14.222, 9.333, 13.444, 15.555, 8.666, 10.777, 16.888, 7.999, 11.1, 12.2, 9.9];
const indicator: string[] = rep("Team A", 4).concat(rep("Team B", 4)).concat(rep("Team C", 4));

describe("Summary Table - cell formatting and opacity from the SPC settings", () => {
  const element = testDom("500", "500");
  const visual = new Visual({ element: element, host: keyedHost() });
  const visualClassElement: Element = document.body.querySelector('.visual') as Element;
  const tableDivElement: Element = visualClassElement.querySelector('div') as Element;

  it("table_opacity, table_opacity_selected and table_opacity_unselected drive row opacity before and after a selection", () => {
    const settings = cloneSettings();
    settings.spc.chart_type = "run";
    settings.summary_table.table_opacity = 0.77;
    settings.summary_table.table_opacity_selected = 0.88;
    settings.summary_table.table_opacity_unselected = 0.11;
    visual.update({
      dataViews: [ buildDataView({ key: keys, indicator: indicator, numerators: numerators }, settings) ],
      viewport: { width: 500, height: 500 },
      type: updateType.data
    });

    const rows = tableDivElement.querySelectorAll<HTMLElement>('tbody tr');
    expect(rows.length).toBe(3);
    // No selection yet: every row uses the default table_opacity
    for (let i = 0; i < rows.length; i++) {
      expect(rows[i].style.opacity).toBe("0.77");
    }

    const plotPoints = visual.viewModel.groupedRows;
    const selectedIdentity = plotPoints[0].identity[0];
    visual.selectionManager.select(selectedIdentity, false);
    visual.updateHighlighting();

    const rowsAfterSelection: HTMLElement[] = Array.from(tableDivElement.querySelectorAll<HTMLElement>('tbody tr'));
    expect(rowsAfterSelection[0].style.opacity).toBe("0.88");
    expect(rowsAfterSelection[1].style.opacity).toBe("0.11");
    expect(rowsAfterSelection[2].style.opacity).toBe("0.11");

    // Clearing the selection restores the default opacity across all rows
    visual.selectionManager.clear();
    visual.updateHighlighting();
    const rowsAfterClear = tableDivElement.querySelectorAll<HTMLElement>('tbody tr');
    for (let i = 0; i < rowsAfterClear.length; i++) {
      expect(rowsAfterClear[i].style.opacity).toBe("0.77");
    }
  });

  function render(settings: ReturnType<typeof cloneSettings> | ReturnType<typeof cloneSettings>[], args: Parameters<typeof buildDataView>[0]) {
    visual.update({
      dataViews: [ buildDataView(args, settings) ],
      viewport: { width: 500, height: 500 },
      type: updateType.data
    });
  }

  // The column kinds SPC assigns; Core tests the alignment rules themselves
  it("aligns the indicator and date left, values right and icons centrally", () => {
    const settings = cloneSettings();
    settings.spc.chart_type = "i";
    settings.outliers.astronomical = true;
    settings.nhs_icons.show_variation_icons = true;
    render(settings, { key: keys, indicator: indicator, numerators: numerators });
    const columns: string[] = ["indicator_0", "latest_date", "value", "variation"];
    const expected: string[] = ["left", "left", "right", "center"];
    const names: string[] = columnNames(visual);
    const headers = tableDivElement.querySelectorAll<HTMLElement>('th');
    const cells = must(tableDivElement.querySelector('tbody tr')).querySelectorAll<HTMLElement>('td');
    for (let i = 0; i < columns.length; i++) {
      expect(headers[names.indexOf(columns[i])].style.textAlign, columns[i]).toBe(expected[i]);
      expect(cells[names.indexOf(columns[i])].style.textAlign, columns[i]).toBe(expected[i]);
    }
  });

  it("labels flagged points and leaves unflagged points blank", () => {
    const settings = cloneSettings();
    settings.spc.chart_type = "i";
    settings.summary_table.show_table = true;
    settings.outliers.astronomical = true;
    // An improvement (50) and a deterioration (-30) beyond the 3-sigma limits
    const values: number[] = [10, 10, 11, 10, 9, 10, 50, 10, 11, 10, 9, 10, -30, 10, 10];
    const valueKeys: string[] = [];
    for (let i = 0; i < values.length; i++) {
      valueKeys.push(String(i + 1));
    }
    render(settings, { key: valueKeys, numerators: values });
    const astIdx: number = columnNames(visual).indexOf("astpoint");
    const rows = tableDivElement.querySelectorAll('tbody tr');
    const labels: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      labels.push(rows[i].querySelectorAll('td')[astIdx].textContent);
    }
    const expected: string[] = rep("", values.length);
    expected[6] = "Improvement";
    expected[12] = "Deterioration";
    expect(labels).toEqual(expected);
  });

  it("adds a labelled column for each selected pattern, including two-in-three", () => {
    const settings = cloneSettings();
    settings.spc.chart_type = "i";
    settings.summary_table.show_table = true;
    settings.outliers.astronomical = true;
    settings.outliers.trend = true;
    settings.outliers.shift = true;
    settings.outliers.two_in_three = true;
    settings.outliers.two_in_three_limit = "1 Sigma";
    // 14 and 6 fall beyond the 1-sigma limits only, two of three on the same side
    const values: number[] = [10, 11, 9, 10, 11, 9, 10, 14, 10, 14, 10, 11, 9, 10, 6, 11, 6, 10, 9, 11];
    const valueKeys: string[] = [];
    for (let i = 0; i < values.length; i++) {
      valueKeys.push(String(i + 1));
    }
    render(settings, { key: valueKeys, numerators: values });
    const headers = tableDivElement.querySelectorAll("thead th");
    const names = columnNames(visual);
    expect(names.slice(-4)).toEqual(["astpoint", "trend", "shift", "two_in_three"]);
    expect(headers[headers.length - 1].textContent).toBe("Two-in-Three");
    const rows = tableDivElement.querySelectorAll("tbody tr");
    const labels: string[] = [];
    for (let i = 0; i < rows.length; i++) {
      labels.push(rows[i].querySelectorAll("td")[names.length - 1].textContent ?? "");
    }
    const expected: string[] = rep("", values.length);
    expected[7] = "Improvement";
    expected[9] = "Improvement";
    expected[14] = "Deterioration";
    expected[16] = "Deterioration";
    expect(labels).toEqual(expected);
  });

  it("styles each group's row from its own conditional formatting", () => {
    const rows = [];
    for (let i = 0; i < keys.length; i++) {
      const settings = cloneSettings();
      settings.summary_table.table_body_bg_colour = ["#111111", "#222222", "#333333"][Math.floor(i / 4)];
      settings.summary_table.table_body_colour = ["#444444", "#555555", "#666666"][Math.floor(i / 4)];
      rows.push(settings);
    }
    render(rows, { key: keys, indicator: indicator, numerators: numerators });
    const expected: Record<string, [string, string]> = {
      "Team A": ["rgb(17, 17, 17)", "rgb(68, 68, 68)"],
      "Team B": ["rgb(34, 34, 34)", "rgb(85, 85, 85)"],
      "Team C": ["rgb(51, 51, 51)", "rgb(102, 102, 102)"]
    };
    const teams = Object.keys(expected);
    for (let t = 0; t < teams.length; t++) {
      const row = tableRow(tableDivElement, teams[t]);
      const cells = row.querySelectorAll<HTMLElement>('td');
      for (let c = 0; c < cells.length; c++) {
        expect(cells[c].style.backgroundColor, teams[t]).toBe(expected[teams[t]][0]);
        expect(cells[c].style.color, teams[t]).toBe(expected[teams[t]][1]);
      }
    }
  });

  // Remove visual element from DOM to avoid interfering with other tests
  afterAll(() => element.remove());
});
