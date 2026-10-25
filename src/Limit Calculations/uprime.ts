import { at } from "powerbi-visuals-core/util";
import type { CalculatedLimits, denominatorLimitsArgs } from "../Classes/viewModelClass";
import laneySigmaMultiplier from "../Functions/laneySigmaMultiplier";
import plottedValues from "../Functions/plottedValues";
import subsetRatio from "../Functions/subsetRatio";
import { sigmaLimits } from "powerbi-visuals-core/spc";

/** Laney U' chart: Poisson sigma scaled by the z-scores' average moving range / d2 (1.128 for n = 2). */
export default function uprimeLimits(args: Readonly<denominatorLimitsArgs>): CalculatedLimits {
  const n: number = args.keys.length;
  const denominators: readonly number[] = args.denominators;
  const subset_points: readonly number[] = args.subset_points;
  const cl: number = subsetRatio(args.numerators, denominators, subset_points);
  const plotted = plottedValues(args);

  // Every rate equals the centreline, so the z-scores are undefined
  if (cl === 0) {
    return { keys: args.keys, ...plotted, ...sigmaLimits(n, cl, { sigma: 0, floor: 0 }) };
  }

  const sd: number[] = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    sd[i] = Math.sqrt(cl / at(denominators, i));
  }
  const sigma_multiplier: number = laneySigmaMultiplier(plotted.values, cl, sd, subset_points, args.outliers_in_limits);

  return {
    keys: args.keys,
    ...plotted,
    ...sigmaLimits(n, cl, { sigma: i => at(sd, i) * sigma_multiplier, floor: 0 })
  };
}
