/**
 * Shift rule: Detects runs of n consecutive points on one side of the target line.
 * 
 * Optimized with sliding window approach for O(n) time complexity.
 * Previous implementation used sum(array.slice(...)) which was O(n²).
 */
export default function shift(val: number[], targets: number[], n: number): string[] {
  const len = val.length;
  if (len === 0) {
    return [];
  }

  // Pre-calculate all signs in a single pass
  const lagged_sign: number[] = new Array(len);
  for (let i = 0; i < len; i++) {
    lagged_sign[i] = Math.sign(val[i] - targets[i]);
  }

  // Calculate sliding window sums using running total - O(n) instead of O(n²)
  // Window size is n points: from i-(n-1) to i
  const lagged_sign_sum: number[] = new Array(len);
  let windowSum = 0;
  
  for (let i = 0; i < len; i++) {
    // Add current element to window
    windowSum += lagged_sign[i];
    
    // Remove element that falls outside window (when i >= n)
    if (i >= n) {
      windowSum -= lagged_sign[i - n];
    }
    
    lagged_sign_sum[i] = windowSum;
  }

  // Detect shifts based on sums
  const shift_detected: string[] = new Array(len);
  for (let i = 0; i < len; i++) {
    const absSum = Math.abs(lagged_sign_sum[i]);
    if (absSum >= n) {
      shift_detected[i] = lagged_sign_sum[i] >= n ? "upper" : "lower";
    } else {
      shift_detected[i] = "none";
    }
  }

  // Backfill shift markers to all points in the shift sequence
  for (let i = 0; i < len; i++) {
    if (shift_detected[i] !== "none") {
      for (let j = i - 1; j >= i - (n - 1); j--) {
        if (j >= 0) {
          shift_detected[j] = shift_detected[i];
        }
      }
    }
  }

  return shift_detected;
}
