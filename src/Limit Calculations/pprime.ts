import * as d3 from "d3";
import rep from "../Functions/rep";
import diff from "../Functions/diff";
import { sqrt, abs } from "../Functions/UnaryFunctions";
import { subtract, add, divide, multiply } from "../Functions/BinaryFunctions";
import controlLimits from "../Classes/controlLimits";
import dataObject from "../Classes/dataObject";
import truncate from "../Functions/truncate";

function pprimeLimits(inputData: dataObject): controlLimits {
  const val: number[] = divide(inputData.numerators, inputData.denominators);
  const cl: number = d3.sum(inputData.numerators) / d3.sum(inputData.denominators);
  const sd: number[] = sqrt(divide(cl * (1 - cl), inputData.denominators));
  const zscore: number[] = divide(subtract(val, cl), sd);

  const consec_diff: number[] = abs(diff(zscore));
  const consec_diff_ulim: number = d3.mean(consec_diff) * 3.267;
  const consec_diff_valid: number[] = consec_diff.filter(d => d < consec_diff_ulim);
  const sigma: number[] = multiply(sd, d3.mean(consec_diff_valid) / 1.128);

  return new controlLimits({
    keys: inputData.keys,
    values: val,
    numerators: inputData.numerators,
    denominators: inputData.denominators,
    targets: rep(cl, inputData.keys.length),
    ll99: truncate(subtract(cl, multiply(3, sigma)), {lower: 0}),
    ll95: truncate(subtract(cl, multiply(2, sigma)), {lower: 0}),
    ul95: truncate(add(cl, multiply(2, sigma)), {upper: 1}),
    ul99: truncate(add(cl, multiply(3, sigma)), {upper: 1})
  });
}

export default pprimeLimits;
