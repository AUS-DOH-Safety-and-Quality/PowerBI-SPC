/**
 * Returns an array of consecutive differences between elements of the
 * input array.
 *
 * @param x - The input array of numbers.
 * @returns An array of consecutive differences.
 */
export default function diff(x: number[]): number[] {
  const n: number = x.length;
  if (n === 0) {
    return [];
  }
  let result: number[] = new Array<number>(n);
  result[0] = null;
  for (let i = 1; i < n; i++) {
    result[i] = x[i] - x[i - 1];
  }
  return result;
}
