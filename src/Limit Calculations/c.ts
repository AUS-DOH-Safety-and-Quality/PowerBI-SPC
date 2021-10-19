import * as d3 from "d3";

function c_limits(key: string[], value: number[]): (string | number)[][] {
    let cl: number = d3.mean(value);
    let sigma: number = Math.sqrt(cl);

    return key.map((d,idx) => [d,
                               value[idx],
                               cl,
                               Math.max(cl - 3*sigma, 0),
                               cl + 3*sigma]);
}

export default c_limits;
