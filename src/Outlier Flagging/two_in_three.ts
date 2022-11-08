import between from "../Functions/between"
import * as d3 from "d3";

function two_in_three(val: number[], ll95: number[], ul95: number[]): boolean[] {
  let outside95: number[] = val.map((d, i) => {
    return d > ul95[i] ? 1 : (d < ll95[i] ? -1 : 0);
  });
  let lagged_sign_sum: number[] = outside95.map((d, i) => {
    return d3.sum(outside95.slice(Math.max(0, i - 2), i + 1));
  })
  return lagged_sign_sum.map(d => {
    return d >= 2;
  })
}

export default two_in_three
