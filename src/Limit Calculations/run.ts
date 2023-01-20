import * as d3 from "d3";
import rep from "../Functions/rep";
import { divide } from "../Functions/BinaryFunctions";
import controlLimits from "../Classes/controlLimits";
import dataObject from "../Classes/dataObject";

function runLimits(inputData: dataObject): controlLimits {
  let useRatio: boolean = (inputData.denominators && inputData.denominators.length > 0);
  let ratio: number[] = useRatio
    ? divide(inputData.numerators, inputData.denominators)
    : inputData.numerators;

  let cl: number = d3.median(ratio);
  return new controlLimits({
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

export default runLimits;
