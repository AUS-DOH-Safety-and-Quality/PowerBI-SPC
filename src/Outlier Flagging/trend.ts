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
export default function trend(val: readonly number[], n: number): string[] {
  const length: number = val.length;
  let lagged_sign: number[] = new Array<number>(length);
  let trend_detected: string[] = new Array<string>(length);
  for (let i: number = 0; i < length; i++) {
    // Calculate sign of change from previous point (+1 increasing, -1 decreasing, 0 no change)
    lagged_sign[i] = (i === 0) ? 0 : Math.sign(val[i] - val[i - 1]);

    // Calculate rolling sum of signs (n-1 consecutive increases/decreases = sum of n-1)
    const lagged_sign_sum: number = sum(lagged_sign.slice(Math.max(0, i - (n - 2)), i + 1));

    // Detect when all n-1 changes are in the same direction
    if (Math.abs(lagged_sign_sum) >= (n - 1)) {
      trend_detected[i] = lagged_sign_sum >= (n - 1) ? "upper" : "lower";
    } else {
      trend_detected[i] = "none";
    }

    if (trend_detected[i] !== "none") {
      // Backfill flags to all previous points in the trend sequence
      for (let j: number = (i - 1); j >= (i - (n - 1)); j--) {
        trend_detected[j] = trend_detected[i];
      }
    }
  }

  return trend_detected;
}
