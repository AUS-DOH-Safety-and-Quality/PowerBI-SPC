import { c4, c5 } from "powerbi-visuals-core/math";
import type { CalculatedLimits, controlLimitsArgs } from "../Classes/viewModelClass";

/** S chart: pooled-SD centreline with sigma = s * c5(n) / c4(n). */
export default function sLimits(args: Readonly<controlLimitsArgs>): CalculatedLimits {
  const group_sd: readonly number[] = args.numerators;
  const count_per_group: readonly number[] = args.denominators!;
  const n_sub: number = args.subset_points.length;

  let Nm1_sum: number = 0;
  let weighted_sd_sum: number = 0;
  for (let i = 0; i < n_sub; i++) {
    const curr_count: number = count_per_group[args.subset_points[i]];
    const curr_sd: number = group_sd[args.subset_points[i]];
    const Nm1: number = curr_count - 1;

    Nm1_sum += Nm1;
    weighted_sd_sum += Nm1 * Math.pow(curr_sd, 2);
  }
  const cl: number = Math.sqrt(weighted_sd_sum / Nm1_sum);

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

  for (let i = 0; i < n; i++) {
    const c5c4: number = (c5(count_per_group[i]) / c4(count_per_group[i]));
    const sigma: number = cl * c5c4;
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
