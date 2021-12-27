import * as d3 from "d3";
import { sqrt, diff, abs, subtract, add, rep, divide, multiply } from "./HelperFunctions";
import { ControlLimits } from "../Interfaces";

function uprime_limits(key: string[], value: number[], denominator: number[]): ControlLimits {
    let val: number[] = divide(value,denominator);
    let cl: number = d3.sum(value) / d3.sum(denominator);
    let sd: number[] = sqrt(divide(cl,denominator));
    let zscore: number[] = divide(subtract(val,cl), sd);

    var consec_diff = abs(diff(zscore));
    let sigma: number = multiply(sd, d3.mean(consec_diff) / 1.128);

    let limits: ControlLimits = {
        key: key,
        value: val,
        centerline: rep(cl, key.length),
        lowerLimit: subtract(cl, multiply(3,sigma)).map(d => d < 0 ? 0 : d),
        upperLimit: add(cl, multiply(3,sigma)),
        count: null
    }
    return limits;
}

export default uprime_limits;
