import { expect, it } from "vitest";
import { frontend } from "../src/frontend";
import { renderVisual, settingsWith } from "./helpers/renderVisual";
import { sequentialKeys } from "./helpers/buildDataView";
import type { Visual } from "../src/visual";

/** The sorted column names of one limits row; the frontend returns them untyped */
function rowKeys(visual: Visual, index: number): string[] {
  const limits: unknown = frontend.limits(visual).limits;
  if (!Array.isArray(limits)) {
    throw new Error("limits is not an array");
  }
  const row: unknown = limits[index];
  if (typeof row !== "object" || row === null) {
    throw new Error(`Row ${index} is not an object`);
  }
  return Object.keys(row).sort();
}

it("returns flat limits with the original indicator values", () => {
  const numerators = [5, 6, 5, 7, 6, 5, 4];
  const rendered = renderVisual(settingsWith({}), {
    key: [...sequentialKeys(7), ...sequentialKeys(7)],
    numerators: [...numerators, ...numerators],
    indicator: [...Array<string>(7).fill(""), ...Array<string>(7).fill("B")]
  });
  const result = frontend.limits(rendered.visual);
  expect(result.limits).toHaveLength(14);
  expect(result).toHaveProperty(["limits", "6", "Indicator"], "");
  expect(result).toHaveProperty(["limits", "6", "value"], 4);
  expect(result).toHaveProperty(["limits", "13", "Indicator"], "B");
  expect(result).toHaveProperty(["limits", "13", "value"], 4);
});

it("renames indicators named like a limit column, keeping both values", () => {
  const rendered = renderVisual(settingsWith({}), {
    key: sequentialKeys(7),
    numerators: [5, 6, 5, 7, 6, 5, 4],
    indicators: [
      { name: "value", values: Array<string>(7).fill("A") },
      { name: "date", values: Array<string>(7).fill("B") },
      { name: "Region", values: Array<string>(7).fill("C") }
    ]
  });
  const result = frontend.limits(rendered.visual);
  expect(result).toHaveProperty(["limits", "6", "value_"], "A");
  expect(result).toHaveProperty(["limits", "6", "value"], 4);
  expect(result).toHaveProperty(["limits", "6", "date_"], "B");
  expect(result).toHaveProperty(["limits", "6", "date"], sequentialKeys(7)[6]);
  expect(result).toHaveProperty(["limits", "6", "Region"], "C");
});

it("ids each row by its data view position, skipping removed rows and following the group order", () => {
  const rendered = renderVisual(settingsWith({}), {
    key: [...sequentialKeys(4), ...sequentialKeys(4)],
    numerators: [5, null, 7, 6, 4, 3, 6, 5],
    indicator: ["A", "A", "A", "A", "B", "B", "B", "B"]
  });
  expect(frontend.limits(rendered.visual)).toHaveProperty("rowIds", [0, 2, 3, 4, 5, 6, 7]);

  const interleaved = renderVisual(settingsWith({}), {
    key: [...sequentialKeys(3), ...sequentialKeys(3)].sort(),
    numerators: [5, 4, 6, 3, 7, 5],
    indicator: ["A", "B", "A", "B", "A", "B"]
  });
  expect(frontend.limits(interleaved.visual)).toHaveProperty("rowIds", [0, 2, 4, 1, 3, 5]);
});

it("includes a flag column only when its outlier rule is enabled", () => {
  const inputs = { key: sequentialKeys(10), numerators: [5, 6, 5, 7, 6, 5, 4, 40, 6, 5] };
  const none = rowKeys(renderVisual(settingsWith({}), inputs).visual, 7);
  expect(none).not.toContain("astpoint");
  expect(none).not.toContain("trend");
  expect(none).not.toContain("shift");
  expect(none).not.toContain("two_in_three");

  const rendered = renderVisual(settingsWith({ outliers: { astronomical: true, shift: true } }), inputs);
  const some = frontend.limits(rendered.visual);
  expect(some).toHaveProperty(["limits", "7", "astpoint"], "improvement");
  expect(some).toHaveProperty(["limits", "8", "astpoint"], "none");
  expect(some).toHaveProperty(["limits", "0", "shift"], "deterioration");
  expect(some).toHaveProperty(["limits", "8", "shift"], "none");
  expect(rowKeys(rendered.visual, 7)).not.toContain("trend");
  expect(rowKeys(rendered.visual, 7)).not.toContain("two_in_three");
});

it("leaves out columns the chart or settings give no values for", () => {
  const run = renderVisual(settingsWith({ spc: { chart_type: "run" } }), { key: sequentialKeys(5), numerators: [5, 6, 5, 7, 6] });
  expect(rowKeys(run.visual, 0)).toEqual(["date", "target", "trend_line", "value"]);

  const p = renderVisual(settingsWith({ spc: { chart_type: "p" }, lines: { show_alt_target: true, alt_target: 0.5 } }), {
    key: sequentialKeys(5), numerators: [5, 6, 5, 7, 6], denominators: [10, 10, 10, 10, 10]
  });
  expect(rowKeys(p.visual, 0)).toEqual([
    "alt_target", "date", "denominator", "ll68", "ll95", "ll99", "numerator", "target", "trend_line", "ul68", "ul95", "ul99", "value"
  ]);
  const result = frontend.limits(p.visual);
  expect(result).toHaveProperty(["limits", "0", "numerator"], 5);
  expect(result).toHaveProperty(["limits", "0", "denominator"], 10);
  // Not multiplied unless multiplier_alt_target is set
  expect(result).toHaveProperty(["limits", "0", "alt_target"], 0.5);
});

it("reports a static error only for a grouped summary table", () => {
  const single = renderVisual(settingsWith({}), { key: sequentialKeys(5), numerators: [5, 6, 5, 7, 6] });
  expect(frontend.staticError?.(single.visual)).toBeUndefined();
  const grouped = renderVisual(settingsWith({}), {
    key: [...sequentialKeys(5), ...sequentialKeys(5)],
    numerators: [5, 6, 5, 7, 6, 5, 6, 5, 7, 6],
    indicator: [...Array<string>(5).fill("A"), ...Array<string>(5).fill("B")]
  });
  expect(frontend.staticError?.(grouped.visual)).toBe("Static plots are not available for SPC charts with multiple indicator groups.");
});
