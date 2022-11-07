import between from "../Functions/between"
import * as d3 from "d3";

function two_in_three(val: number[], ll95: number[], ul95: number[]): boolean[] {
  let outside95: number[] = val.map((d, i) => {
    return Number(!between(d, ll95[i], ul95[i]));
  });
  let lagged_sign_sum: number[] = outside95.map((d, i) => {
    let lower = (i > 2) ? i - 2 : i;
    return d3.sum(outside95.slice(lower, i + 1));
  })
  let trend_res: boolean[] = lagged_sign_sum.map(d => {
    return d >= 2;
  })
  return trend_res;
}

export default two_in_three
