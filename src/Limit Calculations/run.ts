import * as d3 from "d3";
import rep from "../Functions/rep";
import { divide } from "../Functions/BinaryFunctions";
import controlLimits from "../Classes/controlLimitsClass";
import dataClass from "../Classes/dataClass";
import { LimitArgs } from "../Classes/viewModelClass";

export default function runLimits(args: LimitArgs): controlLimits {
  const inputData: dataClass = args.inputData;
  const useRatio: boolean = (inputData.denominators && inputData.denominators.length > 0);
  const ratio: number[] = useRatio
    ? divide(inputData.numerators, inputData.denominators)
    : inputData.numerators;

  const cl: number = d3.median(ratio);
  return new controlLimits({
    inputSettings: args.inputSettings,
    keys: inputData.keys,
    values: ratio.map(d => isNaN(d) ? 0 : d),
    numerators: useRatio ? inputData.numerators : <number[]>null,
    denominators: useRatio ? inputData.denominators : <number[]>null,
    targets: rep(cl, inputData.keys.length),
    ll99: <number[]>null,
    ll95: <number[]>null,
    ul95: <number[]>null,
    ul99: <number[]>null
  });
}
