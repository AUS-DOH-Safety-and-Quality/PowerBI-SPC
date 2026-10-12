import type { CalculatedLimits, controlLimitsArgs } from "../Classes/viewModelClass";
import plottedValues from "../Functions/plottedValues";
import subsetRatio from "../Functions/subsetRatio";
import { sigmaLimits } from "powerbi-visuals-core/spc";

/** U chart: Poisson sigma for each denominator, sqrt(u / n_i). */
export default function uLimits(args: Readonly<controlLimitsArgs>): CalculatedLimits {
  const denominators: readonly number[] = args.denominators!;
  const cl: number = subsetRatio(args.numerators, denominators, args.subset_points);

  return {
    keys: args.keys,
    ...plottedValues(args),
    ...sigmaLimits(args.keys.length, cl, { sigma: i => Math.sqrt(cl / denominators[i]), floor: 0 })
  };
}
