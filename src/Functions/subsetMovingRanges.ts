/** The subset's values in order, and the absolute differences between consecutive ones */
export default function subsetMovingRanges(values: readonly number[], subset_points: readonly number[]): { readonly subset: number[]; readonly ranges: number[] } {
  const n_sub: number = subset_points.length;
  const subset: number[] = new Array<number>(n_sub);
  const ranges: number[] = new Array<number>(n_sub - 1);
  subset[0] = values[subset_points[0]];
  for (let i = 1; i < n_sub; i++) {
    subset[i] = values[subset_points[i]];
    ranges[i - 1] = Math.abs(subset[i] - subset[i - 1]);
  }
  return { subset, ranges };
}
