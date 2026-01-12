/**
 * Calculates the mean (average) of an array of numbers.
 *
 * @param {number[]} values - An array of numbers to calculate the mean for.
 * @returns {number} The mean of the input numbers. Returns NaN if the input array is empty.
 */
export default function mean(values: number[]): number {
  const n: number = values.length;
  if (n === 0) {
    return Number.NaN;
  }
  let sum: number = 0;
  for (let i: number = 0; i < n; i++) {
    sum += values[i];
  }
  return sum / n;
}
