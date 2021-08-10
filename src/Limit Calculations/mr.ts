import * as d3 from "d3";
import { diff } from "./HelperFunctions";
import { abs } from "./HelperFunctions";
import * as rmath from "lib-r-math.js";

function mr_limits(key: string[], value: number[], denominator?: number[], group?): (string | number)[][] {
    var ratio: number[];
    if (denominator == null) {
        ratio = value;
    } else {
        ratio = rmath.R.div(value,denominator);
    }

    var consec_diff: number[] = abs(diff(ratio));
    
    let cl: number = d3.mean(consec_diff);

    return key.map((d,idx) => [d, [null].concat(consec_diff)[idx], cl, 0, 3.267*cl]);
}

export default mr_limits;