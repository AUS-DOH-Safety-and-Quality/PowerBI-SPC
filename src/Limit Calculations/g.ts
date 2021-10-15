import * as d3 from "d3";
import { sqrt } from "./HelperFunctions";

function g_limits(key: string[], value: number[]): (string | number)[][] {

    let cl: number = d3.mean(value);

    let sigma: number = sqrt(cl * (cl + 1));
    let lcl: number = 0;
    let ucl: number = cl + 3*sigma;

    return key.map((d,idx) => [d,
                               value[idx],
                               cl * 0.693, // Centerline defined by theoretical median
                               lcl,
                               ucl]);
}

export default g_limits;