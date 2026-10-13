import { iCentreAndSigma } from "./i";
import type { CalculatedLimits, controlLimitsArgs } from "../Classes/viewModelClass";
import type { SigmaLimitSeries } from "powerbi-visuals-core/spc";

/** T chart: x^(1/3.6) makes exponential waiting times approximately normal; I chart limits are back-transformed. */
export default function tLimits(args: Readonly<controlLimitsArgs>): CalculatedLimits {
  const n: number = args.keys.length;
  const transformed: number[] = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    transformed[i] = Math.pow(args.numerators[i], 1 / 3.6);
  }
  const { cl, sigma } = iCentreAndSigma(transformed, args.subset_points, args.outliers_in_limits);

  const back = (value: number): number => Math.pow(value, 3.6);
  const backLower = (value: number): number => value < 0 ? 0 : back(value);
  const target: number = back(cl);
  const ll99: number = backLower(cl - 3 * sigma);
  const ll95: number = backLower(cl - 2 * sigma);
  const ll68: number = backLower(cl - sigma);
  const ul68: number = back(cl + sigma);
  const ul95: number = back(cl + 2 * sigma);
  const ul99: number = back(cl + 3 * sigma);
  const limits: SigmaLimitSeries = {
    target: new Array<number>(n),
    ll99: new Array<number>(n),
    ll95: new Array<number>(n),
    ll68: new Array<number>(n),
    ul68: new Array<number>(n),
    ul95: new Array<number>(n),
    ul99: new Array<number>(n)
  };
  for (let i = 0; i < n; i++) {
    limits.target[i] = target;
    limits.ll99[i] = ll99;
    limits.ll95[i] = ll95;
    limits.ll68[i] = ll68;
    limits.ul68[i] = ul68;
    limits.ul95[i] = ul95;
    limits.ul99[i] = ul99;
  }
  return { keys: args.keys, values: args.numerators, ...limits };
}
