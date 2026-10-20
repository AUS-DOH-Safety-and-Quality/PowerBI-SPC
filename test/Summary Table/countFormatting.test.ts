import { describe, expect, it } from "vitest";
import type { settingsValueType } from "../../src/settings";
import type { Visual } from "../../src/visual";
import { renderVisual, settingsWith } from "../helpers/renderVisual";
import { sequentialKeys } from "../helpers/buildDataView";
import { columnNames, groupedRow } from "../helpers/summaryTable";
import { findBy, must } from "powerbi-visuals-core/testing";

type ChartType = settingsValueType["spc"]["chart_type"];

// The last two rows have a non-integral numerator, then a non-integral denominator
const numerators = [5, 7, 6, 8, 6.25, 9];
const denominators = [20, 22, 21, 24, 20, 20.5];
const expected = [["5", "20"], ["7", "22"], ["6", "21"], ["8", "24"], ["6.250", "20"], ["9", "20.500"]];

function settings(chart_type: ChartType, show_table = false): settingsValueType {
  return settingsWith({ spc: { chart_type, sig_figs: 3 }, summary_table: { show_table } });
}

function tableCounts(visual: Visual, element: Element, row: number): (string | null)[] {
  const names = columnNames(visual);
  const cells = element.querySelectorAll("tbody tr")[row].querySelectorAll("td");
  return [cells[names.indexOf("numerator")].textContent, cells[names.indexOf("denominator")].textContent];
}

describe.each<ChartType>(["i", "i_m", "i_mm", "run", "u", "up"])("%s chart counts", chart_type => {
  it("are written without decimals when integral in the tooltip and table", () => {
    const tooltips = renderVisual(settings(chart_type), { key: sequentialKeys(6), numerators, denominators });
    const table = renderVisual(settings(chart_type, true), { key: sequentialKeys(6), numerators, denominators });
    for (let i = 0; i < expected.length; i++) {
      const tooltip = tooltips.visual.viewModel.plotPoints[i].tooltip;
      expect([must(findBy(tooltip, "displayName", "Numerator")).value, must(findBy(tooltip, "displayName", "Denominator")).value]).toEqual(expected[i]);
      expect(tableCounts(table.visual, table.element, i)).toEqual(expected[i]);
    }
  });

  it("are written without decimals when integral in each group's last row of the grouped table", () => {
    const rendered = renderVisual(settings(chart_type), {
      key: [...sequentialKeys(5), ...sequentialKeys(6)],
      indicator: [...new Array<string>(5).fill("Fractional numerator"), ...new Array<string>(6).fill("Fractional denominator")],
      numerators: [...numerators.slice(0, 5), ...numerators],
      denominators: [...denominators.slice(0, 4), 25, ...denominators]
    });
    const rows = rendered.visual.viewModel.groupedRows;
    const numeratorRow = groupedRow(rows, "Fractional numerator").table_row;
    const denominatorRow = groupedRow(rows, "Fractional denominator").table_row;
    expect([numeratorRow.numerator, numeratorRow.denominator]).toEqual(["6.250", "25"]);
    expect([denominatorRow.numerator, denominatorRow.denominator]).toEqual(expected[5]);
    expect(numeratorRow.value).toMatch(/\.\d{3}$/);
  });
});

it("writes integral p chart counts without decimals beside percentage values", () => {
  const rendered = renderVisual(settings("p", true), { key: sequentialKeys(3), numerators: [5, 7, 6], denominators: [20, 22, 21] });
  expect(tableCounts(rendered.visual, rendered.element, 0)).toEqual(["5", "20"]);
  const names = columnNames(rendered.visual);
  expect(rendered.element.querySelectorAll("tbody tr")[0].querySelectorAll("td")[names.indexOf("value")].textContent).toBe("25.000%");
});

it.each<ChartType>(["p", "pp"])("writes non-integral %s chart counts with the reported decimals rather than rounding them", chart_type => {
  const rendered = renderVisual(settings(chart_type, true), { key: sequentialKeys(3), numerators: [5, 7.5, 6], denominators: [20, 22, 21.25] });
  expect(tableCounts(rendered.visual, rendered.element, 1)).toEqual(["7.500", "22"]);
  expect(tableCounts(rendered.visual, rendered.element, 2)).toEqual(["6", "21.250"]);
});
