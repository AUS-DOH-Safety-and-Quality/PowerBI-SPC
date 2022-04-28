import * as d3 from "d3";
import diff from "../Functions/diff"
import rep from "../Functions/rep";
import { abs } from "../Function Broadcasting/UnaryFunctions"
import { divide } from "../Function Broadcasting/BinaryFunctions";
import dataObject from "../Classes/dataObject";
import controlLimits from "../Type Definitions/controlLimits";

function iLimits(inputData: dataObject): controlLimits {
  let ratio: number[] = (inputData.denominators && inputData.denominators.length > 0)
    ? divide(inputData.numerators, inputData.denominators)
    : inputData.numerators;

  let cl: number = d3.mean(ratio);

  let consec_diff: number[] = abs(diff(ratio));
  let consec_diff_ulim: number = d3.mean(consec_diff) * 3.267;
  let consec_diff_valid: number[] = consec_diff.filter(d => d < consec_diff_ulim);

  let sigma: number = d3.mean(consec_diff_valid) / 1.128;

  return {
    keys: inputData.keys,
    values: ratio.map(d => isNaN(d) ? 0 : d),
    targets: rep(cl, inputData.keys.length),
    ll99: rep(cl - 3 * sigma, inputData.keys.length),
    ll95: rep(cl - 2 * sigma, inputData.keys.length),
    ul95: rep(cl + 2 * sigma, inputData.keys.length),
    ul99: rep(cl + 3 * sigma, inputData.keys.length)
  };
}

export default iLimits;
