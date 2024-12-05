import { abs, diff, divide, rep, median, extractValues } from "../Functions";
import { type controlLimitsObject, type controlLimitsArgs } from "../Classes";

export default function imLimits(args: controlLimitsArgs): controlLimitsObject {
  const useRatio: boolean = (args.denominators && args.denominators.length > 0);
  const ratio: number[] = useRatio
    ? divide(args.numerators, args.denominators)
    : args.numerators;

  const ratio_subset: number[] = extractValues(ratio, args.subset_points);

  const cl: number = median(ratio_subset);

  const consec_diff: number[] = abs(diff(ratio_subset));
  const consec_diff_ulim: number = median(consec_diff) * 3.267;
  const outliers_in_limits: boolean = args.outliers_in_limits;
  const consec_diff_valid: number[] = outliers_in_limits ? consec_diff : consec_diff.filter(d => d < consec_diff_ulim);

  const sigma: number = median(consec_diff_valid) / 1.128;

  return {
    keys: args.keys,
    values: ratio.map(d => isNaN(d) ? 0 : d),
    numerators: useRatio ? args.numerators : undefined,
    denominators: useRatio ? args.denominators : undefined,
    targets: rep(cl, args.keys.length),
    ll99: rep(cl - 3 * sigma, args.keys.length),
    ll95: rep(cl - 2 * sigma, args.keys.length),
    ll68: rep(cl - 1 * sigma, args.keys.length),
    ul68: rep(cl + 1 * sigma, args.keys.length),
    ul95: rep(cl + 2 * sigma, args.keys.length),
    ul99: rep(cl + 3 * sigma, args.keys.length)
  };
}
