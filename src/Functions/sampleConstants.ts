import lgamma from "../Functions/lgamma";
import isNullOrUndefined from "../Functions/isNullOrUndefined";

/**
 * Calculates the c4 bias correction factor for sample standard deviation.
 *
 * The sample standard deviation is a biased estimator of the population standard deviation.
 * The c4 constant is used to correct this bias. Specifically, E[s] = c4 * σ, where s is the
 * sample standard deviation and σ is the population standard deviation.
 *
 * The formula is: c4(n) = sqrt(2/(n-1)) * Γ(n/2) / Γ((n-1)/2)
 *
 * where Γ is the gamma function.
 *
 * @param sampleSize - The sample size (n). Must be greater than 1.
 * @returns The c4 constant for the given sample size, or null if sampleSize <= 1 or is invalid.
 *
 * @example
 * c4(2)  // ≈ 0.7979
 * c4(5)  // ≈ 0.9400
 * c4(25) // ≈ 0.9896
 *
 * @see {@link https://en.wikipedia.org/wiki/Unbiased_estimation_of_standard_deviation}
 */
export function c4(sampleSize: number): number {
  if ((sampleSize <= 1) || isNullOrUndefined(sampleSize)) {
    return null;
  }
  const Nminus1: number = sampleSize - 1;

  // c4 = sqrt(2/(n-1)) * exp(lgamma(n/2) - lgamma((n-1)/2))
  // Using lgamma (log-gamma) for numerical stability
  return Math.sqrt(2.0 / Nminus1)
          * Math.exp(lgamma(sampleSize / 2.0) - lgamma(Nminus1 / 2.0));
}

/**
 * Calculates the c5 constant, which represents the relative variability of the sample
 * standard deviation.
 *
 * The c5 constant is derived from c4 and represents the coefficient of variation of the
 * sample standard deviation. It is used in calculating control limits for S-charts.
 *
 * The formula is: c5(n) = sqrt(1 - c4(n)²)
 *
 * @param sampleSize - The sample size (n). Must be greater than 1.
 * @returns The c5 constant for the given sample size.
 *
 * @example
 * c5(2)  // ≈ 0.6028
 * c5(5)  // ≈ 0.3412
 * c5(25) // ≈ 0.1440
 */
export function c5(sampleSize: number): number {
  return Math.sqrt(1 - Math.pow(c4(sampleSize), 2));
}

/**
 * Calculates the A3 constant for X-bar chart control limits when using the S method.
 *
 * The A3 constant is used to calculate control limits for an X-bar chart based on the
 * pooled standard deviation. It accounts for both the conversion from standard deviation
 * to standard error of the mean and the bias correction via c4.
 *
 * The formula is: A3(n) = 3 / (c4(n) * sqrt(n))
 *
 * This gives the 3-sigma distance from the centreline when multiplied by the pooled
 * standard deviation: UCL/LCL = x̄̄ ± A3 * s̄
 *
 * @param sampleSize - The sample size (n). Must be greater than 1.
 * @returns The A3 constant for the given sample size.
 *
 * @example
 * a3(2)  // ≈ 2.659
 * a3(5)  // ≈ 1.427
 * a3(25) // ≈ 0.606
 *
 * @see {@link https://en.wikipedia.org/wiki/Xbar_and_s_chart}
 */
export function a3(sampleSize: number): number {
  const filt_samp: number = sampleSize  <= 1 ? null : sampleSize;
  return 3.0 / (c4(filt_samp) * Math.sqrt(filt_samp));
}

/**
 * Helper function for calculating B3 and B4 constants.
 *
 * Computes the ratio (sigma * c5) / c4, which represents the distance from 1 used
 * to calculate B3 (lower) and B4 (upper) constants.
 *
 * @param sampleSize - The sample size (n).
 * @param sigma - The sigma multiplier (1 for 68% limits, 2 for 95% limits, 3 for 99.7% limits).
 * @returns The helper value used to compute B3 and B4.
 *
 * @internal
 */
function b_helper(sampleSize: number, sigma: number): number {
  return (sigma * c5(sampleSize)) / c4(sampleSize);
}

/**
 * Calculates the B3 constant for the lower control limit of an S-chart.
 *
 * The B3 constant is a multiplier applied to the average sample standard deviation (s̄)
 * to calculate the lower control limit for an S-chart: LCL = B3 * s̄
 *
 * The formula is: B3(n, k) = 1 - k * c5(n) / c4(n)
 *
 * where k is the sigma multiplier. Note that B3 can be negative for small sample sizes,
 * in which case the lower control limit is typically set to 0.
 *
 * @param sampleSize - The sample size (n). Must be greater than 1.
 * @param sigma - The sigma multiplier (1, 2, or 3 for 1σ, 2σ, or 3σ limits).
 * @returns The B3 constant for the given sample size and sigma level.
 *
 * @example
 * b3(5, 3)  // ≈ -0.089 (would use 0 in practice)
 * b3(10, 3) // ≈ 0.284
 * b3(25, 3) // ≈ 0.565
 *
 * @see {@link https://en.wikipedia.org/wiki/Xbar_and_s_chart}
 */
export function b3(sampleSize: number, sigma: number): number {
  return 1 - b_helper(sampleSize, sigma);
}

/**
 * Calculates the B4 constant for the upper control limit of an S-chart.
 *
 * The B4 constant is a multiplier applied to the average sample standard deviation (s̄)
 * to calculate the upper control limit for an S-chart: UCL = B4 * s̄
 *
 * The formula is: B4(n, k) = 1 + k * c5(n) / c4(n)
 *
 * where k is the sigma multiplier.
 *
 * @param sampleSize - The sample size (n). Must be greater than 1.
 * @param sigma - The sigma multiplier (1, 2, or 3 for 1σ, 2σ, or 3σ limits).
 * @returns The B4 constant for the given sample size and sigma level.
 *
 * @example
 * b4(5, 3)  // ≈ 2.089
 * b4(10, 3) // ≈ 1.716
 * b4(25, 3) // ≈ 1.435
 *
 * @see {@link https://en.wikipedia.org/wiki/Xbar_and_s_chart}
 */
export function b4(sampleSize: number, sigma: number): number {
  return 1 + b_helper(sampleSize, sigma);
}
