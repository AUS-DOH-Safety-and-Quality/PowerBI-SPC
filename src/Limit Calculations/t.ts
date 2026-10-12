import iLimits from "./i"
import type { CalculatedLimits, controlLimitsArgs } from "../Classes/viewModelClass";
import { rep } from "powerbi-visuals-core/math";

/** T chart: x^(1/3.6) makes exponential waiting times approximately normal; I chart limits are back-transformed. */
export default function tLimits(args: Readonly<controlLimitsArgs>): CalculatedLimits {
  const n: number = args.keys.length;

  let val: number[] = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    val[i] = Math.pow(args.numerators[i], 1 / 3.6);
  }

  const inputArgsCopy: Readonly<controlLimitsArgs> = {
    numerators: val,
    keys: args.keys,
    subset_points: args.subset_points,
    outliers_in_limits: args.outliers_in_limits
  };
  const limits = iLimits(inputArgsCopy);

  // I chart limits are constant, so back-transform the first
  const back = (value: number): number => Math.pow(value, 3.6);
  const backLower = (value: number): number => value < 0 ? 0 : back(value);
  return {
    keys: args.keys,
    values: args.numerators,
    target: rep(back(limits.target[0]), n),
    ll99: rep(backLower(limits.ll99[0]), n),
    ll95: rep(backLower(limits.ll95[0]), n),
    ll68: rep(backLower(limits.ll68[0]), n),
    ul68: rep(back(limits.ul68[0]), n),
    ul95: rep(back(limits.ul95[0]), n),
    ul99: rep(back(limits.ul99[0]), n)
  };
}
