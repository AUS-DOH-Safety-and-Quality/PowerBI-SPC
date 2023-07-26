import * as d3 from "../D3 Plotting Functions/D3 Modules";
import diff from "../Functions/diff"
import rep from "../Functions/rep";
import { abs } from "../Functions/UnaryFunctions"
import {  divide } from "../Functions/BinaryFunctions";
import dataClass from "../Classes/dataClass";
import controlLimitsClass from "../Classes/controlLimitsClass";
import { LimitArgs } from "../Classes/viewModelClass";

export default function mrLimits(args: LimitArgs): controlLimitsClass {
  const inputData: dataClass = args.inputData;
  const useRatio: boolean = (inputData.denominators && inputData.denominators.length > 0);
  const ratio: number[] = useRatio
    ? divide(inputData.numerators, inputData.denominators)
    : inputData.numerators;

  const consec_diff: number[] = abs(diff(ratio));
  const cl: number = d3.mean(consec_diff);

  return new controlLimitsClass({
    inputSettings: args.inputSettings,
    keys: inputData.keys,
    values: consec_diff,
    numerators: useRatio ? inputData.numerators : null,
    denominators: useRatio ? inputData.denominators : null,
    targets: rep(cl, inputData.keys.length),
    ll99: rep(0, inputData.keys.length),
    ll95: rep(0, inputData.keys.length),
    ul95: rep((3.267 / 3) * 2 * cl, inputData.keys.length),
    ul99: rep(3.267 * cl, inputData.keys.length)
  });
}
