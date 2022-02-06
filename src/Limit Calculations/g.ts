import * as d3 from "d3";
import { sqrt, rep } from "./HelperFunctions";
import { ControlLimits } from "../Interfaces";

function g_limits(key: string[], value: number[]): ControlLimits {
    let cl: number = d3.mean(value);
    let sigma: number = sqrt(cl * (cl + 1));

    let limits: ControlLimits = {
        key: key,
        value: value,
        centerline: rep(cl, key.length),
        lowerLimit99: rep(0, key.length),
        upperLimit99: rep(cl + 3*sigma, key.length),
        count: null
    }

    return limits;
}

export default g_limits;
