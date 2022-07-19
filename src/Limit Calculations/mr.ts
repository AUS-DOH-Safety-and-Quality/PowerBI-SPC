import * as d3 from "d3";
import diff from "../Functions/diff"
import rep from "../Functions/rep";
import { abs } from "../Function Broadcasting/UnaryFunctions"
import {  divide } from "../Function Broadcasting/BinaryFunctions";
import dataObject from "../Classes/dataObject";
import controlLimits from "../Classes/controlLimits";

function mrLimits(inputData: dataObject): controlLimits {
  let useRatio: boolean = (inputData.denominators && inputData.denominators.length > 0);
  let ratio: number[] = useRatio
    ? divide(inputData.numerators, inputData.denominators)
    : inputData.numerators;

  let consec_diff: number[] = abs(diff(ratio));
  let cl: number = d3.mean(consec_diff);

  return new controlLimits({
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

export default mrLimits;
