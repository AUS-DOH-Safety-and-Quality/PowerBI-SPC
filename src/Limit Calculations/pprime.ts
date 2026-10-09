import type { CalculatedLimits, controlLimitsArgs } from "../Classes/viewModelClass";
import averageMovingRange from "./averageMovingRange";

/** Laney P' chart: binomial sigma scaled by the z-scores' average moving range / d2 (1.128 for n = 2). */
export default function pprimeLimits(args: Readonly<controlLimitsArgs>): CalculatedLimits {
  const n: number = args.keys.length;
  const numerators: readonly number[] = args.numerators;
  const denominators: readonly number[] = args.denominators!;
  const subset_points: readonly number[] = args.subset_points;
  const n_sub: number = subset_points.length;

  let sum_numerators: number = 0;
  let sum_denominators: number = 0;
  for (let i = 0; i < n_sub; i++) {
    let idx = subset_points[i];
    sum_numerators += numerators[idx];
    sum_denominators += denominators[idx];
  }
  const cl: number = sum_numerators / sum_denominators;

  if (cl === 0 || cl === 1) {
    const rtn = {
      keys: args.keys,
      values: new Array<number>(n),
      numerators: args.numerators,
      denominators: args.denominators,
      targets: new Array<number>(n),
      ll99: new Array<number>(n),
      ll95: new Array<number>(n),
      ll68: new Array<number>(n),
      ul68: new Array<number>(n),
      ul95: new Array<number>(n),
      ul99: new Array<number>(n)
    };
    for (let i = 0; i < n; i++) {
      rtn.values[i] = numerators[i] / denominators[i];
      rtn.targets[i] = cl;
      rtn.ll99[i] = cl;
      rtn.ll95[i] = cl;
      rtn.ll68[i] = cl;
      rtn.ul68[i] = cl;
      rtn.ul95[i] = cl;
      rtn.ul99[i] = cl;
    }
    return rtn;
  }

  const cl_mult: number = cl * (1 - cl);
  let val: number[] = new Array<number>(n);
  let sd: number[] = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    val[i] = numerators[i] / denominators[i];
    sd[i] = Math.sqrt(cl_mult / denominators[i]);
  }

  let consec_diff: number[] = new Array<number>(n_sub - 1);
  let prevZ: number = (val[subset_points[0]] - cl) / sd[subset_points[0]];
  for (let i = 1; i < n_sub; i++) {
    let currZ: number = (val[subset_points[i]] - cl) / sd[subset_points[i]];
    consec_diff[i - 1] = Math.abs(currZ - prevZ);
    prevZ = currZ;
  }

  const sigma_multiplier: number = averageMovingRange(consec_diff, args.outliers_in_limits) / 1.128;

  const rtn = {
    keys: args.keys,
    values: val,
    numerators: args.numerators,
    denominators: args.denominators,
    targets: new Array<number>(n),
    ll99: new Array<number>(n),
    ll95: new Array<number>(n),
    ll68: new Array<number>(n),
    ul68: new Array<number>(n),
    ul95: new Array<number>(n),
    ul99: new Array<number>(n)
  }

  for (let i = 0; i < n; i++) {
    const sigma: number = sd[i] * sigma_multiplier;
    const twoSigma: number = 2 * sigma;
    const threeSigma: number = 3 * sigma;

    rtn.targets[i] = cl;
    rtn.ll99[i] = Math.max(0, cl - threeSigma);
    rtn.ll95[i] = Math.max(0, cl - twoSigma);
    rtn.ll68[i] = Math.max(0, cl - sigma);
    rtn.ul68[i] = Math.min(1, cl + sigma);
    rtn.ul95[i] = Math.min(1, cl + twoSigma);
    rtn.ul99[i] = Math.min(1, cl + threeSigma);
  }

  return rtn;
}
