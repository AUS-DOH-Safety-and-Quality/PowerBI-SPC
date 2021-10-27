import * as rmath from "lib-r-math.js";
import * as d3 from "d3";
import { sqrt, diff, abs, subtract, add } from "./HelperFunctions";
import { ControlLimits } from "../Interfaces";

function uprime_limits(key: string[], value: number[], denominator: number[]): ControlLimits {
    let val: number[] = rmath.R.div(value,denominator);
    let cl: number = d3.sum(value) / d3.sum(denominator);
    let sd: number[] = sqrt(rmath.R.div(cl,denominator));
    let zscore: number[] = rmath.R.div(subtract(val,cl), sd);

    var consec_diff = abs(diff(zscore));
    let sigma: number = rmath.R.mult(sd, d3.mean(consec_diff) / 1.128);

    let limits: ControlLimits = {
        key: key,
        value: val,
        centerline: cl,
        lowerLimit: subtract(cl, rmath.R.mult(3,sigma)).map(d => d < 0 ? 0 : d),
        upperLimit: add(cl, rmath.R.mult(3,sigma)),
        count: null
    }
    return limits;
}

export default uprime_limits;
