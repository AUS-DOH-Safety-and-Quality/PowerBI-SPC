import type { CalculatedLimits, denominatorLimitsArgs } from "../Classes/viewModelClass";
import plottedValues from "../Functions/plottedValues";
import subsetRatio from "../Functions/subsetRatio";
import { sigmaLimits } from "powerbi-visuals-core/spc";

/** P chart: binomial sigma for each denominator, sqrt(p(1 - p) / n_i). */
export default function pLimits(args: Readonly<denominatorLimitsArgs>): CalculatedLimits {
  const denominators: readonly number[] = args.denominators;
  const cl: number = subsetRatio(args.numerators, denominators, args.subset_points);
  const cl_mult: number = cl * (1 - cl);

  return {
    keys: args.keys,
    ...plottedValues(args),
    ...sigmaLimits(args.keys.length, cl, { sigma: i => Math.sqrt(cl_mult / denominators[i]), floor: 0, ceiling: 1 })
  };
}
