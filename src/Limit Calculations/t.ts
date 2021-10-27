import i_limits from "./i";
import { pow } from "./HelperFunctions";
import { ControlLimits } from "../Interfaces";

function t_limits(key: string[], value: number[]): ControlLimits {
    let val: number[] = pow(value, 1 / 3.6);

    let limits: ControlLimits = i_limits(key, val);
    limits.centerline = pow(limits.centerline, 3.6);
    limits.value = pow(limits.value, 3.6);
    limits.lowerLimit = pow(limits.lowerLimit, 3.6).map(d => d < 0 ? 0 : d);
    limits.upperLimit = pow(limits.upperLimit, 3.6);

    return limits;
}

export default t_limits;
