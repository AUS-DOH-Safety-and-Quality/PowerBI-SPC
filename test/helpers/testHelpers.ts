/**
 * Common Test Helpers
 * 
 * Centralized helper functions used across multiple test files.
 * This file consolidates duplicated helper functions to ensure consistency
 * and maintainability across the test suite.
 */

/**
 * Create an array of indices from 0 to n-1
 * 
 * @param n - Length of the array
 * @returns Array of indices [0, 1, 2, ..., n-1]
 * 
 * @example
 * allIndices(3) // [0, 1, 2]
 * allIndices(5) // [0, 1, 2, 3, 4]
 */
export function allIndices(n: number): number[] {
  return Array.from({ length: n }, (_, i) => i);
}

/**
 * Create keys array in the format expected by limit calculation functions
 * 
 * @param n - Number of keys to create OR array of labels
 * @returns Array of key objects with x, id, and label properties
 * 
 * @example
 * createKeys(3) // [{ x: 0, id: 0, label: "0" }, { x: 1, id: 1, label: "1" }, { x: 2, id: 2, label: "2" }]
 * createKeys(["A", "B", "C"]) // [{ x: 0, id: 0, label: "A" }, { x: 1, id: 1, label: "B" }, { x: 2, id: 2, label: "C" }]
 */
export function createKeys(n: number | string[]): { x: number, id: number, label: string }[] {
  if (typeof n === "number") {
    return Array.from({ length: n }, (_, i) => ({
      x: i,
      id: i,
      label: String(i)
    }));
  } else {
    return n.map((label, i) => ({
      x: i,
      id: i,
      label: label
    }));
  }
}

/**
 * Measure execution time of a function
 * 
 * @param fn - Function to measure
 * @param iterations - Number of times to run (default: 1)
 * @returns Median execution time in milliseconds
 * 
 * @example
 * const time = measureTime(() => calculateLimits(data), 10);
 * expect(time).toBeLessThan(50);
 */
export function measureTime(fn: () => void, iterations: number = 1): number {
  const times: number[] = [];
  
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    times.push(end - start);
  }
  
  // Return median to reduce outlier impact
  times.sort((a, b) => a - b);
  const mid = Math.floor(times.length / 2);
  return times.length % 2 === 0
    ? (times[mid - 1] + times[mid]) / 2
    : times[mid];
}

/**
 * Generate realistic test data using Box-Muller transform for normal distribution
 * 
 * @param n - Number of data points to generate
 * @param mean - Mean of the distribution (default: 50)
 * @param stddev - Standard deviation (default: 10)
 * @returns Array of normally distributed random numbers
 * 
 * @example
 * const data = generateData(100); // 100 points, mean 50, stddev 10
 * const data = generateData(50, 100, 5); // 50 points, mean 100, stddev 5
 */
export function generateData(n: number, mean: number = 50, stddev: number = 10): number[] {
  return Array.from({ length: n }, () => {
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return Math.max(0, mean + z * stddev);
  });
}

/**
 * Conditional test runner - runs test only when RUN_FAILING_TESTS environment variable is set
 * 
 * Use this to gate tests that document known bugs or failures.
 * 
 * @example
 * itFailing("should handle division by zero", () => {
 *   // This test fails due to known bug
 *   const result = divide(10, 0);
 *   expect(result).toBeNull(); // Currently returns Infinity
 * });
 * 
 * // Run with: RUN_FAILING_TESTS=true npm test
 * // Or: npm run test:failing
 */
export const itFailing = typeof process !== 'undefined' && process.env.RUN_FAILING_TESTS === "true"
  ? it
  : xit;

/**
 * Create a simple error message expectation helper
 * 
 * @param element - DOM element to check (usually the SVG element)
 * @param message - Expected error message
 * 
 * @example
 * expectError(svgElement, "Invalid data provided");
 */
export function expectError(element: Element, message: string): void {
  const errElement = element.querySelector('.errormessage') as Element;
  expect(errElement).toBeTruthy();
  const errText = errElement.querySelector('text') as Element;
  expect(errText.textContent).toBe(message);
}

/**
 * Create an array filled with a specific value
 * 
 * @param length - Length of array
 * @param value - Value to fill with
 * @returns Array filled with the value
 * 
 * @example
 * createArray(5, 100) // [100, 100, 100, 100, 100]
 */
export function createArray(length: number, value: any): any[] {
  return Array(length).fill(value);
}

/**
 * Create sequential array of labels with a prefix
 * 
 * @param length - Number of labels
 * @param prefix - Prefix for each label (default: "P")
 * @returns Array of labels
 * 
 * @example
 * createLabels(3) // ["P1", "P2", "P3"]
 * createLabels(3, "Week") // ["Week1", "Week2", "Week3"]
 */
export function createLabels(length: number, prefix: string = "P"): string[] {
  return Array.from({ length }, (_, i) => `${prefix}${i + 1}`);
}

/**
 * Create sequential array of day labels for testing time series
 * 
 * @param length - Number of day labels
 * @returns Array of day labels starting from Day 1
 * 
 * @example
 * createDayLabels(3) // ["Day 1", "Day 2", "Day 3"]
 */
export function createDayLabels(length: number): string[] {
  return Array.from({ length }, (_, i) => `Day ${i + 1}`);
}

/**
 * Create grouped test data with multiple indicators
 * 
 * @param pointsPerGroup - Number of points per group
 * @param groups - Array of group names
 * @returns Object with keys and indicators arrays
 * 
 * @example
 * const data = createGroupedData(3, ["A", "B"]);
 * // { keys: ["P1", "P2", "P3", "P1", "P2", "P3"], indicators: ["A", "A", "A", "B", "B", "B"] }
 */
export function createGroupedData(pointsPerGroup: number, groups: string[]): {
  keys: string[],
  indicators: string[]
} {
  const n = pointsPerGroup * groups.length;
  return {
    keys: Array.from({ length: n }, (_, i) => `P${(i % pointsPerGroup) + 1}`),
    indicators: Array.from({ length: n }, (_, i) => groups[Math.floor(i / pointsPerGroup)])
  };
}
