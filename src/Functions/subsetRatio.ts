import { at } from "powerbi-visuals-core/util";
/** Ratio of the numerator and denominator totals over the subset */
export default function subsetRatio(numerators: readonly number[], denominators: readonly number[], subset_points: readonly number[]): number {
  let sum_numerators: number = 0;
  let sum_denominators: number = 0;
  for (let i = 0; i < subset_points.length; i++) {
    const point = at(subset_points, i);
    sum_numerators += at(numerators, point);
    sum_denominators += at(denominators, point);
  }
  return sum_numerators / sum_denominators;
}
