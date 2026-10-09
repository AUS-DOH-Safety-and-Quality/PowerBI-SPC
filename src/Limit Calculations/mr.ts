import type { CalculatedLimits, controlLimitsArgs } from "../Classes/viewModelClass";
import plottedValues from "./plottedValues";

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
  const rtn = {
    keys: args.keys.slice(1),
    values: new Array<number>(n_mr),
    numerators: plotted.numerators?.slice(1),
    denominators: plotted.denominators?.slice(1),
    targets: new Array<number>(n_mr),
    ll99: new Array<number>(n_mr),
    ll95: new Array<number>(n_mr),
    ll68: new Array<number>(n_mr),
    ul68: new Array<number>(n_mr),
    ul95: new Array<number>(n_mr),
    ul99: new Array<number>(n_mr)
  }

  const sigma: number = 3.267 / 3;
  const twoSigma: number = 2 * sigma;
  const threeSigma: number = 3 * sigma;
  const ul68: number = cl * sigma;
  const ul95: number = cl * twoSigma;
  const ul99: number = cl * threeSigma;

  for (let i = 0; i < n_mr; i++) {
    rtn.values[i] = Math.abs(values[i + 1] - values[i]);
    rtn.targets[i] = cl;
    rtn.ll99[i] = 0;
    rtn.ll95[i] = 0;
    rtn.ll68[i] = 0;
    rtn.ul68[i] = ul68;
    rtn.ul95[i] = ul95;
    rtn.ul99[i] = ul99;
  }

  return rtn;
}
