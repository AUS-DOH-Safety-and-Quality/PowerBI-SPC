import type { controlLimitsArgs } from "../../src/Classes/viewModelClass";

/**
 * Builds a controlLimitsArgs object for directly testing limit calculation functions
 * without needing to go through the Visual/DOM pipeline.
 *
 * @param opts - Input data for the limit calculation.
 * @param opts.keys - String labels for each data point (e.g., dates).
 * @param opts.numerators - Numeric values (raw or numerator for ratios).
 * @param opts.denominators - Optional denominators for ratio-based charts (p, u, xbar).
 * @param opts.xbar_sds - Optional standard deviations for xbar/s charts.
 * @param opts.subset_points - Optional indices of points to include in limit calculation.
 *   Defaults to all points [0, 1, ..., n-1].
 * @param opts.outliers_in_limits - Whether to include outliers in limit calculation.
 *   Defaults to true.
 * @returns A fully populated controlLimitsArgs object.
 */
export default function buildControlLimitsArgs(opts: {
  keys: string[];
  numerators: number[];
  denominators?: number[];
  xbar_sds?: number[];
  subset_points?: number[];
  outliers_in_limits?: boolean;
}): controlLimitsArgs {
  const n = opts.keys.length;
  const keys = opts.keys.map((label, i) => ({ x: i, id: i, label: label }));
  const subset_points = opts.subset_points ?? Array.from({ length: n }, (_, i) => i);
  const outliers_in_limits = opts.outliers_in_limits ?? true;

  return {
    keys: keys,
    numerators: opts.numerators,
    denominators: opts.denominators,
    xbar_sds: opts.xbar_sds,
    subset_points: subset_points,
    outliers_in_limits: outliers_in_limits
  };
}
