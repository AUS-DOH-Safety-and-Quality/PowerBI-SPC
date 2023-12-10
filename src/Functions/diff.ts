/**
 * Returns an array of consecutive differences between elements of the
 * input array.
 *
 * @param x - The input array of numbers.
 * @returns An array of consecutive differences.
 */
export default function diff(x: number[]): number[] {
  return x.map((d, idx, arr) =>
    (idx > 0) ? d - arr[idx - 1] : null
  );
}
