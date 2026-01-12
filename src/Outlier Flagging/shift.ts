import sum from "../Functions/sum";

/**
 * Detects shift rule violations (n consecutive points on same side of target/centerline).
 *
 * A shift represents special cause variation when a specified number of consecutive points
 * fall on the same side of the target or centerline. This indicates a sustained change
 * in the process level. When detected, all points in the shift sequence are flagged.
 *
 * @param val - Array of data values to check
 * @param targets - Array of target/centerline values
 * @param n - Number of consecutive points required to trigger shift detection
 * @returns Array indicating outlier direction: "upper", "lower", or "none" for each point
 */
export default function shift(val: number[], targets: number[], n: number): string[] {
  // Calculate sign of difference from target for each point (+1, -1, or 0)
  const lagged_sign: number[] = val.map((d, i) => {
    return Math.sign(d - targets[i]);
  });

  // Calculate rolling sum of signs over n consecutive points
  const lagged_sign_sum: number[] = lagged_sign.map((_, i) => {
    return sum(lagged_sign.slice(Math.max(0, i - (n - 1)), i + 1));
  })

  // Detect when all n points are on the same side (sum >= n or <= -n)
  const shift_detected: string[] = lagged_sign_sum.map(d => {
    if (Math.abs(d) >= n) {
      return d >= n ? "upper" : "lower";
    } else {
      return "none";
    }
  })

  // Backfill flags to all previous points in the shift sequence
  for (let i: number = 0; i < shift_detected.length; i++) {
    if (shift_detected[i] !== "none") {
      for (let j: number = (i - 1); j >= (i - (n - 1)); j--) {
        shift_detected[j] = shift_detected[i];
      }
    }
  }

  return shift_detected;
}
