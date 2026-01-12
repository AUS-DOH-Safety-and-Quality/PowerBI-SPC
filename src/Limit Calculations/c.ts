import type { controlLimitsObject, controlLimitsArgs } from "../Classes/viewModelClass";

/**
 * Calculates control limits for a C-chart (Count chart).
 *
 * The C-chart is used to monitor the count of defects (or events) per unit when the
 * sample size (area of opportunity) is constant. It assumes the data follows a Poisson
 * distribution, where the mean and variance are equal.
 *
 * **Centreline Calculation:**
 * The centreline (c̄) is the average count across all subgroups:
 *
 * $$\bar{c} = \frac{\sum_{i=1}^{n} c_i}{n}$$
 *
 * where $c_i$ is the count for subgroup $i$ and $n$ is the number of subgroups.
 *
 * **Sigma (Standard Deviation) Calculation:**
 * For a Poisson distribution, the standard deviation equals the square root of the mean:
 *
 * $$\sigma = \sqrt{\bar{c}}$$
 *
 * **Control Limits:**
 * - Upper Control Limit (3σ): $UCL = \bar{c} + 3\sigma = \bar{c} + 3\sqrt{\bar{c}}$
 * - Lower Control Limit (3σ): $LCL = \max(0, \bar{c} - 3\sqrt{\bar{c}})$
 *
 * Lower limits are truncated at 0 since counts cannot be negative.
 *
 * @param args - The control limits calculation arguments
 * @param args.numerators - Array of counts (defects/events) for each sample
 * @param args.keys - Array of key objects containing x-position, id, and label for each point
 * @param args.subset_points - Array of indices indicating which points to include in limit calculations
 *
 * @returns A controlLimitsObject containing:
 *   - keys: The input keys passed through
 *   - values: The count values (plotted on the chart)
 *   - targets: The centreline (average count) for each point
 *   - ll99/ul99: Lower/Upper 3-sigma control limits
 *   - ll95/ul95: Lower/Upper 2-sigma warning limits
 *   - ll68/ul68: Lower/Upper 1-sigma limits
 *
 * @example
 * // For counts [5, 8, 3, 6, 4] with mean c̄ = 5.2:
 * // σ = √5.2 ≈ 2.28
 * // UCL = 5.2 + 3(2.28) ≈ 12.04
 * // LCL = max(0, 5.2 - 3(2.28)) ≈ 0
 *
 * @see {@link https://en.wikipedia.org/wiki/C-chart} for C-chart theory
 */
export default function cLimits(args: controlLimitsArgs): controlLimitsObject {
  const n_sub: number = args.subset_points.length;  // Number of points used for limit calculation
  const numerators: number[] = args.numerators;     // Count values for each sample
  const subset_points: number[] = args.subset_points; // Indices of points to include

  // Calculate the sum of counts for subset points to compute the centreline
  let cl: number = 0;
  for (let i = 0; i < n_sub; i++) {
    cl += numerators[subset_points[i]];
  }

  // Calculate centreline: c̄ = Σc / n (average count)
  cl = cl / n_sub;

  // Calculate sigma using Poisson distribution property: σ = √c̄
  // For Poisson data, variance = mean, so standard deviation = √mean
  const sigma: number = Math.sqrt(cl);

  const n: number = args.keys.length; // Total number of data points

  // Initialize the return object with arrays for all limit lines
  let rtn: controlLimitsObject = {
    keys: args.keys,
    values: args.numerators,       // The plotted values (counts)
    targets: new Array<number>(n), // Centreline (average count)
    ll99: new Array<number>(n),    // Lower 3-sigma limit
    ll95: new Array<number>(n),    // Lower 2-sigma limit
    ll68: new Array<number>(n),    // Lower 1-sigma limit
    ul68: new Array<number>(n),    // Upper 1-sigma limit
    ul95: new Array<number>(n),    // Upper 2-sigma limit
    ul99: new Array<number>(n)     // Upper 3-sigma limit
  }

  // Calculate control limits for each point
  // C-chart has constant limits (same sigma for all points)
  // Lower limits are truncated at 0 since counts cannot be negative
  for (let i = 0; i < n; i++) {
    rtn.targets[i] = cl;
    rtn.ll99[i] = Math.max(0, cl - 3 * sigma); // LCL = max(0, c̄ - 3σ)
    rtn.ll95[i] = Math.max(0, cl - 2 * sigma); // 2σ lower limit
    rtn.ll68[i] = Math.max(0, cl - 1 * sigma); // 1σ lower limit
    rtn.ul68[i] = cl + 1 * sigma;                          // 1σ upper limit
    rtn.ul95[i] = cl + 2 * sigma;                          // 2σ upper limit
    rtn.ul99[i] = cl + 3 * sigma;                          // UCL = c̄ + 3σ
  }

  return rtn;
}
