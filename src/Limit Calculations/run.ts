import * as d3 from "d3";
import * as rmath from "lib-r-math.js";
import { rep } from "./HelperFunctions";
import { ControlLimits } from "../Interfaces";

function run_limits(key: string[], value: number[], denominator?: number[]): ControlLimits {
    let ratio: number[] = (denominator && denominator.length > 0) ? rmath.R.div(value, denominator) : value
    
    let cl: number = d3.median(ratio);
    let limits: ControlLimits = {
        key: key,
        value: ratio.map(d => isNaN(d) ? 0 : d),
        centerline: rep(cl, key.length),
        lowerLimit: rep(null, key.length),
        upperLimit: rep(null, key.length),
        count: null
    }
    return limits;
}

export default run_limits;
