import { mean } from "../D3 Plotting Functions/D3 Modules";
import truncate from "../Functions/truncate";
import controlLimitsClass from "../Classes/controlLimitsClass"
import type dataClass from "../Classes/dataClass"
import type settingsClass from "../Classes/settingsClass";

export default function cLimits(inputData: dataClass, inputSettings: settingsClass): controlLimitsClass {
  const cl: number = mean(inputData.numerators);
  const sigma: number = Math.sqrt(cl);

  return new controlLimitsClass({
    inputSettings: inputSettings,
    keys: inputData.keys,
    values: inputData.numerators,
    targets: cl,
    ll99: truncate(cl - 3 * sigma, { lower: 0 }),
    ll95: truncate(cl - 2 * sigma, { lower: 0 }),
    ul95: cl + 2*sigma,
    ul99: cl + 3*sigma,
  });
}
