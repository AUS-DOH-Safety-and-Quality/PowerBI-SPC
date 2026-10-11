import type { CalculatedLimits, controlLimitsArgs } from "../Classes/viewModelClass";
import { median } from "powerbi-visuals-core/math";

/**
 * G chart: geometric counts, so sigma = sqrt(mean * (mean + 1)); lower limits are 0.
 * Limits use the mean but the centreline shows the median.
 */
export default function gLimits(args: Readonly<controlLimitsArgs>): CalculatedLimits {
  const numerators: readonly number[] = args.numerators;
  const subset_points: readonly number[] = args.subset_points;
  const n_sub: number = subset_points.length;

  let numerator_subset: number[] = new Array<number>(n_sub);
  let cl: number = 0;
  for (let i = 0; i < n_sub; i++) {
    const curr_numerator: number = numerators[subset_points[i]];
    numerator_subset[i] = curr_numerator;
    cl += curr_numerator;
  }
  cl /= n_sub;

  const median_val: number = median(numerator_subset);
  const sigma: number = Math.sqrt(cl * (cl + 1));

  const n: number = args.keys.length;
  const rtn = {
    keys: args.keys,
    values: args.numerators,
    targets: new Array<number>(n),
    ll99: new Array<number>(n),
    ll95: new Array<number>(n),
    ll68: new Array<number>(n),
    ul68: new Array<number>(n),
    ul95: new Array<number>(n),
    ul99: new Array<number>(n)
  }

  const ul68: number = cl + sigma;
  const ul95: number = cl + 2 * sigma;
  const ul99: number = cl + 3 * sigma;

  for (let i = 0; i < n; i++) {
    rtn.targets[i] = median_val;
    rtn.ll68[i] = 0;
    rtn.ll95[i] = 0;
    rtn.ll99[i] = 0;
    rtn.ul68[i] = ul68;
    rtn.ul95[i] = ul95;
    rtn.ul99[i] = ul99;
  }

  return rtn;
}
