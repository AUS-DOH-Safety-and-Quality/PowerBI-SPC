import { truncate, rep, mean } from "../Functions";
import { type controlLimitsObject, type controlLimitsArgs } from "../Classes";

/**
 * Calculates the control limits for an SPC C Chart.
 *
 * The control limits are calculated using:
 * - Center Line (CL): mean(numerators)
 * - Sigma (σ): sqrt(CL)
 * - Lower Control Limit (LCL): max(CL - 3*σ, 0)
 * - Upper Control Limit (UCL): CL + 3*σ
 *
 * Note: The control limits are truncated to 0 if they fall below 0.
 *
 * @param {controlLimitsArgs} args - The arguments for calculating control limits.
 * It includes keys (categories), and numerators (values for each category).
 * @returns {controlLimitsObject} An object containing the keys, values, targets (center line),
 * and the lower and upper control limits for both 95% and 99% confidence intervals.
 *
 * @example
 * // Returns control limits for the provided data
 * cLimits({ keys: ['a', 'b', 'c'], numerators: [5, 7, 9] })
 */
export default function cLimits(args: controlLimitsArgs): controlLimitsObject {
  const cl: number = mean(args.numerators);
  const sigma: number = Math.sqrt(cl);

  return {
    keys: args.keys,
    values: args.numerators,
    targets: rep(cl, args.keys.length),
    ll99: rep(truncate(cl - 3 * sigma, { lower: 0 }), args.keys.length),
    ll95: rep(truncate(cl - 2 * sigma, { lower: 0 }), args.keys.length),
    ul95: rep(cl + 2*sigma, args.keys.length),
    ul99: rep(cl + 3*sigma, args.keys.length),
  };
}
