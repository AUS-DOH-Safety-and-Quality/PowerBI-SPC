import { subtract, add, divide, multiply, truncate, sqrt, rep, sum, extractValues } from "../Functions";
import { type controlLimitsObject, type controlLimitsArgs } from "../Classes";

export default function pLimits(args: controlLimitsArgs): controlLimitsObject {
  const cl: number = sum(extractValues(args.numerators, args.subset_points))
                      / sum(extractValues(args.denominators, args.subset_points));
  const sigma: number[] = sqrt(divide(cl * (1 - cl), args.denominators));

  return {
    keys: args.keys,
    values: divide(args.numerators, args.denominators),
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
