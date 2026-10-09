import type { CalculatedLimits, controlLimitsArgs } from "../Classes/viewModelClass";

/** U chart: Poisson sigma for each denominator, sqrt(u / n_i). */
export default function uLimits(args: Readonly<controlLimitsArgs>): CalculatedLimits {
  const n: number = args.keys.length;
  const numerators: readonly number[] = args.numerators;
  const denominators: readonly number[] = args.denominators!;
  const subset_points: readonly number[] = args.subset_points;

  let sum_numerators: number = 0;
  let sum_denominators: number = 0;
  for (let i = 0; i < subset_points.length; i++) {
    let idx = subset_points[i];
    sum_numerators += numerators[idx];
    sum_denominators += denominators[idx];
  }
  const cl: number = sum_numerators / sum_denominators;

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
    rtn.values[i] = numerators[i] / denominators[i];

    const sigma: number = Math.sqrt(cl / denominators[i]);
    const twoSigma: number = 2 * sigma;
    const threeSigma: number = 3 * sigma;

    rtn.targets[i] = cl;
    rtn.ll99[i] = Math.max(0, cl - threeSigma);
    rtn.ll95[i] = Math.max(0, cl - twoSigma);
    rtn.ll68[i] = Math.max(0, cl - sigma);
    rtn.ul68[i] = cl + sigma;
    rtn.ul95[i] = cl + twoSigma;
    rtn.ul99[i] = cl + threeSigma;
  }

  return rtn;
}
