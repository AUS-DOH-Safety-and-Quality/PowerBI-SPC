import type { CalculatedLimits, controlLimitsArgs } from "../Classes/viewModelClass";
import { median } from "powerbi-visuals-core/math";
import { sigmaLimits } from "powerbi-visuals-core/spc";

/**
 * G chart: geometric counts, so sigma = sqrt(mean * (mean + 1)); lower limits are 0.
 * Limits use the mean but the centreline shows the median.
 */
export default function gLimits(args: Readonly<controlLimitsArgs>): CalculatedLimits {
  const numerators: readonly number[] = args.numerators;
  const subset_points: readonly number[] = args.subset_points;
  const n_sub: number = subset_points.length;

  const numerator_subset: number[] = new Array<number>(n_sub);
  let cl: number = 0;
  for (let i = 0; i < n_sub; i++) {
    const curr_numerator: number = numerators[subset_points[i]];
    numerator_subset[i] = curr_numerator;
    cl += curr_numerator;
  }
  cl /= n_sub;

  return {
    keys: args.keys,
    values: args.numerators,
    ...sigmaLimits(args.keys.length, cl, { sigma: Math.sqrt(cl * (cl + 1)), target: median(numerator_subset), floor: 0 })
  };
}
