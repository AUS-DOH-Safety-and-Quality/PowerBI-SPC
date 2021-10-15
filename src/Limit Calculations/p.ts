import * as rmath from "lib-r-math.js";
import { sqrt } from "./HelperFunctions";

function p_limits(key: string[], value: number[], denominator: number[]): (string | number)[][] {

    let cl: number = rmath.R.div(rmath.R.sum(value),rmath.R.sum(denominator));
    let val: number[] = rmath.R.div(value,denominator);

    let sigma: number[] = sqrt(rmath.R.div(cl*(1-cl),denominator));

    return key.map((d,idx) => [d,
                               val[idx],
                               cl,
                               (cl - 3*sigma[idx] < 0) ? 0 : cl - 3*sigma[idx],
                               (cl + 3*sigma[idx] > 1) ? 1 : cl + 3*sigma[idx]]);
}

export default p_limits;