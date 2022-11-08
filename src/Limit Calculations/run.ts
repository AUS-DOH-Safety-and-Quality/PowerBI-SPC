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
  let denominators: number[] = inputData.denominators;
  let numerators: number[] = inputData.numerators;

  let cl: number = d3.median(ratio);
  return new controlLimits({
    keys: inputData.keys,
    values: ratio.map(d => isNaN(d) ? 0 : d),
    numerators: useRatio ? inputData.numerators : null,
    denominators: useRatio ? inputData.denominators : null,
    targets: rep(cl, inputData.keys.length),
    ll99: rep(null, inputData.keys.length),
    ll95: rep(null, inputData.keys.length),
    ul95: rep(null, inputData.keys.length),
    ul99: rep(null, inputData.keys.length)
  });
}

export default runLimits;
