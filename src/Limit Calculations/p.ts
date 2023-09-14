import { sum } from "../D3 Plotting Functions/D3 Modules";
import { subtract, add, divide, multiply, truncate, sqrt, rep } from "../Functions";
import { type controlLimitsObject, type controlLimitsArgs } from "../Classes";

export default function pLimits(args: controlLimitsArgs): controlLimitsObject {
  const cl: number = sum(args.numerators) / sum(args.denominators);
  const sigma: number[] = sqrt(divide(cl * (1 - cl), args.denominators));

  return {
    keys: args.keys,
    values: divide(args.numerators, args.denominators),
    numerators: args.numerators,
    denominators: args.denominators,
    targets: rep(cl, args.keys.length),
    ll99: truncate(subtract(cl, multiply(3, sigma)), {lower: 0}),
    ll95: truncate(subtract(cl, multiply(2, sigma)), {lower: 0}),
    ul95: truncate(add(cl, multiply(2, sigma)), {upper: 1}),
    ul99: truncate(add(cl, multiply(3, sigma)), {upper: 1})
  };
}
