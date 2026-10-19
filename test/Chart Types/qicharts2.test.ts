import { describe, expect, it } from "vitest";
import { defaultSettings, type settingsValueType } from "../../src/settings";
import calculateLimits from "../helpers/calculateLimits";
import references from "../fixtures/qicharts2";

const lines = ["values", "target", "ll99", "ll95", "ll68", "ul68", "ul95", "ul99"] as const;

/** Both sides evaluate the same formulae, so agreement is expected at floating-point precision. */
function expectRelativelyClose(actual: number | undefined, expected: number, label: string): void {
  if (actual === undefined) {
    expect.fail(`${label} is undefined`);
  }
  expect(Math.abs(actual - expected), label).toBeLessThanOrEqual(1e-12 * Math.max(1, Math.abs(expected)));
}

describe("qicharts2 reference limits", () => {
  it.each(references)("$name", reference => {
    // perc_labels "No" keeps the multiplier literal for proportion charts
    const settings: settingsValueType = {
      ...defaultSettings,
      spc: {
        ...defaultSettings.spc,
        chart_type: reference.chart_type,
        multiplier: reference.multiplier,
        perc_labels: "No",
        outliers_in_limits: reference.outliers_in_limits,
        num_points_subset: reference.num_points_subset ?? undefined,
        subset_points_from: reference.subset_points_from
      }
    };
    const limits = calculateLimits(settings, {
      keys: reference.keys,
      numerators: reference.numerators,
      denominators: reference.denominators ?? undefined,
      xbar_sds: reference.xbar_sds ?? undefined
    }, reference.split_indexes);

    expect(limits.keys).toHaveLength(reference.expected.values.length);
    for (let l = 0; l < lines.length; l++) {
      const line = lines[l];
      const expected = reference.expected[line];
      for (let i = 0; i < expected.length; i++) {
        const value = expected[i];
        if (value === null) {
          // The 1-sigma lines are derived from qicharts2's output only where that is exact (see qicharts2.R)
          if (line !== "ll68" && line !== "ul68") {
            expect(limits[line][i], `${line} at ${i}`).toBeUndefined();
          }
          continue;
        }
        expectRelativelyClose(limits[line][i], value, `${line} at ${i}`);
      }
    }
  });
});
