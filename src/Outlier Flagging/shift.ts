import * as math from '@stdlib/math/base/special';
import * as d3 from "d3";

function shift(val: number[], targets: number[], n: number): boolean[] {
  let lagged_sign: number[] = val.map((d, i) => {
    return Math.sign(d - targets[i]);
  });
  let lagged_sign_sum: number[] = lagged_sign.map((d, i) => {
    return d3.sum(lagged_sign.slice(Math.max(0, i + 1 - n), i + 1));
  })
  return lagged_sign_sum.map(d => {
    return math.abs(d) >= n;
  })
}

export default shift
