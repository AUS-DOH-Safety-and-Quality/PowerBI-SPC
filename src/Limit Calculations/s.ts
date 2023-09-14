import { sum } from "../D3 Plotting Functions/D3 Modules";
import { subtract, pow, multiply, b3, b4, sqrt, rep } from "../Functions";
import { type controlLimitsObject, type controlLimitsArgs } from "../Classes";

export default function sLimits(args: controlLimitsArgs): controlLimitsObject {
  const group_sd: number[] = args.numerators;
  const count_per_group: number[] = args.denominators;

  // Per-group sample size minus 1
  const Nm1: number[] = subtract(count_per_group, 1);

  // Calculate weighted SD
  const cl: number = sqrt(sum(multiply(Nm1,pow(group_sd,2))) / sum(Nm1));

  // Sample-size dependent constant
  const B3: number[] = b3(count_per_group, false);
  const B395: number[] = b3(count_per_group, true);
  const B4: number[] = b4(count_per_group, false);
  const B495: number[] = b4(count_per_group, true);

  return {
    keys: args.keys,
    values: group_sd,
    targets: rep(cl, args.keys.length),
    ll99: multiply(cl, B3),
    ll95: multiply(cl, B395),
    ul95: multiply(cl, B495),
    ul99: multiply(cl, B4)
  };
}
