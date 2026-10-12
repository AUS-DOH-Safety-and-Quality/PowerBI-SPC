import { a3 } from "powerbi-visuals-core/math";
import { sigmaLimits } from "powerbi-visuals-core/spc";
import type { CalculatedLimits, controlLimitsArgs } from "../Classes/viewModelClass";
import withinGroupSd from "../Functions/withinGroupSd";

/** X-bar chart (S method): size-weighted grand mean centreline; within-group SD per withinGroupSd. */
export default function xbarLimits(args: Readonly<controlLimitsArgs>): CalculatedLimits {
  const count_per_group: readonly number[] = args.denominators!;
  const group_means: readonly number[] = args.numerators;
  const group_sd: readonly number[] = args.xbar_sds!;
  const n_sub: number = args.subset_points.length;
  const subset_points: readonly number[] = args.subset_points;

  let weighted_mean_sum: number = 0;
  let total_count: number = 0;
  for (let i = 0; i < n_sub; i++) {
    const curr_count: number = count_per_group[subset_points[i]];
    weighted_mean_sum += curr_count * group_means[subset_points[i]];
    total_count += curr_count;
  }
  const sd: number = withinGroupSd(group_sd, count_per_group, subset_points);
  const cl: number = weighted_mean_sum / total_count;

  return {
    keys: args.keys,
    values: args.numerators,
    // A3 = 3 / (c4 * sqrt(n)), so A3 * sd / 3 is the standard error of the group mean
    ...sigmaLimits(args.keys.length, cl, { sigma: i => (a3(count_per_group[i]) * sd) / 3 }),
    count: args.denominators
  };
}
