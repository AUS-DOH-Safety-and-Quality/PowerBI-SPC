import { mean } from "../D3 Plotting Functions/D3 Modules";
import { abs, diff, divide, rep } from "../Functions";
import { type controlLimitsObject, type controlLimitsArgs } from "../Classes";

export default function iLimits(args: controlLimitsArgs): controlLimitsObject {
  const useRatio: boolean = (args.denominators && args.denominators.length > 0);
  const ratio: number[] = useRatio
    ? divide(args.numerators, args.denominators)
    : args.numerators;

  const cl: number = mean(ratio);

  const consec_diff: number[] = abs(diff(ratio));
  const consec_diff_ulim: number = mean(consec_diff) * 3.267;
  const outliers_in_limits: boolean = args.outliers_in_limits;
  const consec_diff_valid: number[] = outliers_in_limits ? consec_diff : consec_diff.filter(d => d < consec_diff_ulim);

  const sigma: number = mean(consec_diff_valid) / 1.128;

  return {
    keys: args.keys,
    values: ratio.map(d => isNaN(d) ? 0 : d),
    numerators: useRatio ? args.numerators : undefined,
    denominators: useRatio ? args.denominators : undefined,
    targets: rep(cl, args.keys.length),
    ll99: rep(cl - 3 * sigma, args.keys.length),
    ll95: rep(cl - 2 * sigma, args.keys.length),
    ul95: rep(cl + 2 * sigma, args.keys.length),
    ul99: rep(cl + 3 * sigma, args.keys.length)
  };
}
