import * as d3 from "d3";
import { sqrt, subtract, add, rep, divide, multiply } from "./HelperFunctions";
import { ControlLimits } from "../Interfaces";

function u_limits(key: string[], value: number[], denominator: number[]): ControlLimits {
    let cl: number = divide(d3.sum(value),d3.sum(denominator));
    let sigma: number[] = sqrt(divide(cl,denominator));

    let limits: ControlLimits = {
        key: key,
        value: divide(value, denominator),
        centerline: rep(cl, key.length),
        lowerLimit: subtract(cl, multiply(3,sigma)).map(d => d < 0 ? 0 : d),
        upperLimit: add(cl, multiply(3,sigma)),
        count: null
    }
    return limits;
}

export default u_limits;
