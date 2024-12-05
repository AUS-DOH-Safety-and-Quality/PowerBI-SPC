import { sqrt, rep, mean, median, extractValues } from "../Functions";
import { type controlLimitsObject, type controlLimitsArgs } from "../Classes";

/**
 * Calculates the control limits for an SPC G Chart.
 *
 * The control limits for a G Chart are calculated using:
 * - Center Line (CL): mean(numerators)
 * - Sigma (σ): sqrt(CL * (CL + 1))
 * - Lower Control Limit (LCL): 0 (G Charts do not have a lower control limit)
 * - Upper Control Limit (UCL): CL + 3*σ
 *
 * Note:
 *  - While the control limits are calculated using the mean of the numerators,
 *      the median is used as the target to reduce the impact of skewed data.
 *  - The control limits are truncated to 0 if they fall below 0.
 *
 * @param {controlLimitsArgs} args - The arguments for calculating control limits.
 * It includes keys (categories), and numerators (values for each category).
 * @returns {controlLimitsObject} An object containing the keys, values, targets (center line),
 * and the lower and upper control limits for both 95% and 99% confidence intervals.
 */
export default function gLimits(args: controlLimitsArgs): controlLimitsObject {
  const cl: number = mean(extractValues(args.numerators, args.subset_points));
  const sigma: number = sqrt(cl * (cl + 1));

  return {
    keys: args.keys,
    values: args.numerators,
    targets: rep(median(extractValues(args.numerators, args.subset_points)), args.keys.length),
    ll99: rep(0, args.keys.length),
    ll95: rep(0, args.keys.length),
    ll68: rep(0, args.keys.length),
    ul68: rep(cl + 1*sigma, args.keys.length),
    ul95: rep(cl + 2*sigma, args.keys.length),
    ul99: rep(cl + 3*sigma, args.keys.length)
  };
}
