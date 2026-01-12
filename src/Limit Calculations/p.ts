import type { controlLimitsObject, controlLimitsArgs } from "../Classes/viewModelClass";

/**
 * Calculates control limits for a P-chart (Proportion chart).
 *
 * The P-chart is used to monitor the proportion (or percentage) of defective items
 * in a sample when the sample size may vary between subgroups. It assumes the data
 * follows a binomial distribution.
 *
 * **Centreline Calculation:**
 * The centreline (p̄) is the overall proportion of defectives:
 *
 * $$\bar{p} = \frac{\sum_{i=1}^{k} d_i}{\sum_{i=1}^{k} n_i}$$
 *
 * where $d_i$ is the number of defectives and $n_i$ is the sample size for subgroup $i$.
 *
 * **Sigma (Standard Deviation) Calculation:**
 * For a binomial proportion, the standard deviation depends on the sample size:
 *
 * $$\sigma_i = \sqrt{\frac{\bar{p}(1 - \bar{p})}{n_i}}$$
 *
 * This is the standard error of the proportion for subgroup $i$.
 *
 * **Control Limits:**
 * Because sigma varies with sample size, limits are calculated per-point:
 * - Upper Control Limit (3σ): $UCL_i = \min(1, \bar{p} + 3\sigma_i)$
 * - Lower Control Limit (3σ): $LCL_i = \max(0, \bar{p} - 3\sigma_i)$
 *
 * Limits are truncated to [0, 1] since proportions must be between 0 and 1.
 *
 * @param args - The control limits calculation arguments
 * @param args.numerators - Array of defective counts for each sample
 * @param args.denominators - Array of sample sizes for each subgroup
 * @param args.keys - Array of key objects containing x-position, id, and label for each point
 * @param args.subset_points - Array of indices indicating which points to include in limit calculations
 *
 * @returns A controlLimitsObject containing:
 *   - keys: The input keys passed through
 *   - values: The proportion values (defectives/sample size) plotted on the chart
 *   - denominators: The sample sizes for reference
 *   - targets: The centreline (overall proportion) for each point
 *   - ll99/ul99: Lower/Upper 3-sigma control limits (varying with sample size)
 *   - ll95/ul95: Lower/Upper 2-sigma warning limits
 *   - ll68/ul68: Lower/Upper 1-sigma limits
 *
 * @example
 * // For 10 defectives out of 100 samples, p̄ = 0.10:
 * // σ = √(0.10 × 0.90 / 100) = √0.0009 = 0.03
 * // UCL = min(1, 0.10 + 3(0.03)) = 0.19
 * // LCL = max(0, 0.10 - 3(0.03)) = 0.01
 *
 * @see {@link https://en.wikipedia.org/wiki/P-chart} for P-chart theory
 */
export default function pLimits(args: controlLimitsArgs): controlLimitsObject {
  const numerators: number[] = args.numerators;       // Number of defectives in each sample
  const denominators: number[] = args.denominators;   // Sample size for each subgroup
  const subset_points: number[] = args.subset_points; // Indices of points to include
  const n_sub: number = subset_points.length;         // Number of points used for limit calculation

  // Accumulators for calculating overall proportion
  let sum_num: number = 0;  // Total defectives across all subgroups
  let sum_den: number = 0;  // Total sample size across all subgroups

  // Sum up numerators and denominators for subset points
  for (let i = 0; i < n_sub; i++) {
    sum_num += numerators[subset_points[i]];
    sum_den += denominators[subset_points[i]];
  }

  // Calculate centreline: p̄ = Σd / Σn (overall proportion defective)
  const cl: number = sum_num / sum_den;

  // Pre-calculate p̄(1 - p̄) for sigma calculation
  // This is the numerator of the variance formula for binomial proportion
  const cl_mult: number = cl * (1 - cl);

  const n: number = args.keys.length; // Total number of data points

  // Initialize the return object with arrays for all limit lines
  let rtn: controlLimitsObject = {
    keys: args.keys,
    values: new Array<number>(n),      // The plotted values (proportions)
    denominators: args.denominators,    // Sample sizes for reference
    targets: new Array<number>(n),      // Centreline (overall proportion)
    ll99: new Array<number>(n),         // Lower 3-sigma limit
    ll95: new Array<number>(n),         // Lower 2-sigma limit
    ll68: new Array<number>(n),         // Lower 1-sigma limit
    ul68: new Array<number>(n),         // Upper 1-sigma limit
    ul95: new Array<number>(n),         // Upper 2-sigma limit
    ul99: new Array<number>(n)          // Upper 3-sigma limit
  }

  // Calculate control limits for each point
  // P-chart has varying limits because sigma depends on sample size
  for (let i = 0; i < n; i++) {
    // Calculate sigma for this point: σ = √(p̄(1-p̄) / n)
    // This is the standard error of the proportion
    const sigma: number = Math.sqrt(cl_mult / denominators[i]);
    const twoSigma: number = 2 * sigma;
    const threeSigma: number = 3 * sigma;

    // Calculate proportion for this point: p = d / n
    rtn.values[i] = numerators[i] / denominators[i];
    rtn.targets[i] = cl;

    // Lower limits truncated at 0 (proportion cannot be negative)
    rtn.ll99[i] = Math.max(0, cl - threeSigma); // LCL = max(0, p̄ - 3σ)
    rtn.ll95[i] = Math.max(0, cl - twoSigma);   // 2σ lower limit
    rtn.ll68[i] = Math.max(0, cl - sigma);      // 1σ lower limit

    // Upper limits truncated at 1 (proportion cannot exceed 100%)
    rtn.ul68[i] = Math.min(1, cl + sigma);      // 1σ upper limit
    rtn.ul95[i] = Math.min(1, cl + twoSigma);   // 2σ upper limit
    rtn.ul99[i] = Math.min(1, cl + threeSigma); // UCL = min(1, p̄ + 3σ)
  }

  return rtn;
}
