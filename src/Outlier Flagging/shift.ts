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
export default function shift(val: readonly number[], targets: readonly number[], n: number): string[] {
  const length: number = val.length;

  // Calculate sign of difference from target for each point (+1, -1, or 0)
  const lagged_sign: number[] = new Array<number>(length);
  const shift_detected: string[] = new Array<string>(length);

  for (let i = 0; i < length; i++) {
    lagged_sign[i] = Math.sign(val[i] - targets[i]);
    const lagged_sign_sum: number = sum(lagged_sign.slice(Math.max(0, i - (n - 1)), i + 1));
    if (Math.abs(lagged_sign_sum) >= n) {
      shift_detected[i] = lagged_sign_sum >= n ? "upper" : "lower";
    } else {
      shift_detected[i] = "none";
    }

    // Backfill flags to all previous points in the shift sequence
    if (shift_detected[i] !== "none") {
      for (let j: number = (i - 1); j >= (i - (n - 1)); j--) {
        shift_detected[j] = shift_detected[i];
      }
    }
  }

  return shift_detected;
}
