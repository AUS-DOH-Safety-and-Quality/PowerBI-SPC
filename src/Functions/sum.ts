/**
 * Calculates the sum of an array of numbers.
 *
 * @param {number[]} values - An array of numbers to calculate the sum for.
 * @returns {number} The sum of the input numbers. Returns 0 if the input array is empty.
 */
export default function sum(values: number[]): number {
  let total: number = 0;
  for (let i = 0; i < values.length; i++) {
    total += values[i];
  }
  return total;
}
