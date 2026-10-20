import { describe, expect, it } from "vitest";
import type powerbi from "powerbi-visuals-api";
import type { settingsValueType } from "../../src/settings";
import { frontend } from "../../src/frontend";
import { renderVisual, settingsWith } from "../helpers/renderVisual";
import { sequentialKeys, type DataViewArgs } from "../helpers/buildDataView";
import { columnNames, groupedRow } from "../helpers/summaryTable";
import { findBy, must } from "powerbi-visuals-core/testing";

type ChartType = settingsValueType["spc"]["chart_type"];

// Group means (or SDs for s), sample sizes and SDs; the last SD is non-integral
const inputs: DataViewArgs = {
  key: sequentialKeys(5), numerators: [10, 12, 11, 13, 12], denominators: [5, 6, 5, 7, 6], xbar_sds: [2, 3, 2, 4, 2.5]
};

function settings(chart_type: ChartType, show_table = false): settingsValueType {
  return settingsWith({ spc: { chart_type, sig_figs: 3 }, summary_table: { show_table } });
}

function tooltipNames(items: readonly powerbi.extensibility.VisualTooltipDataItem[]): (string | undefined)[] {
  const names = new Array<string | undefined>(items.length);
  for (let i = 0; i < items.length; i++) {
    names[i] = items[i].displayName;
  }
  return names;
}

describe.each([
  { chart_type: "xbar", value: "Group Mean", sd: true },
  { chart_type: "s", value: "Group SD", sd: false }
] as const)("$chart_type chart sample sizes", ({ chart_type, value, sd }) => {
  it("are the tooltip's denominator, with no numerator duplicating the value", () => {
    const points = renderVisual(settings(chart_type), inputs).visual.viewModel.plotPoints;
    for (let i = 0; i < points.length; i++) {
      const tooltip = points[i].tooltip;
      expect(tooltipNames(tooltip).slice(0, sd ? 4 : 3)).toEqual(["Date", value, "Denominator", ...(sd ? ["SD"] : [])]);
      expect(tooltipNames(tooltip)).not.toContain("Numerator");
      expect(must(findBy(tooltip, "displayName", "Denominator")).value).toBe(String(must(inputs.denominators)[i]));
    }
    if (sd) {
      expect(must(findBy(points[0].tooltip, "displayName", "SD")).value).toBe("2");
      expect(must(findBy(points[4].tooltip, "displayName", "SD")).value).toBe("2.500");
    } else {
      expect(tooltipNames(points[0].tooltip)).not.toContain("SD");
    }
  });

  it("fill the single-group table's denominator column, with no numerator column", () => {
    const rendered = renderVisual(settings(chart_type, true), inputs);
    const names = columnNames(rendered.visual);
    expect(names).not.toContain("numerator");
    const rows = rendered.element.querySelectorAll("tbody tr");
    for (let i = 0; i < rows.length; i++) {
      expect(rows[i].querySelectorAll("td")[names.indexOf("denominator")].textContent).toBe(String(must(inputs.denominators)[i]));
    }
  });

  it("fill the grouped table's denominator, leaving the numerator only for groups with numerators", () => {
    const alone = renderVisual(settings(chart_type), {
      ...inputs, key: [...sequentialKeys(5), ...sequentialKeys(5)], indicator: ["A", "A", "A", "A", "A", "B", "B", "B", "B", "B"],
      numerators: [...must(inputs.numerators), ...must(inputs.numerators)],
      denominators: [...must(inputs.denominators), ...must(inputs.denominators)],
      xbar_sds: [...must(inputs.xbar_sds), ...must(inputs.xbar_sds)]
    });
    expect(columnNames(alone.visual)).not.toContain("numerator");
    expect(groupedRow(alone.visual.viewModel.groupedRows, "B").table_row.denominator).toBe("6");

    const p = settingsWith({ spc: { chart_type: "p", sig_figs: 3 } });
    const subgroup = settings(chart_type);
    const mixed = renderVisual([p, p, p, subgroup, subgroup, subgroup, subgroup, subgroup], {
      key: [...sequentialKeys(3), ...sequentialKeys(5)], indicator: ["P", "P", "P", "S", "S", "S", "S", "S"],
      numerators: [5, 7, 6, ...must(inputs.numerators)],
      denominators: [20, 22, 21, ...must(inputs.denominators)],
      xbar_sds: [null, null, null, ...must(inputs.xbar_sds)]
    });
    expect(columnNames(mixed.visual)).toContain("numerator");
    const rows = mixed.visual.viewModel.groupedRows;
    expect([groupedRow(rows, "S").table_row.numerator, groupedRow(rows, "S").table_row.denominator]).toEqual(["", "6"]);
    expect([groupedRow(rows, "P").table_row.numerator, groupedRow(rows, "P").table_row.denominator]).toEqual(["6", "21"]);
  });

  it("are returned as the frontend's denominator, with no numerator", () => {
    const limits = frontend.limits(renderVisual(settings(chart_type), inputs).visual);
    expect(limits).toHaveProperty(["limits", "4", "denominator"], 6);
    expect(limits).not.toHaveProperty(["limits", "4", "numerator"]);
    expect(limits).toHaveProperty(["limits", "4", "value"], 12);
  });
});

it("scales the xbar SD by the multiplier, as it does the group means, but not the sample sizes", () => {
  const points = renderVisual(settingsWith({ spc: { chart_type: "xbar", sig_figs: 3, multiplier: 60 } }), inputs).visual.viewModel.plotPoints;
  expect(must(findBy(points[0].tooltip, "displayName", "Group Mean")).value).toBe("600.000");
  expect(must(findBy(points[0].tooltip, "displayName", "SD")).value).toBe("120");
  expect(must(findBy(points[4].tooltip, "displayName", "SD")).value).toBe("150");
  expect(must(findBy(points[4].tooltip, "displayName", "Denominator")).value).toBe("6");
  expect(points[4].table_row.xbar_sd).toBe(150);
});

it("leaves the xbar SD out of the limit truncation", () => {
  const points = renderVisual(settingsWith({ spc: { chart_type: "xbar", ul_truncate: 1, ll_truncate: 0 } }), inputs).visual.viewModel.plotPoints;
  expect(points[3].table_row.xbar_sd).toBe(4);
  expect(points[3].table_row.ul99).toBe(1);
});

it.each<ChartType>(["i", "p", "u", "c"])("leaves the SD out of the %s chart tooltip", chart_type => {
  const points = renderVisual(settings(chart_type), { ...inputs, numerators: [1, 2, 1, 3, 2] }).visual.viewModel.plotPoints;
  expect(points).toHaveLength(5);
  expect(tooltipNames(points[0].tooltip)).not.toContain("SD");
});
