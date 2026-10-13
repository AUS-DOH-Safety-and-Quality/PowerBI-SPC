import type { CalculatedLimits, denominatorLimitsArgs } from "../Classes/viewModelClass";
import averageMovingRange from "../Functions/averageMovingRange";
import plottedValues from "../Functions/plottedValues";
import subsetRatio from "../Functions/subsetRatio";
import { sigmaLimits } from "powerbi-visuals-core/spc";

/** Laney P' chart: binomial sigma scaled by the z-scores' average moving range / d2 (1.128 for n = 2). */
export default function pprimeLimits(args: Readonly<denominatorLimitsArgs>): CalculatedLimits {
  const n: number = args.keys.length;
  const denominators: readonly number[] = args.denominators;
  const subset_points: readonly number[] = args.subset_points;
  const cl: number = subsetRatio(args.numerators, denominators, subset_points);
  const plotted = plottedValues(args);

  // Every proportion equals the centreline, so the z-scores are undefined
  if (cl === 0 || cl === 1) {
    return { keys: args.keys, ...plotted, ...sigmaLimits(n, cl, { sigma: 0, floor: 0, ceiling: 1 }) };
  }

  const cl_mult: number = cl * (1 - cl);
  const val: readonly number[] = plotted.values;
  const sd: number[] = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    sd[i] = Math.sqrt(cl_mult / denominators[i]);
  }

  const consec_diff: number[] = new Array<number>(subset_points.length - 1);
  let prevZ: number = (val[subset_points[0]] - cl) / sd[subset_points[0]];
  for (let i = 1; i < subset_points.length; i++) {
    const currZ: number = (val[subset_points[i]] - cl) / sd[subset_points[i]];
    consec_diff[i - 1] = Math.abs(currZ - prevZ);
    prevZ = currZ;
  }

  const sigma_multiplier: number = averageMovingRange(consec_diff, args.outliers_in_limits) / 1.128;

  return {
    keys: args.keys,
    ...plotted,
    ...sigmaLimits(n, cl, { sigma: i => sd[i] * sigma_multiplier, floor: 0, ceiling: 1 })
  };
}
