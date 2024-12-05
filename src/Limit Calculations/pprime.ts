import { subtract, add, divide, multiply, truncate, sqrt, abs, diff, rep, sum, mean, extractValues } from "../Functions";
import { type controlLimitsObject, type controlLimitsArgs } from "../Classes";

export default function pprimeLimits(args: controlLimitsArgs): controlLimitsObject {
  const val: number[] = divide(args.numerators, args.denominators);
  const cl: number = sum(extractValues(args.numerators, args.subset_points))
                      / sum(extractValues(args.denominators, args.subset_points));
  const sd: number[] = sqrt(divide(cl * (1 - cl), args.denominators));
  const zscore: number[] = extractValues(divide(subtract(val, cl), sd), args.subset_points);

  const consec_diff: number[] = abs(diff(zscore));
  const consec_diff_ulim: number = mean(consec_diff) * 3.267;
  const outliers_in_limits: boolean = args.outliers_in_limits;
  const consec_diff_valid: number[] = outliers_in_limits ? consec_diff : consec_diff.filter(d => d < consec_diff_ulim);
  const sigma: number[] = multiply(sd, mean(consec_diff_valid) / 1.128);

  return {
    keys: args.keys,
    values: val,
    numerators: args.numerators,
    denominators: args.denominators,
    targets: rep(cl, args.keys.length),
    ll99: truncate(subtract(cl, multiply(3, sigma)), {lower: 0}),
    ll95: truncate(subtract(cl, multiply(2, sigma)), {lower: 0}),
    ll68: truncate(subtract(cl, multiply(1, sigma)), {lower: 0}),
    ul68: truncate(add(cl, multiply(1, sigma)), {upper: 1}),
    ul95: truncate(add(cl, multiply(2, sigma)), {upper: 1}),
    ul99: truncate(add(cl, multiply(3, sigma)), {upper: 1})
  };
}
