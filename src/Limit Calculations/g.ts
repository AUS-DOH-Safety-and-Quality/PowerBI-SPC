import { mean, median } from "../D3 Plotting Functions/D3 Modules";
import { sqrt, rep } from "../Functions";
import { type controlLimitsObject, type controlLimitsArgs } from "../Classes";

export default function gLimits(args: controlLimitsArgs): controlLimitsObject {
  const cl: number = mean(args.numerators);
  const sigma: number = sqrt(cl * (cl + 1));

  return {
    keys: args.keys,
    values: args.numerators,
    targets: rep(median(args.numerators), args.keys.length),
    ll99: rep(0, args.keys.length),
    ll95: rep(0, args.keys.length),
    ul95: rep(cl + 2*sigma, args.keys.length),
    ul99: rep(cl + 3*sigma, args.keys.length)
  };
}
