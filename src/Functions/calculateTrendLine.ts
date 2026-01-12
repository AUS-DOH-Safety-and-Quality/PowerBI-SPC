/**
 * Calculates a linear trend line (line of best fit) using ordinary least squares regression.
 *
 * This function fits a straight line through the data points that minimizes the sum of squared
 * vertical distances between the observed values and the trend line. The trend line can be used
 * to visualize the overall direction of change in SPC charts.
 *
 * Mathematical approach:
 * - Uses the least squares method to find the line y = mx + b that best fits the data
 * - Slope (m) = (n·Σ(xy) - Σx·Σy) / (n·Σ(x²) - (Σx)²)
 * - Intercept (b) = (Σy - m·Σx) / n
 *
 * @param values - Array of numeric data points to fit the trend line to
 * @returns Array of trend line values corresponding to each input point, or empty array if input is empty
 *
 * @example
 * ```typescript
 * const data = [10, 12, 15, 14, 18, 20];
 * const trend = calculateTrendLine(data);
 * // Returns [10.34, 12.34, 14.34, 16.34, 18.34, 20.34]
 * // Showing an upward trend with slope ≈ 2
 * ```
 */
export default function calculateTrendLine(values: number[]): number[] {
  const n: number = values.length;

  // Handle edge case: empty input
  if (n === 0) return [];

  // Initialize accumulator variables for least squares calculation
  let sumY = 0;   // Sum of y-values (data points)
  let sumX = 0;   // Sum of x-values (positions: 1, 2, 3, ...)
  let sumXY = 0;  // Sum of x·y products
  let sumX2 = 0;  // Sum of x² (squared positions)

  // First pass: Calculate all sums needed for least squares regression
  for (let i = 0; i < n; i++) {
    const x = i + 1;        // Position (1-indexed for better numerical properties)
    const y = values[i];    // Data value at this position

    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  }

  // Calculate slope using least squares formula
  // slope = (n·Σ(xy) - Σx·Σy) / (n·Σ(x²) - (Σx)²)
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  // Calculate y-intercept
  // intercept = (Σy - slope·Σx) / n
  const intercept = (sumY - slope * sumX) / n;

  // Second pass: Generate trend line values using y = mx + b
  const trendLine: number[] = [];
  for (let i = 0; i < n; i++) {
    // Calculate predicted y-value for each x position
    trendLine.push(slope * (i + 1) + intercept);
  }

  return trendLine;
}
