import type { CalculatedLimits, controlLimitsArgs } from "../Classes/viewModelClass";
import averageMovingRange from "../Functions/averageMovingRange";
import plottedValues from "../Functions/plottedValues";
import subsetMovingRanges from "../Functions/subsetMovingRanges";
import { median } from "powerbi-visuals-core/math";
import { sigmaLimits } from "powerbi-visuals-core/spc";

/** I chart with a median centreline; sigma = average moving range / d2 (1.128 for n = 2). */
export default function imLimits(args: Readonly<controlLimitsArgs>): CalculatedLimits {
  const plotted = plottedValues(args);
  const { subset, ranges: consec_diff } = subsetMovingRanges(plotted.values, args.subset_points);
  const cl: number = median(subset);

  const sigma: number = averageMovingRange(consec_diff, args.outliers_in_limits) / 1.128;

  return {
    keys: args.keys,
    ...plotted,
    ...sigmaLimits(args.keys.length, cl, { sigma })
  };
}
