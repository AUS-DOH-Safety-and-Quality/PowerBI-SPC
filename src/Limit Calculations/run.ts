import * as d3 from "d3";
import * as rmath from "lib-r-math.js";

function run_limits(key: string[], value: number[], denominator?: number[]): (string | number)[][] {
    var ratio: number[];
    if (denominator == null) {
        ratio = value;
    } else {
        ratio = rmath.R.div(value,denominator);
    }
    let cl: number = d3.median(ratio);

    return key.map((d,idx) => [d, ratio[idx], cl, null, null]);
}

export default run_limits;
