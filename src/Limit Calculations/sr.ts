import * as rmath from "lib-r-math.js";

function sr_limits(key: string[], value: number[], denominator: number[], group?): (string | number)[][] {

    let cl: number = 1;
    let val: number[] = rmath.R.div(value,denominator);

    return key.map((d,idx) => [d,
                               val[idx],
                               cl,
                               (rmath.ChiSquared().qchisq(0.001, 2 * (denominator[idx])) / 2.0) / denominator[idx],
                               (rmath.ChiSquared().qchisq(0.999, 2 * (denominator[idx] + 1)) / 2.0) / denominator[idx]]);
}

export default sr_limits;