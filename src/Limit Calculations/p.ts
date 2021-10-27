import * as rmath from "lib-r-math.js";
import { sqrt, subtract, add } from "./HelperFunctions";
import { ControlLimits } from "../Interfaces";

function p_limits(key: string[], value: number[], denominator: number[]): ControlLimits {
    let cl: number = rmath.R.sum(value) / rmath.R.sum(denominator);
    let sigma: number[] = sqrt(rmath.R.div(cl*(1-cl),denominator));

    let limits: ControlLimits;
    limits.key = key;
    limits.value = rmath.R.div(value, denominator);
    limits.centerline = cl;
    limits.lowerLimit = subtract(cl, rmath.R.mult(3,sigma)).map(d => d < 0 ? 0 : d);
    limits.upperLimit = add(cl, rmath.R.mult(3,sigma)).map(d => d > 1 ? 1 : d);

    return limits;
}

export default p_limits;
