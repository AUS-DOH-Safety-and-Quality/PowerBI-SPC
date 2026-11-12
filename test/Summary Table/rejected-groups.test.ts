import { describe, expect, it } from "vitest";
import { sequentialKeys } from "../helpers/buildDataView";
import { renderVisual, settingsWith, type SettingsOverrides } from "../helpers/renderVisual";
import { columnNames, groupedRow } from "../helpers/summaryTable";

const key = [...sequentialKeys(4), ...sequentialKeys(4)];
const indicator = ["A", "A", "A", "A", "B", "B", "B", "B"];
const icons = { show_variation_icons: true, show_assurance_icons: true } as const;

function pChart(overrides: SettingsOverrides = {}) {
  return settingsWith({
    spc: { chart_type: "p" }, outliers: { astronomical: true }, nhs_icons: icons, lines: { show_alt_target: true, alt_target: 50 }, ...overrides
  });
}

describe("Summary Table - groups without usable rows", () => {
  it("keeps a group of only zero denominators as a row of its last inputs, without a value, limits or icons", () => {
    const result = renderVisual(pChart(), {
      key, indicator, numerators: [1, 2, 3, 4, 0, 0, 0, 0], denominators: [10, 10, 10, 10, 0, 0, 0, 0]
    });
    const viewModel = result.visual.viewModel;
    expect(result.element.querySelector(".errormessage")?.textContent ?? "").toBe("");
    expect(result.element.querySelectorAll("tbody tr").length).toBe(2);
    expect(viewModel.inputData[1].rejected?.error).toBe("All denominators are zero!");
    expect(columnNames(result.visual)).toContain("denominator");

    const row = groupedRow(viewModel.groupedRows, "B");
    expect(row.table_row).toMatchObject({
      latest_date: "4", value: "", numerator: "0", denominator: "0", target: "", ll99: "", ul99: "", assurance: "none"
    });
    expect(row.variation_icons).toEqual([]);
    expect(row.identity.length).toBe(4);

    const valid = groupedRow(viewModel.groupedRows, "A");
    expect(valid.table_row).toMatchObject({ latest_date: "4", numerator: "4", denominator: "10" });
    expect(valid.table_row.value).not.toBe("");
    expect(valid.table_row.ul99).not.toBe("");
  });

  it("shows no inputs that are not numbers", () => {
    const result = renderVisual(pChart(), {
      key, indicator, numerators: [1, 2, 3, 4, null, null, null, null], denominators: [10, 10, 10, 10, 5, 5, 5, 5]
    });
    expect(groupedRow(result.visual.viewModel.groupedRows, "B").table_row).toMatchObject({ latest_date: "4", numerator: "", denominator: "5" });
  });

  it("keeps a moving range group with a single observation", () => {
    const result = renderVisual(settingsWith({ spc: { chart_type: "mr" } }), {
      key: [...sequentialKeys(4), "1"], indicator: ["A", "A", "A", "A", "B"], numerators: [1, 2, 3, 4, 7]
    });
    expect(result.element.querySelector(".errormessage")?.textContent ?? "").toBe("");
    expect(groupedRow(result.visual.viewModel.groupedRows, "B").table_row).toMatchObject({ latest_date: "1", value: "", numerator: "7" });
  });

  it.each(["special", "common", "improvement"] as const)("hides the row under the %s variation filter", filter => {
    const result = renderVisual(pChart({ summary_table: { table_variation_filter: filter } }), {
      key, indicator, numerators: [1, 2, 3, 4, 0, 0, 0, 0], denominators: [10, 10, 10, 10, 0, 0, 0, 0]
    });
    const rows = result.visual.viewModel.groupedRows;
    for (let i = 0; i < rows.length; i++) {
      expect(rows[i].table_row.indicator_0).not.toBe("B");
    }
  });

  it("renders every group's row when no group has usable rows", () => {
    const zeros = new Array<number>(8).fill(0);
    const result = renderVisual(pChart(), { key, indicator, numerators: zeros, denominators: zeros });
    expect(result.element.querySelector(".errormessage")?.textContent ?? "").toBe("");
    expect(result.element.querySelectorAll("tbody tr").length).toBe(2);
    const rows = result.visual.viewModel.groupedRows;
    for (let i = 0; i < rows.length; i++) {
      expect(rows[i].table_row).toMatchObject({ latest_date: "4", value: "", numerator: "0", denominator: "0", ul99: "" });
      expect(rows[i].variation_icons).toEqual([]);
    }
  });

  it("still rejects an individual chart without usable rows", () => {
    const zeros = new Array<number>(4).fill(0);
    const single = renderVisual(pChart(), { key: sequentialKeys(4), numerators: zeros, denominators: zeros });
    expect(single.element.textContent).toBe("All denominators are zero!");
    const oneIndicator = renderVisual(pChart(), { key: sequentialKeys(4), indicator: ["A", "A", "A", "A"], numerators: zeros, denominators: zeros });
    expect(oneIndicator.element.textContent).toBe("A: All denominators are zero!");
  });
});
