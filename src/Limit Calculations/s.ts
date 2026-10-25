import { at } from "powerbi-visuals-core/util";
import { c4, c5 } from "powerbi-visuals-core/math";
import { sigmaLimits } from "powerbi-visuals-core/spc";
import type { CalculatedLimits, denominatorLimitsArgs } from "../Classes/viewModelClass";
import withinGroupSd from "../Functions/withinGroupSd";

/** S chart: within-group SD centreline (withinGroupSd) with sigma = s * c5(n) / c4(n). */
export default function sLimits(args: Readonly<denominatorLimitsArgs>): CalculatedLimits {
  const group_sd: readonly number[] = args.numerators;
  const count_per_group: readonly number[] = args.denominators;
  const cl: number = withinGroupSd(group_sd, count_per_group, args.subset_points);

  return {
    keys: args.keys,
    values: args.numerators,
    denominators: args.denominators,
    ...sigmaLimits(args.keys.length, cl, {
      sigma: i => {
        const count = at(count_per_group, i);
        return cl * (c5(count) / c4(count));
      },
      floor: 0
    })
  };
}
