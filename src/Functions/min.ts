/**
 * Calculates the minimum value from an array of numbers.
 *
 * @param {number[]} values - An array of numbers to find the minimum value from.
 * @returns {number} The minimum value from the input numbers. Returns Infinity if the input array is empty.
 */
export default function min(values: number[]): number {
  return Math.min(...values);
}
