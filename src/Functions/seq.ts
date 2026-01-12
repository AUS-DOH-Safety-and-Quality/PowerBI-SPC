/**
 * Generates a sequence of integers from start to end (inclusive).
 *
 * @param start The starting integer of the sequence.
 * @param end The ending integer of the sequence.
 * @returns An array containing the sequence of integers from start to end.
 */
export default function seq(start: number, end: number): number[] {
  const n: number = end - start + 1;
  const result: number[] = new Array<number>(n);
  for (let i: number = start; i <= end; i++) {
    result[i - start] = i;
  }
  return result;
}
