import sum from "../Functions/sum";

/**
 * Detects trend rule violations (n consecutive points consistently increasing or decreasing).
 *
 * A trend represents special cause variation when values consistently move in the same
 * direction for n consecutive points. This indicates a systematic drift or trend in the
 * process. When detected, all points in the trend sequence are flagged.
 *
 * @param val - Array of data values to check
 * @param n - Number of consecutive trending points required to trigger detection
 * @returns Array indicating trend direction: "upper" (increasing), "lower" (decreasing), or "none"
 */
export default function trend(val: number[], n: number): string[] {
  // Calculate sign of change from previous point (+1 increasing, -1 decreasing, 0 no change)
  const lagged_sign: number[] = val.map((d, i) => {
    return (i == 0) ? i : Math.sign(d - val[i - 1]);
  });

  // Calculate rolling sum of signs (n-1 consecutive increases/decreases = sum of n-1)
  const lagged_sign_sum: number[] = lagged_sign.map((_, i) => {
    return sum(lagged_sign.slice(Math.max(0, i - (n - 2)), i + 1));
  })

  // Detect when all n-1 changes are in the same direction
  const trend_detected: string[] = lagged_sign_sum.map(d => {
    if (Math.abs(d) >= (n - 1)) {
      return d >= (n - 1) ? "upper" : "lower";
    } else {
      return "none";
    }
  })

  // Backfill flags to all previous points in the trend sequence
  for (let i: number = 0; i < trend_detected.length; i++) {
    if (trend_detected[i] !== "none") {
      for (let j: number = (i - 1); j >= (i - (n - 1)); j--) {
        trend_detected[j] = trend_detected[i];
      }
    }
  }

  return trend_detected;
}
