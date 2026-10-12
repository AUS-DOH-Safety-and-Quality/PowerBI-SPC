import type { CalculatedLimits, controlLimitsArgs } from "../Classes/viewModelClass";
import averageMovingRange from "../Functions/averageMovingRange";
import plottedValues from "../Functions/plottedValues";
import { sigmaLimits, type SigmaLimitSeries } from "powerbi-visuals-core/spc";

/** I (XmR) chart: sigma = average moving range / d2 (1.128 for n = 2); every limit series is present, as the T chart relies on */
export default function iLimits(args: Readonly<controlLimitsArgs>): CalculatedLimits & SigmaLimitSeries {
  const plotted = plottedValues(args);
  const values = plotted.values;
  const n_sub: number = args.subset_points.length;
  const subset_points: readonly number[] = args.subset_points;

  let prevVal: number = values[subset_points[0]];
  let cl: number = prevVal;
  let consec_diff: number[] = new Array<number>(n_sub - 1);
  for (let i = 1; i < n_sub; i++) {
    let currVal: number = values[subset_points[i]];
    consec_diff[i - 1] = Math.abs(currVal - prevVal);
    cl += currVal;
    prevVal = currVal;
  }
  cl /= n_sub;

  const sigma: number = averageMovingRange(consec_diff, args.outliers_in_limits) / 1.128;

  return {
    keys: args.keys,
    ...plotted,
    ...sigmaLimits(args.keys.length, cl, { sigma })
  };
}
