import { at } from "powerbi-visuals-core/util";
import type { CalculatedLimits, controlLimitsArgs } from "../Classes/viewModelClass";
import plottedValues from "../Functions/plottedValues";
import { median, rep } from "powerbi-visuals-core/math";

/** Run chart: median centreline and no control limits. */
export default function runLimits(args: Readonly<controlLimitsArgs>): CalculatedLimits {
  const plotted = plottedValues(args);
  const n_sub: number = args.subset_points.length;
  const subset_points: readonly number[] = args.subset_points;

  const ratio_subset: number[] = new Array<number>(n_sub);
  for (let i = 0; i < n_sub; i++) {
    ratio_subset[i] = at(plotted.values, at(subset_points, i));
  }

  return {
    keys: args.keys,
    ...plotted,
    target: rep(median(ratio_subset), args.keys.length)
  };
}
