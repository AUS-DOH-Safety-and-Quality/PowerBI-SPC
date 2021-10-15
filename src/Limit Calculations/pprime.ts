import * as rmath from "lib-r-math.js";
import * as d3 from "d3";
import { sqrt } from "./HelperFunctions";
import { diff } from "./HelperFunctions";
import { abs } from "./HelperFunctions";
import { subtract } from "./HelperFunctions";

function pprime_limits(key: string[], value: number[], denominator: number[]): (string | number)[][] {
    let val: number[] = rmath.R.div(value,denominator);
    let cl: number = d3.sum(value) / d3.sum(denominator);
    let sd: number[] = sqrt(rmath.R.div(cl*(1-cl),denominator));
    let zscore: number[] = rmath.R.div(subtract(val,cl), sd);

    var consec_diff: number[] = abs(diff(zscore));

    let sigma: number = rmath.R.mult(sd, d3.mean(consec_diff) / 1.128);

    return key.map((d,idx) => [d, val[idx], cl, cl - 3*sigma[idx], cl + 3*sigma[idx]]);
}

export default pprime_limits;