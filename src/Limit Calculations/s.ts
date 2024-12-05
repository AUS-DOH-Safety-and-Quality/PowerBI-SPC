import { subtract, pow, multiply, b3, b4, sqrt, rep, sum, extractValues } from "../Functions";
import { type controlLimitsObject, type controlLimitsArgs } from "../Classes";

export default function sLimits(args: controlLimitsArgs): controlLimitsObject {
  const group_sd: number[] = args.numerators;
  const count_per_group: number[] = args.denominators;

  // Per-group sample size minus 1
  const Nm1: number[] = subtract(extractValues(count_per_group, args.subset_points), 1);

  // Calculate weighted SD
  const cl: number = sqrt(sum(multiply(Nm1,pow(extractValues(group_sd, args.subset_points),2))) / sum(Nm1));

  return {
    keys: args.keys,
    values: group_sd,
    targets: rep(cl, args.keys.length),
    ll99: multiply(cl, b3(count_per_group, 3)),
    ll95: multiply(cl, b3(count_per_group, 2)),
    ll68: multiply(cl, b3(count_per_group, 1)),
    ul68: multiply(cl, b4(count_per_group, 1)),
    ul95: multiply(cl, b4(count_per_group, 2)),
    ul99: multiply(cl, b4(count_per_group, 3))
  };
}
