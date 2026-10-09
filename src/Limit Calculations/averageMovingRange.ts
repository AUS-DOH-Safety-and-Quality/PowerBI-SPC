/** Mean moving range; unless outliers_in_limits, re-averaged without ranges at or above D4 * mean (3.267). */
export default function averageMovingRange(consec_diff: readonly number[], outliers_in_limits: boolean | undefined): number {
  let amr: number = 0;
  for (let i = 0; i < consec_diff.length; i++) {
    amr += consec_diff[i];
  }
  amr /= consec_diff.length;

  if (!outliers_in_limits && amr > 0) {
    const consec_diff_ulim: number = amr * 3.267;
    let screened_amr: number = 0;
    let screened_count: number = 0;
    for (let i = 0; i < consec_diff.length; i++) {
      if (consec_diff[i] < consec_diff_ulim) {
        screened_amr += consec_diff[i];
        screened_count += 1;
      }
    }
    amr = screened_amr / screened_count;
  }
  return amr;
}
