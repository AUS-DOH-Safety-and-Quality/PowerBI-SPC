import type { CalculatedLimits, controlLimitsArgs } from "../Classes/viewModelClass";
import plottedValues from "../Functions/plottedValues";
import { median } from "powerbi-visuals-core/math";
import { sigmaLimits } from "powerbi-visuals-core/spc";

/** I chart with a median centreline; sigma = median moving range / 0.954 (Wheeler, median-range d4 for n = 2). */
export default function immLimits(args: Readonly<controlLimitsArgs>): CalculatedLimits {
  const plotted = plottedValues(args);
  const n_sub: number = args.subset_points.length;
  const subset_points: readonly number[] = args.subset_points;

  const ratio_subset: number[] = new Array<number>(n_sub);
  const consec_diff: number[] = new Array<number>(n_sub - 1);
  ratio_subset[0] = plotted.values[subset_points[0]];
  for (let i = 1; i < n_sub; i++) {
    ratio_subset[i] = plotted.values[subset_points[i]];
    consec_diff[i - 1] = Math.abs(ratio_subset[i] - ratio_subset[i - 1]);
  }
  const cl: number = median(ratio_subset);
  let mmr: number = median(consec_diff);

  if (!args.outliers_in_limits) {
    // Median-range D4 = 3.865 for n = 2
    const consec_diff_ulim: number = mmr * 3.865;
    let valid_diffs: number[] = [];
    for (let i = 0; i < consec_diff.length; i++) {
      if (consec_diff[i] < consec_diff_ulim) {
        valid_diffs.push(consec_diff[i]);
      }
    }
    if (valid_diffs.length > 0) {
      mmr = median(valid_diffs);
    }
  }

  return {
    keys: args.keys,
    ...plotted,
    ...sigmaLimits(args.keys.length, cl, { sigma: mmr / 0.954 })
  };
}
