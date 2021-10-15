import * as d3 from "d3";
import * as rmath from "lib-r-math.js";
import { diff } from "./HelperFunctions";
import { abs } from "./HelperFunctions";

function i_limits(key: string[], value: number[], denominator?: number[]): (string | number)[][] {
    var ratio: number[];
    if (denominator == null) {
        ratio = value;
    } else {
        ratio = rmath.R.div(value,denominator);
    }
    let cl: number = d3.mean(ratio);

    var consec_diff: number[] = abs(diff(ratio));
    
    let consec_diff_ulim: number = d3.mean(consec_diff) * 3.267;
    let consec_diff_valid: number[] = consec_diff.filter(d => d < consec_diff_ulim);

    let sigma: number = d3.mean(consec_diff_valid) / 1.128;

    return key.map((d,idx) => [d, ratio[idx], cl, cl - 3*sigma, cl + 3*sigma]);
}

export default i_limits;