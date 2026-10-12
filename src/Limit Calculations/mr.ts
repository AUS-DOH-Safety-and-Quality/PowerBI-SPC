import type { CalculatedLimits, controlLimitsArgs } from "../Classes/viewModelClass";
import plottedValues from "../Functions/plottedValues";
import { rep } from "powerbi-visuals-core/math";

/** MR chart: upper limits are k/3 of D4 (3.267 for n = 2) times the mean moving range; lower limits are 0. */
export default function mrLimits(args: Readonly<controlLimitsArgs>): CalculatedLimits {
  const plotted = plottedValues(args);
  const values = plotted.values;
  const n_sub: number = args.subset_points.length;
  const n: number = args.keys.length;
  const subset_points: readonly number[] = args.subset_points;

  let cl: number = 0;
  for (let i = 1; i < n_sub; i++) {
    cl += Math.abs(values[subset_points[i]] - values[subset_points[i - 1]]);
  }
  cl /= (n_sub - 1);

  const n_mr: number = n - 1;
  const ranges = new Array<number>(n_mr);
  for (let i = 0; i < n_mr; i++) {
    ranges[i] = Math.abs(values[i + 1] - values[i]);
  }

  const sigma: number = 3.267 / 3;
  return {
    keys: args.keys.slice(1),
    values: ranges,
    numerators: plotted.numerators?.slice(1),
    denominators: plotted.denominators?.slice(1),
    target: rep(cl, n_mr),
    ll99: rep(0, n_mr),
    ll95: rep(0, n_mr),
    ll68: rep(0, n_mr),
    ul68: rep(cl * sigma, n_mr),
    ul95: rep(cl * (2 * sigma), n_mr),
    ul99: rep(cl * (3 * sigma), n_mr)
  };
}
