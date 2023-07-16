import * as d3 from "d3";
import rep from "../Functions/rep";
import { sqrt } from "../Functions/UnaryFunctions";
import { subtract, add, divide, multiply } from "../Functions/BinaryFunctions";
import controlLimitsClass from "../Classes/controlLimitsClass";
import dataClass from "../Classes/dataClass";
import truncate from "../Functions/truncate"
import { LimitArgs } from "../Classes/viewModelClass";

function pLimits(args: LimitArgs): controlLimitsClass {
  const inputData: dataClass = args.inputData;
  const cl: number = d3.sum(inputData.numerators) / d3.sum(inputData.denominators);
  const sigma: number[] = sqrt(divide(cl * (1 - cl), inputData.denominators));

  return new controlLimitsClass({
    keys: inputData.keys,
    values: divide(inputData.numerators, inputData.denominators),
    numerators: inputData.numerators,
    denominators: inputData.denominators,
    targets: rep(cl, inputData.keys.length),
    ll99: truncate(subtract(cl, multiply(3, sigma)), {lower: 0}),
    ll95: truncate(subtract(cl, multiply(2, sigma)), {lower: 0}),
    ul95: truncate(add(cl, multiply(2, sigma)), {upper: 1}),
    ul99: truncate(add(cl, multiply(3, sigma)), {upper: 1})
  });
}

export default pLimits;
