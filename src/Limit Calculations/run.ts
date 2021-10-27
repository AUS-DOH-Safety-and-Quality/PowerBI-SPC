import * as d3 from "d3";
import * as rmath from "lib-r-math.js";
import { rep } from "./HelperFunctions";
import { ControlLimits } from "../Interfaces";

function run_limits(key: string[], value: number[], denominator?: number[]): ControlLimits {
    let ratio: number[];
    if (denominator == null) {
        ratio = value;
    } else {
        ratio = rmath.R.div(value,denominator);
    }
    let cl: number = d3.median(ratio);
    let limits: ControlLimits = {
        key: key,
        value: ratio,
        centerline: cl,
        lowerLimit: rep(null, key.length),
        upperLimit: rep(null, key.length),
        count: null
    }
    return limits;
}

export default run_limits;
