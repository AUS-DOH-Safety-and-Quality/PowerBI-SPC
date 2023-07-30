import { sum } from "../D3 Plotting Functions/D3 Modules";
import { abs } from "../Functions/broadcastUnary";

export default function shift(val: number[], targets: number[], n: number): string[] {
  const lagged_sign: number[] = val.map((d, i) => {
    return Math.sign(d - targets[i]);
  });
  const lagged_sign_sum: number[] = lagged_sign.map((_, i) => {
    return sum(lagged_sign.slice(Math.max(0, i - (n - 1)), i + 1));
  })
  const shift_detected: string[] = lagged_sign_sum.map(d => {
    if (abs(d) >= n) {
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
