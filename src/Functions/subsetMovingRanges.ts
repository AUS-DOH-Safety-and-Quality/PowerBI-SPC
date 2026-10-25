import { at } from "powerbi-visuals-core/util";
/** The subset's values in order, and the absolute differences between consecutive ones */
export default function subsetMovingRanges(values: readonly number[], subset_points: readonly number[]): { readonly subset: number[]; readonly ranges: number[] } {
  const n_sub: number = subset_points.length;
  const subset: number[] = new Array<number>(n_sub);
  const ranges: number[] = new Array<number>(n_sub - 1);
  let previous = at(values, at(subset_points, 0));
  subset[0] = previous;
  for (let i = 1; i < n_sub; i++) {
    const current = at(values, at(subset_points, i));
    subset[i] = current;
    ranges[i - 1] = Math.abs(current - previous);
    previous = current;
  }
  return { subset, ranges };
}
