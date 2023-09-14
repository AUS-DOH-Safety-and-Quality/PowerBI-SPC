import { truncate, rep, mean } from "../Functions";
import { type controlLimitsObject, type controlLimitsArgs } from "../Classes";

export default function cLimits(args: controlLimitsArgs): controlLimitsObject {
  const cl: number = mean(args.numerators);
  const sigma: number = Math.sqrt(cl);

  return {
    keys: args.keys,
    values: args.numerators,
    targets: rep(cl, args.keys.length),
    ll99: rep(truncate(cl - 3 * sigma, { lower: 0 }), args.keys.length),
    ll95: rep(truncate(cl - 2 * sigma, { lower: 0 }), args.keys.length),
    ul95: rep(cl + 2*sigma, args.keys.length),
    ul99: rep(cl + 3*sigma, args.keys.length),
  };
}
