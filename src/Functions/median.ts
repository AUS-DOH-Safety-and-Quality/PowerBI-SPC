/**
 * Calculates the median of an array of numbers.
 *
 * @param {number[]} values - An array of numbers to calculate the median for.
 * @returns {number} The median of the input numbers. Returns NaN if the input array is empty.
 */
export default function median(values: number[]): number {
  const n: number = values.length;
  if (n === 0) {
    return Number.NaN;
  }
  const sortedValues: number[] = [...values].sort((a: number, b: number) => a - b);
  const mid: number = Math.floor(n / 2);
  if (n % 2 === 0) {
    return (sortedValues[mid - 1] + sortedValues[mid]) / 2;
  } else {
    return sortedValues[mid];
  }
}
