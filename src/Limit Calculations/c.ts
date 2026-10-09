import type { CalculatedLimits, controlLimitsArgs } from "../Classes/viewModelClass";

/** C chart: Poisson counts, so sigma = sqrt(mean). */
export default function cLimits(args: Readonly<controlLimitsArgs>): CalculatedLimits {
  const n_sub: number = args.subset_points.length;
  const numerators: readonly number[] = args.numerators;
  const subset_points: readonly number[] = args.subset_points;

  let cl: number = 0;
  for (let i = 0; i < n_sub; i++) {
    cl += numerators[subset_points[i]];
  }
  cl = cl / n_sub;

  const sigma: number = Math.sqrt(cl);

  const n: number = args.keys.length;
  const rtn = {
    keys: args.keys,
    values: args.numerators,
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
  const ll99: number = Math.max(0, cl - threeSigma);
  const ll95: number = Math.max(0, cl - twoSigma);
  const ll68: number = Math.max(0, cl - sigma);
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
