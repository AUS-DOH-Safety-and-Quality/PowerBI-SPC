import * as d3 from "d3";
import * as rmath from "lib-r-math.js";
import { diff, abs, rep } from "./HelperFunctions";
import { ControlLimits } from "../Interfaces";

function i_limits(key: string[], value: number[], denominator?: number[]): ControlLimits {
    let ratio: number[] = denominator ? rmath.R.div(value,denominator) : value;

    let cl: number = d3.mean(ratio);

    let consec_diff: number[] = abs(diff(ratio));
    let consec_diff_ulim: number = d3.mean(consec_diff) * 3.267;
    let consec_diff_valid: number[] = consec_diff.filter(d => d < consec_diff_ulim);

    let sigma: number = d3.mean(consec_diff_valid) / 1.128;

    let limits: ControlLimits = {
        key: key,
        value: ratio,
        centerline: cl,
        lowerLimit: rep(cl - 3*sigma, key.length),
        upperLimit: rep(cl + 3*sigma, key.length),
        count: null
    }
    return limits;
}

export default i_limits;
