import * as d3 from "d3";
import rep from "../Functions/rep";
import { sqrt } from "../Functions/UnaryFunctions";
import { subtract, add, divide, multiply } from "../Functions/BinaryFunctions";
import controlLimits from "../Classes/controlLimits";
import dataObject from "../Classes/dataObject";
import truncate from "../Functions/truncate";
import {LimitArgs} from "../Classes/chartObject";

function uLimits(args: LimitArgs): controlLimits {
  const inputData: dataObject = args.inputData;
  const cl: number = divide(d3.sum(inputData.numerators),d3.sum(inputData.denominators));
  const sigma: number[] = sqrt(divide(cl,inputData.denominators));

  return new controlLimits({
    keys: inputData.keys,
    values: divide(inputData.numerators, inputData.denominators),
    numerators: inputData.numerators,
    denominators: inputData.denominators,
    targets: rep(cl, inputData.keys.length),
    ll99: truncate(subtract(cl, multiply(3, sigma)), {lower: 0}),
    ll95: truncate(subtract(cl, multiply(2, sigma)), {lower: 0}),
    ul95: add(cl, multiply(2, sigma)),
    ul99: add(cl, multiply(3, sigma))
  })
}

export default uLimits;
