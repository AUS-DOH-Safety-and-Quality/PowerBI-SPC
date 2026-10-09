import { defaultSettings } from "../../src/settings";
import { testDom } from "powerbi-visuals-utils-testutils";
import { Visual } from "../../src/visual";
import buildDataView from "../helpers/buildDataView";
import { columnNames, tableRow } from "../helpers/summaryTable";
import { keyedHost } from "powerbi-visuals-core/testing";
import { rep } from "powerbi-visuals-core/math";
import { afterAll, describe, it, expect } from "vitest";

function cloneSettings() {
  return JSON.parse(JSON.stringify(defaultSettings));
}

/** Small "run" chart dataset (no control limits) - 3 indicator groups */
const keys: string[] = ["1","2","3","4","5","6","7","8","9","10","11","12"];
const numerators: number[] = [12.111, 14.222, 9.333, 13.444, 15.555, 8.666, 10.777, 16.888, 7.999, 11.1, 12.2, 9.9];
const indicator: string[] = rep("Team A", 4).concat(rep("Team B", 4)).concat(rep("Team C", 4));

describe("Summary Table - style, decimal and opacity/selection formatting", () => {
  const element = testDom("500", "500");
  const visual = new Visual({ element: element, host: keyedHost() });
  const visualClassElement: Element = document.body.querySelector('.visual') as Element;
  const tableDivElement: Element = visualClassElement.querySelector('div') as Element;

  it("Header and body appearance settings are reflected in the rendered DOM", () => {
    const settings = cloneSettings();
    settings.spc.chart_type = "run";
    settings.summary_table.table_header_font = "Georgia";
    settings.summary_table.table_header_size = 13;
    settings.summary_table.table_header_colour = "#123456";
    settings.summary_table.table_header_bg_colour = "#abcdef";
    settings.summary_table.table_header_text_align = "right";
    settings.summary_table.table_header_font_weight = "bold";
    settings.summary_table.table_header_text_transform = "uppercase";
    settings.summary_table.table_header_border_bottom = false;
    settings.summary_table.table_header_border_inner = false;
    settings.summary_table.table_body_font = "Verdana";
    settings.summary_table.table_body_colour = "#654321";
    settings.summary_table.table_body_bg_colour = "#fedcba";
    settings.summary_table.table_body_text_align = "left";
    settings.summary_table.table_body_font_weight = "lighter";
    settings.summary_table.table_body_text_transform = "lowercase";
    settings.summary_table.table_body_border_top_bottom = false;

    visual.update({
      dataViews: [ buildDataView({ key: keys, indicator: indicator, numerators: numerators }, settings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    const headers: HTMLElement[] = Array.from(tableDivElement.querySelectorAll<HTMLElement>('.table-header th'));
    expect(headers.length).toBeGreaterThan(2);
    const middleHeader: HTMLElement = headers[1];

    expect(middleHeader.style.fontFamily).toBe("Georgia");
    expect(middleHeader.style.color).toBe("rgb(18, 52, 86)");
    // On the cell itself, as wrapped labels take their line height from it
    expect(getComputedStyle(middleHeader).fontSize).toBe("13px");
    expect(middleHeader.style.backgroundColor).toBe("rgb(171, 205, 239)");
    expect(middleHeader.style.textAlign).toBe("right");
    expect(middleHeader.style.fontWeight).toBe("bold");
    expect(middleHeader.style.textTransform).toBe("uppercase");
    expect(middleHeader.style.borderBottomStyle).toBe("none");
    // Inner borders disabled: a middle column draws no right border, and cells never draw a left border
    expect(middleHeader.style.borderLeftStyle).toBe("none");
    expect(middleHeader.style.borderRightStyle).toBe("none");

    // Interior cell only: drawOuterBorder forces first/last row/column borders back to "inherit"
    const bodyRows: HTMLElement[] = Array.from(tableDivElement.querySelectorAll<HTMLElement>('tbody tr'));
    expect(bodyRows.length).toBeGreaterThan(2);
    const middleCell: HTMLElement = bodyRows[1].querySelectorAll('td')[1] as HTMLElement;
    expect(middleCell.style.fontFamily).toBe("Verdana");
    expect(middleCell.style.color).toBe("rgb(101, 67, 33)");
    expect(middleCell.style.backgroundColor).toBe("rgb(254, 220, 186)");
    expect(middleCell.style.textAlign).toBe("left");
    expect(middleCell.style.fontWeight).toBe("lighter");
    expect(middleCell.style.textTransform).toBe("lowercase");
    expect(middleCell.style.borderTopStyle).toBe("none");
    expect(middleCell.style.borderBottomStyle).toBe("none");
  });

  it("Outer border side toggles independently control each edge of the table", () => {
    const settings = cloneSettings();
    settings.spc.chart_type = "run";
    settings.summary_table.table_outer_border_style = "solid";
    settings.summary_table.table_outer_border_left = false;
    settings.summary_table.table_outer_border_top = false;
    settings.summary_table.table_outer_border_right = true;
    settings.summary_table.table_outer_border_bottom = true;

    visual.update({
      dataViews: [ buildDataView({ key: keys, indicator: indicator, numerators: numerators }, settings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    const table = tableDivElement.querySelector('table.table-group') as HTMLElement;
    expect(table.style.borderLeftStyle).toBe("none");
    expect(table.style.borderTopStyle).toBe("none");
    expect(table.style.borderRightStyle).toBe("solid");
    expect(table.style.borderBottomStyle).toBe("solid");
  });

  it("table_text_overflow limits header and body cells alike, and is off by default", () => {
    const long: string = "Readmissions_within_twenty_eight_days_of_discharge";
    const longIndicator: string[] = rep(long, 4).concat(indicator.slice(4));
    visual.update({
      dataViews: [ buildDataView({ key: keys, indicator: longIndicator, numerators: numerators }, cloneSettings()) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });
    let cells = tableDivElement.querySelectorAll<HTMLElement>('th, td');
    for (let i = 0; i < cells.length; i++) {
      expect(cells[i].style.maxWidth).toBe("none");
    }
    const unlimited: number = tableRow(tableDivElement, long).querySelector('td')!.getBoundingClientRect().width;

    const settingsEllipsis = cloneSettings();
    settingsEllipsis.summary_table.table_text_overflow = "ellipsis";
    visual.update({
      dataViews: [ buildDataView({ key: keys, indicator: longIndicator, numerators: numerators }, settingsEllipsis) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });
    cells = tableDivElement.querySelectorAll<HTMLElement>('th, td');
    for (let i = 0; i < cells.length; i++) {
      expect(cells[i].style.overflow).toBe("hidden");
      expect(cells[i].style.textOverflow).toBe("ellipsis");
      expect(cells[i].style.maxWidth).not.toBe("none");
    }
    const longCell = tableRow(tableDivElement, long).querySelector('td')!;
    expect(longCell.getBoundingClientRect().width).toBeLessThan(unlimited);
    expect(longCell.scrollWidth).toBeGreaterThan(longCell.clientWidth);
  });

  it("spc.sig_figs controls the number of decimal places rendered in numeric table cells", () => {
    const settings = cloneSettings();
    settings.spc.chart_type = "run";
    settings.spc.sig_figs = 4;
    visual.update({
      dataViews: [ buildDataView({ key: keys, indicator: indicator, numerators: numerators }, settings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });

    const colNames: string[] = columnNames(visual);
    const valueIdx: number = colNames.indexOf("value");
    const teamARow = tableRow(tableDivElement, "Team A");
    const expectedValue: string = numerators[3].toFixed(4);
    expect(teamARow.querySelectorAll('td')[valueIdx].textContent).toBe(expectedValue);
  });

  it("table_opacity, table_opacity_selected and table_opacity_unselected drive row opacity before and after a selection", () => {
    const settings = cloneSettings();
    settings.spc.chart_type = "run";
    settings.summary_table.table_opacity = 0.77;
    settings.summary_table.table_opacity_selected = 0.88;
    settings.summary_table.table_opacity_unselected = 0.11;
    visual.update({
      dataViews: [ buildDataView({ key: keys, indicator: indicator, numerators: numerators }, settings) ],
      viewport: { width: 500, height: 500 },
      type: 2
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

  function render(settings: ReturnType<typeof cloneSettings>, args: Parameters<typeof buildDataView>[0]) {
    visual.update({
      dataViews: [ buildDataView(args, settings) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });
  }

  it("draws only the bottom and right borders of cells, so neighbouring borders never double", () => {
    const settings = cloneSettings();
    settings.summary_table.table_header_border_inner = true;
    settings.summary_table.table_body_border_left_right = true;
    render(settings, { key: keys, indicator: indicator, numerators: numerators });

    const header = tableDivElement.querySelectorAll<HTMLElement>('th')[1];
    expect([header.style.borderTopStyle, header.style.borderLeftStyle]).toEqual(["none", "none"]);
    expect([header.style.borderBottomStyle, header.style.borderRightStyle]).toEqual(["solid", "solid"]);
    const rows = tableDivElement.querySelectorAll('tbody tr');
    const cell = rows[1].querySelectorAll<HTMLElement>('td')[1];
    expect([cell.style.borderTopStyle, cell.style.borderLeftStyle]).toEqual(["none", "none"]);
    expect([cell.style.borderBottomStyle, cell.style.borderRightStyle]).toEqual(["solid", "solid"]);
    // The table's outer border draws its edges
    const lastCell = rows[rows.length - 1].querySelector<HTMLElement>('td:last-child')!;
    expect(getComputedStyle(lastCell).borderRightStyle).toBe("none");
    expect(getComputedStyle(lastCell).borderBottomStyle).toBe("none");
  });

  it("sizes rows to their content rather than stretching them over the visual", () => {
    render(cloneSettings(), { key: keys, indicator: indicator, numerators: numerators });
    const table = tableDivElement.querySelector('table')!;
    expect(table.getBoundingClientRect().height).toBeLessThan(tableDivElement.clientHeight / 2);
  });

  it("keeps the header above faded rows when the body scrolls", () => {
    let manyKeys: string[] = [];
    let manyIndicator: string[] = [];
    let manyNumerators: number[] = [];
    for (let g = 0; g < 40; g++) {
      manyKeys = manyKeys.concat(keys);
      manyIndicator = manyIndicator.concat(rep(`Team ${g}`, keys.length));
      manyNumerators = manyNumerators.concat(numerators);
    }
    render(cloneSettings(), { key: manyKeys, indicator: manyIndicator, numerators: manyNumerators });
    visual.selectionManager.select(visual.viewModel.groupedRows[0].identity[0], false);
    visual.updateHighlighting();
    tableDivElement.scrollTop = 200;

    const header = tableDivElement.querySelectorAll<HTMLElement>('th')[1];
    const rect = header.getBoundingClientRect();
    expect(tableDivElement.scrollTop).toBe(200);
    expect(rect.top).toBe(tableDivElement.getBoundingClientRect().top);
    expect(document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)!.closest('th')).toBe(header);
    // Collapsed borders are painted by the table, so would stay behind as the header sticks
    expect(getComputedStyle(tableDivElement.querySelector('table')!).borderCollapse).toBe("separate");

    tableDivElement.scrollTop = 0;
    visual.selectionManager.clear();
    visual.updateHighlighting();
  });

  it("aligns numbers right, text left and icons centrally unless an alignment is chosen", () => {
    const settings = cloneSettings();
    settings.spc.chart_type = "i";
    settings.outliers.astronomical = true;
    settings.nhs_icons.show_variation_icons = true;
    const columns: string[] = ["Indicator", "latest_date", "value", "variation"];
    const expected: string[] = ["left", "left", "right", "center"];
    for (const align of ["auto", "center"]) {
      settings.summary_table.table_header_text_align = align;
      settings.summary_table.table_body_text_align = align;
      render(settings, { key: keys, indicator: indicator, numerators: numerators });
      const names: string[] = columnNames(visual);

      const headers = tableDivElement.querySelectorAll<HTMLElement>('th');
      const cells = tableDivElement.querySelector('tbody tr')!.querySelectorAll<HTMLElement>('td');
      for (let i = 0; i < columns.length; i++) {
        const alignment: string = align === "auto" ? expected[i] : align;
        expect(headers[names.indexOf(columns[i])].style.textAlign, columns[i]).toBe(alignment);
        expect(cells[names.indexOf(columns[i])].style.textAlign, columns[i]).toBe(alignment);
      }
    }
  });

  it("highlights the whole row on hover and restores the configured background", () => {
    const settings = cloneSettings();
    settings.summary_table.show_table = true;
    settings.summary_table.table_body_bg_colour = "#fedcba";
    render(settings, { key: keys, numerators: numerators });
    const rows = tableDivElement.querySelectorAll('tbody tr');

    rows[1].dispatchEvent(new MouseEvent("mouseenter"));
    for (let r = 0; r < rows.length; r++) {
      const cells = rows[r].querySelectorAll<HTMLElement>('td');
      for (let c = 0; c < cells.length; c++) {
        expect(cells[c].style.backgroundColor).toBe(r === 1 ? "whitesmoke" : "rgb(254, 220, 186)");
      }
    }
    rows[1].dispatchEvent(new MouseEvent("mouseleave"));
    const cells = rows[1].querySelectorAll<HTMLElement>('td');
    for (let c = 0; c < cells.length; c++) {
      expect(cells[c].style.backgroundColor).toBe("rgb(254, 220, 186)");
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
      labels.push(rows[i].querySelectorAll('td')[astIdx].textContent!);
    }
    const expected: string[] = rep("", values.length);
    expected[6] = "Improvement";
    expected[12] = "Deterioration";
    expect(labels).toEqual(expected);
  });

  it("keeps dates on one line while text columns wrap", () => {
    render(cloneSettings(), { key: keys, indicator: indicator, numerators: numerators });
    const dateIdx: number = columnNames(visual).indexOf("latest_date");
    const cells = tableDivElement.querySelector('tbody tr')!.querySelectorAll<HTMLElement>('td');
    expect(cells[dateIdx].style.whiteSpace).toBe("nowrap");
    expect(cells[0].style.whiteSpace).toBe("normal");
  });

  // Remove visual element from DOM to avoid interfering with other tests
  afterAll(() => element.remove());
});
