import * as d3 from "d3";
import * as rmath from "lib-r-math.js";
import { diff, abs, rep } from "./HelperFunctions";
import { ControlLimits } from "../Interfaces";

function mr_limits(key: string[], value: number[], denominator?: number[]): ControlLimits {
    let ratio: number[];
    if (denominator == null) {
        ratio = value;
    } else {
        ratio = rmath.R.div(value,denominator);
    }

    let consec_diff: number[] = abs(diff(ratio));
    let cl: number = d3.mean(consec_diff);

    let limits: ControlLimits = {
        key: key,
        value: [null].concat(consec_diff),
        centerline: cl,
        lowerLimit: rep(0, key.length),
        upperLimit: rep(3.267*cl, key.length),
        count: null
    }
    return limits;
}

export default mr_limits;
