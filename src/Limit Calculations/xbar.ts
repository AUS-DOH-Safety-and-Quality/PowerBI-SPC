import { sum } from "../D3 Plotting Functions/D3 Modules";
import { subtract, add, multiply, divide, sqrt, square, a3 } from "../Functions";
import { controlLimitsClass, type dataClass, type settingsClass } from "../Classes";

export default function xbarLimits(inputData: dataClass, inputSettings: settingsClass): controlLimitsClass {
  // Calculate number of observations in each group
  const count_per_group: number[] = inputData.denominators;

  // Calculate the mean for each group
  const group_means: number[] = inputData.numerators;

  // Calculate the SD for each group
  const group_sd: number[] = inputData.xbar_sds;

  // Calculate weighted SD
  const Nm1: number[] = subtract(count_per_group, 1);
  const sd: number = sqrt(sum(multiply(Nm1,square(group_sd))) / sum(Nm1));

  // Calculated weighted mean (for centreline)
  const cl: number = sum(multiply(count_per_group, group_means)) / sum(count_per_group);

  // Sample-size dependent constant
  const A3: number[] = a3(count_per_group);

  return new controlLimitsClass({
    inputSettings: inputSettings,
    keys: inputData.keys,
    values: group_means,
    targets: cl,
    ll99: subtract(cl, multiply(A3, sd)),
    ll95: subtract(cl, multiply(multiply(divide(A3, 3), 2), sd)),
    ul95: add(cl, multiply(multiply(divide(A3, 3), 2), sd)),
    ul99: add(cl, multiply(A3, sd)),
    count: count_per_group
  })
}
