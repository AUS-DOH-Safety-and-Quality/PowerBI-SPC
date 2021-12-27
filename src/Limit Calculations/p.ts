import * as rmath from "lib-r-math.js";
import { sqrt, subtract, add, rep } from "./HelperFunctions";
import { ControlLimits } from "../Interfaces";

function p_limits(key: string[], value: number[], denominator: number[]): ControlLimits {
    let cl: number = rmath.R.sum(value) / rmath.R.sum(denominator);
    let sigma: number[] = sqrt(rmath.R.div(cl*(1-cl),denominator));

    let limits: ControlLimits = {
        key: key,
        value: rmath.R.div(value, denominator),
        centerline: rep(cl, key.length),
        lowerLimit: subtract(cl, rmath.R.mult(3,sigma)).map(d => d < 0 ? 0 : d),
        upperLimit: add(cl, rmath.R.mult(3,sigma)).map(d => d > 1 ? 1 : d),
        count: null
    }

    return limits;
}

export default p_limits;
