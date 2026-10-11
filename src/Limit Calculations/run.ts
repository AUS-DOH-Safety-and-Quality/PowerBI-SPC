import type { CalculatedLimits, controlLimitsArgs } from "../Classes/viewModelClass";
import plottedValues from "./plottedValues";
import { median } from "powerbi-visuals-core/math";

/** Run chart: median centreline and no control limits. */
export default function runLimits(args: Readonly<controlLimitsArgs>): CalculatedLimits {
  const plotted = plottedValues(args);
  const n_sub: number = args.subset_points.length;
  const subset_points: readonly number[] = args.subset_points;

  let ratio_subset: number[] = new Array<number>(n_sub);
  for (let i = 0; i < n_sub; i++) {
    ratio_subset[i] = plotted.values[subset_points[i]];
  }
  const cl: number = median(ratio_subset);

  const n: number = args.keys.length;
  const rtn = {
    keys: args.keys,
    values: plotted.values,
    numerators: plotted.numerators,
    denominators: plotted.denominators,
    targets: new Array<number>(n)
  }

  for (let i = 0; i < n; i++) {
    rtn.targets[i] = cl;
  }

  return rtn;
}
