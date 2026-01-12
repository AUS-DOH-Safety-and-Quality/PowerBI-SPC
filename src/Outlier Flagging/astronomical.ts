import between from "../Functions/between"

/**
 * Detects astronomical points (single points outside 99% control limits).
 *
 * An astronomical point represents special cause variation where a single data point
 * falls outside the 99% control limits. This is one of the key rules for identifying
 * when a process is exhibiting non-random variation.
 *
 * @param val - Array of data values to check
 * @param ll99 - Array of lower 99% control limits
 * @param ul99 - Array of upper 99% control limits
 * @returns Array indicating outlier direction: "upper", "lower", or "none" for each point
 */
export default function astronomical(val: number[], ll99: number[], ul99: number[]): string[] {
  return val.map((d, i) => {
    // Check if point is outside 99% control limits
    if (!between(d, ll99[i], ul99[i])) {
      return d > ul99[i] ? "upper" : "lower";
    } else {
      return "none";
    }
  });
}
