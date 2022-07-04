import * as d3 from "d3";
import rep from "../Functions/rep";
import { sqrt } from "../Function Broadcasting/UnaryFunctions";
import { subtract, add, divide, multiply } from "../Function Broadcasting/BinaryFunctions";
import controlLimits from "../Type Definitions/controlLimits";
import dataObject from "../Classes/dataObject";
import truncate from "../Functions/truncate";

function uLimits(inputData: dataObject): controlLimits {
  let cl: number = divide(d3.sum(inputData.numerators),d3.sum(inputData.denominators));
  let sigma: number[] = sqrt(divide(cl,inputData.denominators));

  return {
    keys: inputData.keys,
    values: divide(inputData.numerators, inputData.denominators),
    targets: rep(cl, inputData.keys.length),
    ll99: truncate(subtract(cl, multiply(3, sigma)), {lower: 0}),
    ll95: truncate(subtract(cl, multiply(2, sigma)), {lower: 0}),
    ul95: add(cl, multiply(2, sigma)),
    ul99: add(cl, multiply(3, sigma))
  }
}

export default uLimits;
