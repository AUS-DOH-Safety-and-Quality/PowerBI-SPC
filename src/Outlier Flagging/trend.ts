import * as math from '@stdlib/math/base/special';
import * as d3 from "d3";

function trend(val: number[], n: number): boolean[] {
  console.log("start trend")
  let lagged_sign: number[] = val.map((d, i) => {
    return (i == 0) ? i : Math.sign(d - val[i - 1]);
  });
  let lagged_sign_sum: number[] = lagged_sign.map((d, i) => {
    let lower = (i > n) ? i - n : i;
    return d3.sum(lagged_sign.slice(lower, i + 1));
  })
  let trend_res: boolean[] = lagged_sign_sum.map(d => {
    return math.abs(d) >= (n - 1);
  })
  console.log("trend res: ", trend_res);
  return trend_res;
}

export default trend
