/**
 * Calculates the maximum value from an array of numbers.
 *
 * @param {number[]} values - An array of numbers to find the maximum value from.
 * @returns {number} The maximum value from the input numbers. Returns -Infinity if the input array is empty.
 */
export default function max(values: number[]): number {
  return Math.max(...values);
}
