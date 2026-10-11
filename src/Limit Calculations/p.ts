import type { CalculatedLimits, controlLimitsArgs } from "../Classes/viewModelClass";

/** P chart: binomial sigma for each denominator, sqrt(p(1 - p) / n_i). */
export default function pLimits(args: Readonly<controlLimitsArgs>): CalculatedLimits {
  const numerators: readonly number[] = args.numerators;
  const denominators: readonly number[] = args.denominators!;
  const subset_points: readonly number[] = args.subset_points;
  const n_sub: number = subset_points.length;

  let sum_num: number = 0;
  let sum_den: number = 0;
  for (let i = 0; i < n_sub; i++) {
    sum_num += numerators[subset_points[i]];
    sum_den += denominators[subset_points[i]];
  }
  const cl: number = sum_num / sum_den;
  const cl_mult: number = cl * (1 - cl);

  const n: number = args.keys.length;
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
  }

  for (let i = 0; i < n; i++) {
    const sigma: number = Math.sqrt(cl_mult / denominators[i]);
    const twoSigma: number = 2 * sigma;
    const threeSigma: number = 3 * sigma;

    rtn.values[i] = numerators[i] / denominators[i];
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
