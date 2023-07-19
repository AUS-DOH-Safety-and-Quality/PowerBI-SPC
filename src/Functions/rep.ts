export default function rep<T>(x: T, n: number) : T[] {
  return Array<T>(n).fill(x);
}
