import type { controlLimitsArgs } from "../Classes/viewModelClass";
import averageMovingRange from "./averageMovingRange";
import plottedValues from "./plottedValues";

/** I (XmR) chart: sigma = average moving range / d2 (1.128 for n = 2). */
export default function iLimits(args: Readonly<controlLimitsArgs>) {
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

  const n: number = args.keys.length;
  const rtn = {
    keys: args.keys,
    values,
    numerators: plotted.numerators,
    denominators: plotted.denominators,
    targets: new Array<number>(n),
    ll99: new Array<number>(n),
    ll95: new Array<number>(n),
    ll68: new Array<number>(n),
    ul68: new Array<number>(n),
    ul95: new Array<number>(n),
    ul99: new Array<number>(n)
  }

  const twoSigma: number = 2 * sigma;
  const threeSigma: number = 3 * sigma;
  const ll99: number = cl - threeSigma;
  const ll95: number = cl - twoSigma;
  const ll68: number = cl - sigma;
  const ul68: number = cl + sigma;
  const ul95: number = cl + twoSigma;
  const ul99: number = cl + threeSigma;

  for (let i = 0; i < n; i++) {
    rtn.targets[i] = cl;
    rtn.ll99[i] = ll99;
    rtn.ll95[i] = ll95;
    rtn.ll68[i] = ll68;
    rtn.ul68[i] = ul68;
    rtn.ul95[i] = ul95;
    rtn.ul99[i] = ul99;
  }

  return rtn;
}
