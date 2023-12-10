/**
 * Creates an array with `n` elements, where each element is a copy of the
 * provided value `x`.
 *
 * @template T The type of the value `x`.
 * @param x The value to be repeated.
 * @param n The number of times the value should be repeated.
 * @returns An array containing `n` copies of the value `x`.
 */
export default function rep<T>(x: T, n: number) : T[] {
  return Array<T>(n).fill(x);
}
