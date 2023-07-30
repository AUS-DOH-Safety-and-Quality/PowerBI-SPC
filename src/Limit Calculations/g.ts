import { mean, median } from "../D3 Plotting Functions/D3 Modules";
import { sqrt } from "../Functions";
import { controlLimitsClass, type dataClass, type defaultSettingsType } from "../Classes";

export default function gLimits(inputData: dataClass, inputSettings: defaultSettingsType): controlLimitsClass {
  const cl: number = mean(inputData.numerators);
  const sigma: number = sqrt(cl * (cl + 1));

  return new controlLimitsClass({
    inputSettings: inputSettings,
    keys: inputData.keys,
    values: inputData.numerators,
    targets: median(inputData.numerators),
    ll99: 0,
    ll95: 0,
    ul95: cl + 2*sigma,
    ul99: cl + 3*sigma
  });
}
