import * as math from '@stdlib/math/base/special';
import * as d3 from "d3";

function trend(val: number[], n: number): string[] {
  const lagged_sign: number[] = val.map((d, i) => {
    return (i == 0) ? i : Math.sign(d - val[i - 1]);
  });
  const lagged_sign_sum: number[] = lagged_sign.map((_, i) => {
    return d3.sum(lagged_sign.slice(Math.max(0, i - (n - 2)), i + 1));
  })
  const trend_detected: string[] = lagged_sign_sum.map(d => {
    if (math.abs(d) >= (n - 1)) {
      return d >= (n - 1) ? "upper" : "lower";
    } else {
      return "none";
    }
  })

  for (let i: number = 0; i < trend_detected.length; i++) {
    if (trend_detected[i] !== "none") {
      for (let j: number = (i - 1); j >= (i - (n - 1)); j--) {
        trend_detected[j] = trend_detected[i];
      }
    }
  }

  return trend_detected;
}

export default trend
