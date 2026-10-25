import { at } from "powerbi-visuals-core/util";
import type { CalculatedLimits, controlLimitsArgs } from "../Classes/viewModelClass";
import plottedValues from "../Functions/plottedValues";
import subsetMovingRanges from "../Functions/subsetMovingRanges";
import { median } from "powerbi-visuals-core/math";
import { sigmaLimits } from "powerbi-visuals-core/spc";

/** I chart with a median centreline; sigma = median moving range / 0.954 (Wheeler, median-range d4 for n = 2). */
export default function immLimits(args: Readonly<controlLimitsArgs>): CalculatedLimits {
  const plotted = plottedValues(args);
  const { subset, ranges: consec_diff } = subsetMovingRanges(plotted.values, args.subset_points);
  const cl: number = median(subset);
  let mmr: number = median(consec_diff);

  if (!args.outliers_in_limits) {
    // Median-range D4 = 3.865 for n = 2
    const consec_diff_ulim: number = mmr * 3.865;
    const valid_diffs: number[] = [];
    for (let i = 0; i < consec_diff.length; i++) {
      const diff = at(consec_diff, i);
      if (diff < consec_diff_ulim) {
        valid_diffs.push(diff);
      }
    }
    if (valid_diffs.length > 0) {
      mmr = median(valid_diffs);
    }
  }

  return {
    keys: args.keys,
    ...plotted,
    ...sigmaLimits(args.keys.length, cl, { sigma: mmr / 0.954 })
  };
}
