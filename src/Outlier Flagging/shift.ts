import * as math from '@stdlib/math/base/special';
import * as d3 from "d3";

function shift(val: number[], targets: number[], n: number): string[] {
  let lagged_sign: number[] = val.map((d, i) => {
    return Math.sign(d - targets[i]);
  });
  let lagged_sign_sum: number[] = lagged_sign.map((d, i) => {
    return d3.sum(lagged_sign.slice(Math.max(0, i - (n - 1)), i + 1));
  })
  let shift_detected: string[] = lagged_sign_sum.map(d => {
    if (math.abs(d) >= n) {
      return d >= n ? "upper" : "lower";
    } else {
      return "none";
    }
  })
  for (let i: number = 0; i < shift_detected.length; i++) {
    if (shift_detected[i] !== "none") {
      for (let j: number = (i - 1); j >= (i - (n - 1)); j--) {
        shift_detected[j] = shift_detected[i];
      }
    }
  }

  return shift_detected;
}

export default shift
