import type { CalculatedLimits, controlLimitsArgs } from "../Classes/viewModelClass";
import averageMovingRange from "../Functions/averageMovingRange";
import plottedValues from "../Functions/plottedValues";
import { median } from "powerbi-visuals-core/math";
import { sigmaLimits } from "powerbi-visuals-core/spc";

/** I chart with a median centreline; sigma = average moving range / d2 (1.128 for n = 2). */
export default function imLimits(args: Readonly<controlLimitsArgs>): CalculatedLimits {
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

  const sigma: number = averageMovingRange(consec_diff, args.outliers_in_limits) / 1.128;

  return {
    keys: args.keys,
    ...plotted,
    ...sigmaLimits(args.keys.length, cl, { sigma })
  };
}
