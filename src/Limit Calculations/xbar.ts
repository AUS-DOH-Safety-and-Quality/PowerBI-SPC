import { subtract, add, multiply, divide, sqrt, square, a3, rep, sum, extractValues } from "../Functions";
import { type controlLimitsObject, type controlLimitsArgs } from "../Classes";

export default function xbarLimits(args: controlLimitsArgs): controlLimitsObject {
  // Calculate number of observations in each group
  const count_per_group: number[] = args.denominators;
  const count_per_group_sub: number[] = extractValues(count_per_group, args.subset_points);

  // Calculate the mean for each group
  const group_means: number[] = args.numerators;
  const group_means_sub: number[] = extractValues(group_means, args.subset_points);

  // Calculate the SD for each group
  const group_sd: number[] = args.xbar_sds;
  const group_sd_sub: number[] = extractValues(group_sd, args.subset_points);

  // Calculate weighted SD
  const Nm1: number[] = subtract(count_per_group_sub, 1);
  const sd: number = sqrt(sum(multiply(Nm1,square(group_sd_sub))) / sum(Nm1));

  // Calculated weighted mean (for centreline)
  const cl: number = sum(multiply(count_per_group_sub, group_means_sub)) / sum(count_per_group_sub);

  // Sample-size dependent constant
  const A3: number[] = a3(count_per_group);

  return {
    keys: args.keys,
    values: group_means,
    targets: rep(cl, args.keys.length),
    ll99: subtract(cl, multiply(A3, sd)),
    ll95: subtract(cl, multiply(multiply(divide(A3, 3), 2), sd)),
    ll68: subtract(cl, multiply(divide(A3, 3), sd)),
    ul68: add(cl, multiply(divide(A3, 3), sd)),
    ul95: add(cl, multiply(multiply(divide(A3, 3), 2), sd)),
    ul99: add(cl, multiply(A3, sd)),
    count: count_per_group
  }
}
