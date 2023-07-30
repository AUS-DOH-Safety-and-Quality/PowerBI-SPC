import { sum } from "../D3 Plotting Functions/D3 Modules";
import { subtract, pow, multiply, b3, b4, sqrt } from "../Functions";
import { controlLimitsClass, type dataClass, type defaultSettingsType } from "../Classes";

export default function sLimits(inputData: dataClass, inputSettings: defaultSettingsType): controlLimitsClass {
  const group_sd: number[] = inputData.numerators;
  const count_per_group: number[] = inputData.denominators;

  // Per-group sample size minus 1
  const Nm1: number[] = subtract(count_per_group, 1);

  // Calculate weighted SD
  const cl: number = sqrt(sum(multiply(Nm1,pow(group_sd,2))) / sum(Nm1));

  // Sample-size dependent constant
  const B3: number[] = b3(count_per_group, false);
  const B395: number[] = b3(count_per_group, true);
  const B4: number[] = b4(count_per_group, false);
  const B495: number[] = b4(count_per_group, true);

  return new controlLimitsClass({
    inputSettings: inputSettings,
    keys: inputData.keys,
    values: group_sd,
    targets: cl,
    ll99: multiply(cl, B3),
    ll95: multiply(cl, B395),
    ul95: multiply(cl, B495),
    ul99: multiply(cl, B4)
  });
}

