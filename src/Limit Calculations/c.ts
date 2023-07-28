import * as d3 from "../D3 Plotting Functions/D3 Modules";
import rep from "../Functions/rep";
import type dataClass from "../Classes/dataClass"
import controlLimitsClass from "../Classes/controlLimitsClass"
import type settingsClass from "../Classes/settingsClass";

export default function cLimits(inputData: dataClass, inputSettings: settingsClass): controlLimitsClass {
  const cl: number = d3.mean(inputData.numerators);
  const sigma: number = Math.sqrt(cl);

  return new controlLimitsClass({
    inputSettings: inputSettings,
    keys: inputData.keys,
    values: inputData.numerators,
    targets: rep(cl, inputData.keys.length),
    ll99: rep(Math.max(cl - 3 * sigma, 0), inputData.keys.length),
    ll95: rep(Math.max(cl - 2 * sigma, 0), inputData.keys.length),
    ul95: rep(cl + 2*sigma, inputData.keys.length),
    ul99: rep(cl + 3*sigma, inputData.keys.length),
  });
}
