import * as d3 from "d3";
import rep from "../Functions/rep";
import { divide } from "../Function Broadcasting/BinaryFunctions";
import { ControlLimits } from "../Interfaces";

function run_limits(key: string[], value: number[], denominator?: number[]): ControlLimits {
  let ratio: number[] = (denominator && denominator.length > 0) ? divide(value, denominator) : value

  let cl: number = d3.median(ratio);
  let limits: ControlLimits = {
    key: key,
    value: ratio.map(d => isNaN(d) ? 0 : d),
    centerline: rep(cl, key.length),
    lowerLimit99: rep(null, key.length),
    lowerLimit95: rep(null, key.length),
    upperLimit95: rep(null, key.length),
    upperLimit99: rep(null, key.length),
    count: null
  }
  return limits;
}

export default run_limits;
