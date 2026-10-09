import type { CalculatedLimits, controlLimitsArgs } from "../Classes/viewModelClass";
import plottedValues from "./plottedValues";
import { median } from "powerbi-visuals-core/math";

/** I chart with a median centreline; sigma = median moving range / d2 (1.128 for n = 2). */
export default function immLimits(args: controlLimitsArgs): CalculatedLimits {
  const plotted = plottedValues(args);
  const n_sub: number = args.subset_points.length;
  const subset_points: readonly number[] = args.subset_points;

  let ratio_subset: number[] = new Array<number>(n_sub);
  for (let i = 0; i < n_sub; i++) {
    ratio_subset[i] = plotted.values[subset_points[i]];
  }
  const cl: number = median(ratio_subset);

  let consec_diff: number[] = new Array<number>(n_sub - 1);
  for (let i = 1; i < n_sub; i++) {
    consec_diff[i - 1] = Math.abs(ratio_subset[i] - ratio_subset[i - 1]);
  }
  let mmr: number = median(consec_diff);

  if (!args.outliers_in_limits) {
    // D4 = 3.267 for n = 2
    const consec_diff_ulim: number = mmr * 3.267;
    let valid_diffs: number[] = [];
    for (let i = 0; i < consec_diff.length; i++) {
      if (consec_diff[i] < consec_diff_ulim) {
        valid_diffs.push(consec_diff[i]);
      }
    }
    if (valid_diffs.length > 0) {
      mmr = median(valid_diffs);
    }
  }

  const sigma: number = mmr / 1.128;

  const n: number = args.keys.length;
  const rtn = {
    keys: args.keys,
    values: plotted.values,
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
