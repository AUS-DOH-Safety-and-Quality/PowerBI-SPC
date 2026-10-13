import type { CalculatedLimits, controlLimitsArgs } from "../Classes/viewModelClass";
import plottedValues from "../Functions/plottedValues";
import type { SigmaLimitSeries } from "powerbi-visuals-core/spc";

/** MR chart: upper limits are k/3 of D4 (3.267 for n = 2) times the mean moving range; lower limits are 0. */
export default function mrLimits(args: Readonly<controlLimitsArgs>): CalculatedLimits {
  const plotted = plottedValues(args);
  const values = plotted.values;
  const n_sub: number = args.subset_points.length;
  const n_mr: number = args.keys.length - 1;
  const subset_points: readonly number[] = args.subset_points;

  let cl: number = 0;
  for (let i = 1; i < n_sub; i++) {
    cl += Math.abs(values[subset_points[i]] - values[subset_points[i - 1]]);
  }
  cl /= (n_sub - 1);

  const sigma: number = 3.267 / 3;
  const ul68: number = cl * sigma;
  const ul95: number = cl * (2 * sigma);
  const ul99: number = cl * (3 * sigma);
  const ranges = new Array<number>(n_mr);
  const limits: SigmaLimitSeries = {
    target: new Array<number>(n_mr),
    ll99: new Array<number>(n_mr),
    ll95: new Array<number>(n_mr),
    ll68: new Array<number>(n_mr),
    ul68: new Array<number>(n_mr),
    ul95: new Array<number>(n_mr),
    ul99: new Array<number>(n_mr)
  };
  for (let i = 0; i < n_mr; i++) {
    ranges[i] = Math.abs(values[i + 1] - values[i]);
    limits.target[i] = cl;
    limits.ll99[i] = 0;
    limits.ll95[i] = 0;
    limits.ll68[i] = 0;
    limits.ul68[i] = ul68;
    limits.ul95[i] = ul95;
    limits.ul99[i] = ul99;
  }
  return {
    keys: args.keys.slice(1),
    values: ranges,
    numerators: plotted.numerators?.slice(1),
    denominators: plotted.denominators?.slice(1),
    ...limits
  };
}
