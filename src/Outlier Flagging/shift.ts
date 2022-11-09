import * as math from '@stdlib/math/base/special';
import * as d3 from "d3";

function shift(flag_direction: string, val: number[], targets: number[], n: number): boolean[] {
  let lagged_sign: number[] = val.map((d, i) => {
    return Math.sign(d - targets[i]);
  });
  let lagged_sign_sum: number[] = lagged_sign.map((d, i) => {
    return d3.sum(lagged_sign.slice(Math.max(0, i - (n - 1)), i + 1));
  })
  let shift_detected: boolean[] = lagged_sign_sum.map(d => {
    if (math.abs(d) >= n) {
      if (flag_direction === "both") {
        return true;
      } else if (flag_direction === "upper") {
        return d >= n;
      } else if (flag_direction === "lower") {
        return d <= n;
      }
    } else {
      return false;
    }
  })
  for (let i: number = 0; i < shift_detected.length; i++) {
    if (shift_detected[i] === true) {
      for (let j: number = (i - 1); j >= (i - (n - 1)); j--) {
        shift_detected[j] = true;
      }
    }
  }

  return shift_detected;
}

export default shift
