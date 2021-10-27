import * as rmath from "lib-r-math.js";
import * as d3 from "d3";
import { sqrt, diff, abs, add, subtract } from "./HelperFunctions";
import { ControlLimits } from "../Interfaces";

function pprime_limits(key: string[], value: number[], denominator: number[]): ControlLimits {
    let val: number[] = rmath.R.div(value,denominator);
    let cl: number = d3.sum(value) / d3.sum(denominator);
    let sd: number[] = sqrt(rmath.R.div(cl*(1-cl),denominator));
    let zscore: number[] = rmath.R.div(subtract(val,cl), sd);

    let consec_diff: number[] = abs(diff(zscore));
    let sigma: number = rmath.R.mult(sd, d3.mean(consec_diff) / 1.128);

    let limits: ControlLimits = {
        key: key,
        value: val,
        centerline: cl,
        lowerLimit: subtract(cl, rmath.R.mult(3,sigma)).map(d => d < 0 ? 0 : d),
        upperLimit: add(cl, rmath.R.mult(3,sigma)).map(d => d > 1 ? 1 : d),
        count: null
    }
    return limits;
}

export default pprime_limits;
