import type { CalculatedLimits, controlLimitsArgs } from "../Classes/viewModelClass";
import { sigmaLimits } from "powerbi-visuals-core/spc";

/** C chart: Poisson counts, so sigma = sqrt(mean). */
export default function cLimits(args: Readonly<controlLimitsArgs>): CalculatedLimits {
  const n_sub: number = args.subset_points.length;
  const numerators: readonly number[] = args.numerators;
  const subset_points: readonly number[] = args.subset_points;

  let cl: number = 0;
  for (let i = 0; i < n_sub; i++) {
    cl += numerators[subset_points[i]];
  }
  cl = cl / n_sub;

  return {
    keys: args.keys,
    values: args.numerators,
    ...sigmaLimits(args.keys.length, cl, { sigma: Math.sqrt(cl), floor: 0 })
  };
}
