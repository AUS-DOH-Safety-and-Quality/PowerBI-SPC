import * as d3 from "d3";
import rep from "../Functions/rep";
import diff from "../Functions/diff";
import { abs, sqrt } from "../Functions/UnaryFunctions";
import { subtract, add, divide, multiply } from "../Functions/BinaryFunctions";
import controlLimitsClass from "../Classes/controlLimitsClass";
import dataClass from "../Classes/dataClass";
import truncate from "../Functions/truncate";
import { LimitArgs } from "../Classes/viewModelClass";

export default function uprimeLimits(args: LimitArgs): controlLimitsClass {
  const inputData: dataClass = args.inputData;
  const val: number[] = divide(inputData.numerators, inputData.denominators);
  const cl: number = d3.sum(inputData.numerators) / d3.sum(inputData.denominators);
  const sd: number[] = sqrt(divide(cl,inputData.denominators));
  const zscore: number[] = divide(subtract(val,cl), sd);

  const consec_diff: number[] = abs(diff(zscore));
  const consec_diff_ulim: number = d3.mean(consec_diff) * 3.267;
  const outliers_in_limits: boolean = args.inputSettings.spc.outliers_in_limits;
  const consec_diff_valid: number[] = outliers_in_limits ? consec_diff : consec_diff.filter(d => d < consec_diff_ulim);
  const sigma: number[] = multiply(sd, d3.mean(consec_diff_valid) / 1.128);

  return new controlLimitsClass({
    keys: inputData.keys,
    values: val,
    numerators: inputData.numerators,
    denominators: inputData.denominators,
    targets: rep(cl, inputData.keys.length),
    ll99: truncate(subtract(cl, multiply(3,sigma)), {lower: 0}),
    ll95: truncate(subtract(cl, multiply(2,sigma)), {lower: 0}),
    ul95: add(cl, multiply(2,sigma)),
    ul99: add(cl, multiply(3,sigma))
  });
}
