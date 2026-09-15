import { defaultSettings } from "../../src/settings";
import { testDom, createVisualHost } from "powerbi-visuals-utils-testutils";
import { Visual } from "../../src/visual";
import buildDataView from "../helpers/buildDataView";
import rep from "../../src/Functions/rep";
import { type plotDataGrouped } from "../../src/Classes/viewModelClass";
import { describe, it, expect } from "vitest";

function cloneSettings() {
  return JSON.parse(JSON.stringify(defaultSettings));
}

// Small "run" chart dataset (no control limits) - 3 indicator groups
const keys: string[] = ["1","2","3","4","5","6","7","8","9","10","11","12"];
const numerators: number[] = [12.111, 14.222, 9.333, 13.444, 15.555, 8.666, 10.777, 16.888, 7.999, 11.1, 12.2, 9.9];
const indicator: string[] = rep("Team A", 4).concat(rep("Team B", 4)).concat(rep("Team C", 4));

describe("Summary Table - style, decimal and opacity/selection formatting", () => {
  const element = testDom("500", "500");
  const visual = new Visual({ element: element, host: createVisualHost({}) });
  const visualClassElement: Element = document.body.querySelector('.visual') as Element;
  const tableDivElement: Element = visualClassElement.querySelector('div') as Element;

  it("Header and body appearance settings are reflected in the rendered DOM", () => {
    const settings = cloneSettings();
    settings.spc.chart_type = "run";
    settings.summary_table.table_header_font = "Georgia";
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

    const headers: HTMLElement[] = Array.from(tableDivElement.querySelectorAll('.table-header th')) as HTMLElement[];
    expect(headers.length).toBeGreaterThan(2);
    const middleHeader: HTMLElement = headers[1];
    const middleHeaderText: HTMLElement = middleHeader.querySelector('text') as HTMLElement;

    expect(middleHeaderText.style.fontFamily).toBe("Georgia");
    expect(middleHeaderText.style.color).toBe("rgb(18, 52, 86)");
    expect(middleHeader.style.backgroundColor).toBe("rgb(171, 205, 239)");
    expect(middleHeader.style.textAlign).toBe("right");
    expect(middleHeader.style.fontWeight).toBe("bold");
    expect(middleHeader.style.textTransform).toBe("uppercase");
    expect(middleHeader.style.borderBottomStyle).toBe("none");
    // Inner borders disabled: a middle column's left/right border should be suppressed
    expect(middleHeader.style.borderLeftStyle).toBe("none");
    expect(middleHeader.style.borderRightStyle).toBe("none");

    // Interior cell only: drawOuterBorder forces first/last row/column borders back to "inherit"
    const bodyRows: HTMLElement[] = Array.from(tableDivElement.querySelectorAll('tbody tr')) as HTMLElement[];
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

  it("table_text_overflow='none' switches header/row overflow handling off, vs the default ellipsis handling", () => {
    const settingsNone = cloneSettings();
    settingsNone.spc.chart_type = "run";
    settingsNone.summary_table.table_text_overflow = "none";
    visual.update({
      dataViews: [ buildDataView({ key: keys, indicator: indicator, numerators: numerators }, settingsNone) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });
    let header = tableDivElement.querySelector('.table-header th') as HTMLElement;
    expect(header.style.overflow).toBe("auto");
    expect(header.style.maxWidth).toBe("none");

    const settingsEllipsis = cloneSettings();
    settingsEllipsis.spc.chart_type = "run";
    settingsEllipsis.summary_table.table_text_overflow = "ellipsis";
    visual.update({
      dataViews: [ buildDataView({ key: keys, indicator: indicator, numerators: numerators }, settingsEllipsis) ],
      viewport: { width: 500, height: 500 },
      type: 2
    });
    header = tableDivElement.querySelector('.table-header th') as HTMLElement;
    expect(header.style.overflow).toBe("hidden");
    expect(header.style.textOverflow).toBe("ellipsis");
    expect(header.style.maxWidth).not.toBe("none");
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

    const colNames: string[] = visual.viewModel.tableColumns[0].map(c => c.name);
    const valueIdx: number = colNames.indexOf("value");
    const rows: Element[] = Array.from(tableDivElement.querySelectorAll('tbody tr'));
    const teamARow = rows.find(r => r.querySelector('td')!.textContent === "Team A")!;
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

    const rows: HTMLElement[] = Array.from(tableDivElement.querySelectorAll('tbody tr')) as HTMLElement[];
    expect(rows.length).toBe(3);
    // No selection yet: every row uses the default table_opacity
    rows.forEach(row => expect(row.style.opacity).toBe("0.77"));

    // Select the first group's underlying identity and re-derive highlighting
    const plotPoints = visual.viewModel.plotPoints.flat() as plotDataGrouped[];
    const selectedIdentity = plotPoints[0].identity[0];
    visual.selectionManager.select(selectedIdentity, false);
    visual.updateHighlighting();

    const rowsAfterSelection: HTMLElement[] = Array.from(tableDivElement.querySelectorAll('tbody tr')) as HTMLElement[];
    expect(rowsAfterSelection[0].style.opacity).toBe("0.88");
    expect(rowsAfterSelection[1].style.opacity).toBe("0.11");
    expect(rowsAfterSelection[2].style.opacity).toBe("0.11");

    // Clearing the selection restores the default opacity across all rows
    visual.selectionManager.clear();
    visual.updateHighlighting();
    const rowsAfterClear: HTMLElement[] = Array.from(tableDivElement.querySelectorAll('tbody tr')) as HTMLElement[];
    rowsAfterClear.forEach(row => expect(row.style.opacity).toBe("0.77"));
  });

  // Remove visual element from DOM to avoid interfering with other tests
  element.remove();
});
