import * as d3 from "d3";
import rep from "../Functions/rep";
import diff from "../Functions/diff";
import { abs, sqrt } from "../Function Broadcasting/UnaryFunctions";
import { subtract, add, divide, multiply } from "../Function Broadcasting/BinaryFunctions";
import { ControlLimits } from "../Interfaces";

function uprime_limits(key: string[], value: number[], denominator: number[]): ControlLimits {
  let val: number[] = divide(value,denominator);
  let cl: number = d3.sum(value) / d3.sum(denominator);
  let sd: number[] = sqrt(divide(cl,denominator));
  let zscore: number[] = divide(subtract(val,cl), sd);

  var consec_diff = abs(diff(zscore));
  let sigma: number[] = multiply(sd, d3.mean(consec_diff) / 1.128);

  let limits: ControlLimits = {
    key: key,
    value: val,
    centerline: rep(cl, key.length),
    lowerLimit99: subtract(cl, multiply(3,sigma)).map(d => d < 0 ? 0 : d),
    lowerLimit95: subtract(cl, multiply(2,sigma)).map(d => d < 0 ? 0 : d),
    upperLimit95: add(cl, multiply(2,sigma)),
    upperLimit99: add(cl, multiply(3,sigma)),
    count: null
  }
  return limits;
}

export default uprime_limits;
