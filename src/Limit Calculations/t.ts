import i_limits from "./i";
import { pow } from "./HelperFunctions";

function t_limits(key: string[], value: number[]): (string | number)[][] {

    let val: number[] = pow(value, 1 / 3.6);

    return i_limits(key, val).map(
        d => [d[0],
              pow(d[1], 3.6),
              pow(d[2], 3.6),
              (pow(d[3], 3.6) > 0) ? pow(d[3], 3.6) : 0,
              pow(d[4], 3.6)]
    )
}

export default t_limits;