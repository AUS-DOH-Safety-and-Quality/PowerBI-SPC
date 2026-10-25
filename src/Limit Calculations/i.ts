import { at } from "powerbi-visuals-core/util";
import type { CalculatedLimits, controlLimitsArgs } from "../Classes/viewModelClass";
import averageMovingRange from "../Functions/averageMovingRange";
import plottedValues from "../Functions/plottedValues";
import { sigmaLimits } from "powerbi-visuals-core/spc";

/** Mean centreline and moving-range sigma (average moving range / d2, 1.128 for n = 2) over the subset */
export function iCentreAndSigma(values: readonly number[], subset_points: readonly number[],
                                outliers_in_limits: boolean | undefined): { cl: number; sigma: number } {
  const n_sub: number = subset_points.length;
  let prevVal: number = at(values, at(subset_points, 0));
  let cl: number = prevVal;
  const consec_diff: number[] = new Array<number>(n_sub - 1);
  for (let i = 1; i < n_sub; i++) {
    const currVal: number = at(values, at(subset_points, i));
    consec_diff[i - 1] = Math.abs(currVal - prevVal);
    cl += currVal;
    prevVal = currVal;
  }
  return { cl: cl / n_sub, sigma: averageMovingRange(consec_diff, outliers_in_limits) / 1.128 };
}

/** I (XmR) chart */
export default function iLimits(args: Readonly<controlLimitsArgs>): CalculatedLimits {
  const plotted = plottedValues(args);
  const { cl, sigma } = iCentreAndSigma(plotted.values, args.subset_points, args.outliers_in_limits);
  return {
    keys: args.keys,
    ...plotted,
    ...sigmaLimits(args.keys.length, cl, { sigma })
  };
}
