import * as math from '@stdlib/math/base/special';
import * as d3 from "d3";

function trend(val: number[], n: number): boolean[] {
  let lagged_sign: number[] = val.map((d, i) => {
    return (i == 0) ? i : Math.sign(d - val[i - 1]);
  });
  let lagged_sign_sum: number[] = lagged_sign.map((d, i) => {
    return d3.sum(lagged_sign.slice(Math.max(0, i - (n - 2)), i + 1));
  })
  return lagged_sign_sum.map(d => {
    return math.abs(d) >= (n - 1);
  })
}

export default trend
