import { c4, c5 } from "powerbi-visuals-core/math";
import type { CalculatedLimits, controlLimitsArgs } from "../Classes/viewModelClass";
import withinGroupSd from "./withinGroupSd";

/** S chart: within-group SD centreline (withinGroupSd) with sigma = s * c5(n) / c4(n). */
export default function sLimits(args: Readonly<controlLimitsArgs>): CalculatedLimits {
  const group_sd: readonly number[] = args.numerators;
  const count_per_group: readonly number[] = args.denominators!;
  const cl: number = withinGroupSd(group_sd, count_per_group, args.subset_points);

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
