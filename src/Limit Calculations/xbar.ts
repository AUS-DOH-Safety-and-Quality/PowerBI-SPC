import { a3 } from "powerbi-visuals-core/math";
import type { CalculatedLimits, controlLimitsArgs } from "../Classes/viewModelClass";

/** X-bar chart (S method): size-weighted grand mean centreline with a pooled within-group SD. */
export default function xbarLimits(args: Readonly<controlLimitsArgs>): CalculatedLimits {
  const count_per_group: readonly number[] = args.denominators!;
  const group_means: readonly number[] = args.numerators;
  const group_sd: readonly number[] = args.xbar_sds!;
  const n_sub: number = args.subset_points.length;
  const subset_points: readonly number[] = args.subset_points;

  let Nm1_sum: number = 0;
  let weighted_sd_sum: number = 0;
  let weighted_mean_sum: number = 0;
  let total_count: number = 0;
  for (let i = 0; i < n_sub; i++) {
    const curr_count: number = count_per_group[subset_points[i]];
    const curr_mean: number = group_means[subset_points[i]];
    const curr_sd: number = group_sd[subset_points[i]];
    const Nm1: number = curr_count - 1;

    Nm1_sum += Nm1;
    weighted_sd_sum += Nm1 * Math.pow(curr_sd, 2);
    weighted_mean_sum += curr_count * curr_mean;
    total_count += curr_count;
  }
  const sd: number = Math.sqrt(weighted_sd_sum / Nm1_sum);
  const cl: number = weighted_mean_sum / total_count;

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
    ul99: new Array<number>(n),
    count: args.denominators
  }

  for (let i = 0; i < n; i++) {
    // A3 = 3 / (c4 * sqrt(n)), so A3 * sd / 3 is the standard error of the group mean
    const sigma: number = (a3(count_per_group[i]) * sd) / 3;
    const twoSigma: number = sigma * 2;
    const threeSigma: number = sigma * 3;

    rtn.targets[i] = cl;
    rtn.ll99[i] = cl - threeSigma;
    rtn.ll95[i] = cl - twoSigma;
    rtn.ll68[i] = cl - sigma;
    rtn.ul68[i] = cl + sigma;
    rtn.ul95[i] = cl + twoSigma;
    rtn.ul99[i] = cl + threeSigma;
  }

  return rtn;
}
