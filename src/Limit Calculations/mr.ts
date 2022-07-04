import * as d3 from "d3";
import diff from "../Functions/diff"
import rep from "../Functions/rep";
import { abs } from "../Function Broadcasting/UnaryFunctions"
import {  divide } from "../Function Broadcasting/BinaryFunctions";
import dataObject from "../Classes/dataObject";
import controlLimits from "../Type Definitions/controlLimits";

function mrLimits(inputData: dataObject): controlLimits {
  let ratio: number[];
  if (inputData.denominators == null) {
    ratio = inputData.numerators;
  } else {
    ratio = divide(inputData.numerators, inputData.denominators);
  }

  let consec_diff: number[] = abs(diff(ratio));
  let cl: number = d3.mean(consec_diff);

  return {
    keys: inputData.keys,
    values: consec_diff,
    targets: rep(cl, inputData.keys.length),
    ll99: rep(0, inputData.keys.length),
    ll95: rep(0, inputData.keys.length),
    ul95: rep((3.267 / 3) * 2 * cl, inputData.keys.length),
    ul99: rep(3.267 * cl, inputData.keys.length)
  };
}

export default mrLimits;
