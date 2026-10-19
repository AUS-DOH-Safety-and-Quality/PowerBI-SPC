import averageMovingRange from "./averageMovingRange";

/** Laney's sigma_z: the subset z-scores' average moving range / d2 (1.128 for n = 2) */
export default function laneySigmaMultiplier(values: readonly number[], cl: number, sd: readonly number[],
                                             subset_points: readonly number[], outliers_in_limits: boolean | undefined): number {
  const consec_diff: number[] = new Array<number>(subset_points.length - 1);
  let prevZ: number = (values[subset_points[0]] - cl) / sd[subset_points[0]];
  for (let i = 1; i < subset_points.length; i++) {
    const currZ: number = (values[subset_points[i]] - cl) / sd[subset_points[i]];
    consec_diff[i - 1] = Math.abs(currZ - prevZ);
    prevZ = currZ;
  }
  return averageMovingRange(consec_diff, outliers_in_limits) / 1.128;
}
