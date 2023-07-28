export default function diff(x: number[]): number[] {
  return x.map((d, idx, arr) =>
    (idx > 0) ? d - arr[idx - 1] : null
  );
}
