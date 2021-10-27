import * as rmath from "lib-r-math.js";
import { ControlLimits } from "../Interfaces";

function sr_limits(key: string[], value: number[], denominator: number[]): ControlLimits {
    let limits: ControlLimits = {
        key: key,
        value: rmath.R.div(value,denominator),
        centerline: 1,
        lowerLimit: denominator.map(d => (rmath.ChiSquared().qchisq(0.001, 2 * d) / 2.0) / d),
        upperLimit: denominator.map(d => (rmath.ChiSquared().qchisq(0.999, 2 * (d + 1)) / 2.0) / d),
        count: null
    }
    return limits;
}

export default sr_limits;
