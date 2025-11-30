/**
 * Two in Three rule: Detects when 2 out of 3 consecutive points are beyond the 95% limits.
 * 
 * Optimized with sliding window approach for O(n) time complexity.
 * Previous implementation used sum(array.slice(...)) which was O(n²).
 */
export default function twoInThree(val: number[], ll95: number[], ul95: number[], highlight_series: boolean): string[] {
  const len = val.length;
  if (len === 0) {
    return [];
  }

  // Pre-calculate which points are outside 95% limits in a single pass
  const outside95: number[] = new Array(len);
  for (let i = 0; i < len; i++) {
    outside95[i] = val[i] > ul95[i] ? 1 : (val[i] < ll95[i] ? -1 : 0);
  }

  // Calculate sliding window sums using running total - O(n) instead of O(n²)
  // Window size is 3 points: from i-2 to i
  const lagged_sign_sum: number[] = new Array(len);
  let windowSum = 0;
  
  for (let i = 0; i < len; i++) {
    // Add current element to window
    windowSum += outside95[i];
    
    // Remove element that falls outside window (when i >= 3)
    if (i >= 3) {
      windowSum -= outside95[i - 3];
    }
    
    lagged_sign_sum[i] = windowSum;
  }

  // Detect two-in-three violations based on sums
  const two_in_three_detected: string[] = new Array(len);
  for (let i = 0; i < len; i++) {
    const absSum = Math.abs(lagged_sign_sum[i]);
    if (absSum >= 2) {
      two_in_three_detected[i] = lagged_sign_sum[i] >= 2 ? "upper" : "lower";
    } else {
      two_in_three_detected[i] = "none";
    }
  }

  // Backfill markers to all points in the violation window
  for (let i = 0; i < len; i++) {
    if (two_in_three_detected[i] !== "none") {
      for (let j = i - 1; j >= i - 2; j--) {
        // Only highlight points exceeding the 95% limits (unless requested)
        if (j >= 0 && (outside95[j] !== 0 || highlight_series)) {
          two_in_three_detected[j] = two_in_three_detected[i];
        }
      }
      if (outside95[i] === 0 && !highlight_series) {
        two_in_three_detected[i] = "none";
      }
    }
  }

  return two_in_three_detected;
}
