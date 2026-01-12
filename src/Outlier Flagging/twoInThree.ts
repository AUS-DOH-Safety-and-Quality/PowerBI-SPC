import sum from "../Functions/sum";

/**
 * Detects two-in-three rule violations (2 out of 3 consecutive points outside 95% limits).
 *
 * This SPC rule identifies special cause variation when at least 2 out of 3 consecutive
 * points fall outside the 95% control limits on the same side. When detected, all points
 * in the sequence are flagged (optionally only those outside 95% limits).
 *
 * @param val - Array of data values to check
 * @param ll95 - Array of lower 95% control limits
 * @param ul95 - Array of upper 95% control limits
 * @param highlight_series - If true, highlight all points in sequence; if false, only those outside 95% limits
 * @returns Array indicating outlier direction: "upper", "lower", or "none" for each point
 */
export default function twoInThree(val: number[], ll95: number[], ul95: number[], highlight_series: boolean): string[] {
  // Map each point to +1 (above upper), -1 (below lower), or 0 (within limits)
  const outside95: number[] = val.map((d, i) => {
    return d > ul95[i] ? 1 : (d < ll95[i] ? -1 : 0);
  });

  // Calculate rolling sum of last 3 points (including current)
  const lagged_sign_sum: number[] = outside95.map((_, i) => {
    return sum(outside95.slice(Math.max(0, i - 2), i + 1));
  })

  // Detect when absolute sum >= 2 (2 or 3 points on same side)
  const two_in_three_detected: string[] = lagged_sign_sum.map(d => {
    if (Math.abs(d) >= 2) {
      return d >= 2 ? "upper" : "lower";
    } else {
      return "none";
    }
  })

  // Backfill flags to the previous points in the sequence
  for (let i: number = 0; i < two_in_three_detected.length; i++) {
    if (two_in_three_detected[i] !== "none") {
      for (let j: number = (i - 1); j >= (i - 2); j--) {
        // Only highlight points exceeding the 95% limits (unless requested)
        if (outside95[j] !== 0 || highlight_series) {
          two_in_three_detected[j] = two_in_three_detected[i];
        }
      }
      // Remove flag from current point if it's within limits and not highlighting series
      if (outside95[i] === 0 && !highlight_series) {
        two_in_three_detected[i] = "none";
      }
    }
  }

  return two_in_three_detected;
}
