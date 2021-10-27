import * as rmath from "lib-r-math.js";
import { sqrt, subtract, add } from "./HelperFunctions";
import { ControlLimits } from "../Interfaces";

function u_limits(key: string[], value: number[], denominator: number[]): ControlLimits {
    let cl: number = rmath.R.div(rmath.R.sum(value),rmath.R.sum(denominator));
    let sigma: number[] = sqrt(rmath.R.div(cl,denominator));

    let limits: ControlLimits = {
        key: key,
        value: rmath.R.div(value, denominator),
        centerline: cl,
        lowerLimit: subtract(cl, rmath.R.mult(3,sigma)).map(d => d < 0 ? 0 : d),
        upperLimit: add(cl, rmath.R.mult(3,sigma)),
        count: null
    }
    return limits;
}

export default u_limits;
