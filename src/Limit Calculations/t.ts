import iLimits from "./i"
import type { CalculatedLimits, controlLimitsArgs } from "../Classes/viewModelClass";

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
  const cl: number = Math.pow(limits.targets[0], 3.6);
  const ll99: number = limits.ll99[0] < 0 ? 0 : Math.pow(limits.ll99[0], 3.6);
  const ll95: number = limits.ll95[0] < 0 ? 0 : Math.pow(limits.ll95[0], 3.6);
  const ll68: number = limits.ll68[0] < 0 ? 0 : Math.pow(limits.ll68[0], 3.6);
  const ul68: number = Math.pow(limits.ul68[0], 3.6);
  const ul95: number = Math.pow(limits.ul95[0], 3.6);
  const ul99: number = Math.pow(limits.ul99[0], 3.6);

  const rtn = {
    keys: args.keys,
    values: args.numerators,
    targets: new Array<number>(n),
    ll99: new Array<number>(n),
    ll95: new Array<number>(n),
    ll68: new Array<number>(n),
    ul68: new Array<number>(n),
    ul95: new Array<number>(n),
    ul99: new Array<number>(n)
  }

  for (let i = 0; i < n; i++) {
    rtn.targets[i] = cl;
    rtn.ll99[i] = ll99;
    rtn.ll95[i] = ll95;
    rtn.ll68[i] = ll68;
    rtn.ul68[i] = ul68;
    rtn.ul95[i] = ul95;
    rtn.ul99[i] = ul99;
  }
  return rtn;
}
