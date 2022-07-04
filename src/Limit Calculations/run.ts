import * as d3 from "d3";
import rep from "../Functions/rep";
import { divide } from "../Function Broadcasting/BinaryFunctions";
import controlLimits from "../Type Definitions/controlLimits";
import dataObject from "../Classes/dataObject";

function runLimits(inputData: dataObject): controlLimits {
  let denominators: number[] = inputData.denominators;
  let numerators: number[] = inputData.numerators;
  let ratio: number[] = (denominators && denominators.length > 0)
                          ? divide(numerators, denominators)
                          : numerators

  let cl: number = d3.median(ratio);
  return {
    keys: inputData.keys,
    values: ratio.map(d => isNaN(d) ? 0 : d),
    targets: rep(cl, inputData.keys.length),
    ll99: rep(null, inputData.keys.length),
    ll95: rep(null, inputData.keys.length),
    ul95: rep(null, inputData.keys.length),
    ul99: rep(null, inputData.keys.length)
  }
}

export default runLimits;
