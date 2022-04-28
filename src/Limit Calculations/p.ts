import * as d3 from "d3";
import rep from "../Functions/rep";
import { sqrt } from "../Function Broadcasting/UnaryFunctions";
import { subtract, add, divide, multiply } from "../Function Broadcasting/BinaryFunctions";
import controlLimits from "../Type Definitions/controlLimits";
import dataObject from "../Classes/dataObject";
import truncate from "../Functions/truncate"

function pLimits(inputData: dataObject): controlLimits {
  let cl: number = d3.sum(inputData.numerators) / d3.sum(inputData.denominators);
  let sigma: number[] = sqrt(divide(cl * (1 - cl), inputData.denominators));
  console.log("plimits")
  console.log("sigma: ", sigma)
  return {
    keys: inputData.keys,
    values: divide(inputData.numerators, inputData.denominators),
    targets: rep(cl, inputData.keys.length),
    ll99: truncate(subtract(cl, multiply(3, sigma)), {lower: 0}),
    ll95: truncate(subtract(cl, multiply(2, sigma)), {lower: 0}),
    ul95: truncate(add(cl, multiply(2, sigma)), {upper: 1}),
    ul99: truncate(add(cl, multiply(2, sigma)), {upper: 1})
  }
}

export default pLimits;
