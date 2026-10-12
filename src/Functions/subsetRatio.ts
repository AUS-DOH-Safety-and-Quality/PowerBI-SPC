/** Ratio of the numerator and denominator totals over the subset */
export default function subsetRatio(numerators: readonly number[], denominators: readonly number[], subset_points: readonly number[]): number {
  let sum_numerators: number = 0;
  let sum_denominators: number = 0;
  for (let i = 0; i < subset_points.length; i++) {
    sum_numerators += numerators[subset_points[i]];
    sum_denominators += denominators[subset_points[i]];
  }
  return sum_numerators / sum_denominators;
}
