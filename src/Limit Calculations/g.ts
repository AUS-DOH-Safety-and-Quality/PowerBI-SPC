import * as d3 from "d3";
import { sqrt } from "./HelperFunctions";

function g_limits(key: string[], value: number[], denominator?, group?): (string | number)[][] {

    let cl: number = d3.mean(value);

    let sigma: number = sqrt(cl * (cl + 1));
    let lcl: number = Math.max(cl - 3*sigma, 0);
    let ucl: number = cl + 3*sigma;

    return key.map((d,idx) => [d,
                               value[idx],
                               d3.median(value),
                               lcl,
                               ucl]);
}

export default g_limits;