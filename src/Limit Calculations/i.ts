import * as d3 from "d3";
import { diff, abs, rep, divide } from "./HelperFunctions";
import { ControlLimits } from "../Interfaces";

function i_limits(key: string[], value: number[], denominator?: number[]): ControlLimits {
    let ratio: number[] = (denominator && denominator.length > 0) ? divide(value, denominator) : value;

    let cl: number = d3.mean(ratio);

    let consec_diff: number[] = abs(diff(ratio));
    let consec_diff_ulim: number = d3.mean(consec_diff) * 3.267;
    let consec_diff_valid: number[] = consec_diff.filter(d => d < consec_diff_ulim);

    let sigma: number = d3.mean(consec_diff_valid) / 1.128;

    let limits: ControlLimits = {
        key: key,
        value: ratio.map(d => isNaN(d) ? 0 : d),
        centerline: rep(cl, key.length),
        lowerLimit99: rep(cl - 3*sigma, key.length),
        lowerLimit95: rep(cl - 2*sigma, key.length),
        upperLimit95: rep(cl + 2*sigma, key.length),
        upperLimit99: rep(cl + 3*sigma, key.length),
        count: null
    }
    return limits;
}

export default i_limits;
