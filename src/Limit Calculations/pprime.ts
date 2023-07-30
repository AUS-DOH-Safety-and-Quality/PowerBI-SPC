import { sum, mean } from "../D3 Plotting Functions/D3 Modules";
import { subtract, add, divide, multiply, truncate, sqrt, abs, diff } from "../Functions";
import { controlLimitsClass, type dataClass, type defaultSettingsType } from "../Classes";

export default function pprimeLimits(inputData: dataClass, inputSettings: defaultSettingsType): controlLimitsClass {
  const val: number[] = divide(inputData.numerators, inputData.denominators);
  const cl: number = sum(inputData.numerators) / sum(inputData.denominators);
  const sd: number[] = sqrt(divide(cl * (1 - cl), inputData.denominators));
  const zscore: number[] = divide(subtract(val, cl), sd);

  const consec_diff: number[] = abs(diff(zscore));
  const consec_diff_ulim: number = mean(consec_diff) * 3.267;
  const outliers_in_limits: boolean = inputSettings.spc.outliers_in_limits;
  const consec_diff_valid: number[] = outliers_in_limits ? consec_diff : consec_diff.filter(d => d < consec_diff_ulim);
  const sigma: number[] = multiply(sd, mean(consec_diff_valid) / 1.128);

  return new controlLimitsClass({
    inputSettings: inputSettings,
    keys: inputData.keys,
    values: val,
    numerators: inputData.numerators,
    denominators: inputData.denominators,
    targets: cl,
    ll99: truncate(subtract(cl, multiply(3, sigma)), {lower: 0}),
    ll95: truncate(subtract(cl, multiply(2, sigma)), {lower: 0}),
    ul95: truncate(add(cl, multiply(2, sigma)), {upper: 1}),
    ul99: truncate(add(cl, multiply(3, sigma)), {upper: 1})
  });
}
