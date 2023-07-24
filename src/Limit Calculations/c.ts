import * as d3 from "d3";
import rep from "../Functions/rep";
import dataClass from "../Classes/dataClass"
import controlLimitsClass from "../Classes/controlLimitsClass"
import { LimitArgs } from "../Classes/viewModelClass";

export default function cLimits(args: LimitArgs): controlLimitsClass {
  const inputData: dataClass = args.inputData;
  const cl: number = d3.mean(inputData.numerators);
  const sigma: number = Math.sqrt(cl);

  return new controlLimitsClass({
    inputSettings: args.inputSettings,
    keys: inputData.keys,
    values: inputData.numerators,
    targets: rep(cl, inputData.keys.length),
    ll99: rep(Math.max(cl - 3 * sigma, 0), inputData.keys.length),
    ll95: rep(Math.max(cl - 2 * sigma, 0), inputData.keys.length),
    ul95: rep(cl + 2*sigma, inputData.keys.length),
    ul99: rep(cl + 3*sigma, inputData.keys.length),
  });
}
