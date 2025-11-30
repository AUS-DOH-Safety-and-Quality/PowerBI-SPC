/**
 * Trend rule: Detects runs of n consecutive increasing or decreasing points.
 * 
 * Optimized with sliding window approach for O(n) time complexity.
 * Previous implementation used sum(array.slice(...)) which was O(n²).
 */
export default function trend(val: number[], n: number): string[] {
  const len = val.length;
  if (len === 0) {
    return [];
  }

  // Pre-calculate all direction signs in a single pass
  // First element is 0 (no previous value to compare)
  const lagged_sign: number[] = new Array(len);
  lagged_sign[0] = 0;
  for (let i = 1; i < len; i++) {
    lagged_sign[i] = Math.sign(val[i] - val[i - 1]);
  }

  // Calculate sliding window sums using running total - O(n) instead of O(n²)
  // Window size is (n-1) elements: from i-(n-2) to i
  // This counts the number of consecutive changes in the same direction
  const windowSize = n - 1;
  const lagged_sign_sum: number[] = new Array(len);
  let windowSum = 0;
  
  for (let i = 0; i < len; i++) {
    // Add current element to window
    windowSum += lagged_sign[i];
    
    // Remove element that falls outside window (when i >= windowSize)
    if (i >= windowSize) {
      windowSum -= lagged_sign[i - windowSize];
    }
    
    lagged_sign_sum[i] = windowSum;
  }

  // Detect trends based on sums
  const threshold = n - 1;
  const trend_detected: string[] = new Array(len);
  for (let i = 0; i < len; i++) {
    const absSum = Math.abs(lagged_sign_sum[i]);
    if (absSum >= threshold) {
      trend_detected[i] = lagged_sign_sum[i] >= threshold ? "upper" : "lower";
    } else {
      trend_detected[i] = "none";
    }
  }

  // Backfill trend markers to all points in the trend sequence
  for (let i = 0; i < len; i++) {
    if (trend_detected[i] !== "none") {
      for (let j = i - 1; j >= i - (n - 1); j--) {
        if (j >= 0) {
          trend_detected[j] = trend_detected[i];
        }
      }
    }
  }

  return trend_detected;
}
