import { a3 } from "../Functions/sampleConstants";
import type { controlLimitsObject, controlLimitsArgs } from "../Classes/viewModelClass";

/**
 * Calculates control limits for an X-bar chart (Mean chart).
 *
 * The X-bar chart is used to monitor the process mean over time. It plots the mean
 * of each subgroup and calculates control limits based on both the overall process
 * mean and the pooled within-subgroup variability. This implementation uses the
 * X-bar and S method (as opposed to X-bar and R), which is preferred when subgroup
 * sizes are larger than 10 or vary between subgroups.
 *
 * **Centreline Calculation:**
 * The centreline (grand mean) is the weighted average of subgroup means:
 *
 * $$\bar{\bar{x}} = \frac{\sum_{i=1}^{k} n_i \bar{x}_i}{\sum_{i=1}^{k} n_i}$$
 *
 * where $\bar{x}_i$ is the mean and $n_i$ is the sample size for subgroup $i$.
 *
 * **Sigma (Standard Deviation) Calculation:**
 * The pooled standard deviation is calculated from within-subgroup variances:
 *
 * $$s_{pooled} = \sqrt{\frac{\sum_{i=1}^{k} (n_i - 1) s_i^2}{\sum_{i=1}^{k} (n_i - 1)}}$$
 *
 * where $s_i$ is the standard deviation for subgroup $i$.
 *
 * The standard error of the mean for each subgroup is then:
 *
 * $$\sigma_{\bar{x}_i} = \frac{s_{pooled}}{c_4(n_i) \sqrt{n_i}} = \frac{A_3(n_i) \cdot s_{pooled}}{3}$$
 *
 * **Control Limits:**
 * - Upper Control Limit (3σ): $UCL_i = \bar{\bar{x}} + A_3(n_i) \cdot s_{pooled}$
 * - Lower Control Limit (3σ): $LCL_i = \bar{\bar{x}} - A_3(n_i) \cdot s_{pooled}$
 *
 * where $A_3(n) = \frac{3}{c_4(n) \sqrt{n}}$ is a sample-size dependent constant.
 *
 * @param args - The control limits calculation arguments
 * @param args.numerators - Array of subgroup means (plotted values)
 * @param args.denominators - Array of sample sizes (counts) for each subgroup
 * @param args.xbar_sds - Array of standard deviations for each subgroup
 * @param args.keys - Array of key objects containing x-position, id, and label for each point
 * @param args.subset_points - Array of indices indicating which points to include in limit calculations
 *
 * @returns A controlLimitsObject containing:
 *   - keys: The input keys passed through
 *   - values: The subgroup means (plotted on the chart)
 *   - targets: The centreline (grand mean) for each point
 *   - ll99/ul99: Lower/Upper 3-sigma control limits
 *   - ll95/ul95: Lower/Upper 2-sigma warning limits
 *   - ll68/ul68: Lower/Upper 1-sigma limits
 *   - count: The sample size for each subgroup
 *
 * @example
 * // For 3 subgroups with means [10, 12, 11], sizes [5, 5, 5], and SDs [2, 1.5, 1.8]:
 * // Grand mean x̄̄ = (5×10 + 5×12 + 5×11) / 15 = 11
 * // Pooled SD = √[(4×4 + 4×2.25 + 4×3.24) / 12] = √3.16 ≈ 1.78
 * // A3(5) ≈ 1.427
 * // UCL = 11 + 1.427 × 1.78 ≈ 13.54
 * // LCL = 11 - 1.427 × 1.78 ≈ 8.46
 *
 * @see {@link https://en.wikipedia.org/wiki/Xbar_and_s_chart} for X-bar and S chart theory
 */
export default function xbarLimits(args: controlLimitsArgs): controlLimitsObject {
  // Extract input arrays from arguments
  const count_per_group: number[] = args.denominators;  // Sample size of each subgroup
  const group_means: number[] = args.numerators;        // Mean of each subgroup
  const group_sd: number[] = args.xbar_sds;             // Standard deviation of each subgroup
  const n_sub: number = args.subset_points.length;      // Number of points used for limit calculation
  const subset_points: number[] = args.subset_points;   // Indices of points to use

  // Accumulators for pooled variance and grand mean calculations
  let Nm1_sum: number = 0;           // Sum of degrees of freedom (n-1) across subgroups
  let weighted_sd_sum: number = 0;   // Sum of (n-1) * variance for pooled variance
  let weighted_mean_sum: number = 0; // Sum of n * mean for grand mean calculation
  let total_count: number = 0;       // Total observations across all subgroups

  // Calculate pooled variance and grand mean components using only the subset points
  // Pooled variance formula: s_pooled² = Σ[(n_i - 1) * s_i²] / Σ(n_i - 1)
  // Grand mean formula: x̄̄ = Σ(n_i * x̄_i) / Σ(n_i)
  for (let i = 0; i < n_sub; i++) {
    const curr_count: number = count_per_group[subset_points[i]];
    const curr_mean: number = group_means[subset_points[i]];
    const curr_sd: number = group_sd[subset_points[i]];
    const Nm1: number = curr_count - 1; // Degrees of freedom for this subgroup

    Nm1_sum += Nm1;
    weighted_sd_sum += Nm1 * Math.pow(curr_sd, 2); // Weight variance by degrees of freedom
    weighted_mean_sum += curr_count * curr_mean;   // Weight mean by sample size
    total_count += curr_count;
  }

  // Calculate pooled standard deviation (used for control limit width)
  // sd = sqrt(pooled variance) = sqrt(Σ[(n-1)*s²] / Σ(n-1))
  const sd: number = Math.sqrt(weighted_sd_sum / Nm1_sum);

  // Calculate grand mean (weighted average of subgroup means) - this becomes the centreline
  // cl = Σ(n_i * x̄_i) / Σ(n_i)
  const cl: number = weighted_mean_sum / total_count;

  const n: number = args.keys.length; // Total number of data points

  // Initialize the return object with arrays for all limit lines
  let rtn: controlLimitsObject = {
    keys: args.keys,
    values: group_means,           // The plotted values (subgroup means)
    targets: new Array<number>(n), // Centreline (grand mean)
    ll99: new Array<number>(n),    // Lower 3-sigma limit
    ll95: new Array<number>(n),    // Lower 2-sigma limit
    ll68: new Array<number>(n),    // Lower 1-sigma limit
    ul68: new Array<number>(n),    // Upper 1-sigma limit
    ul95: new Array<number>(n),    // Upper 2-sigma limit
    ul99: new Array<number>(n),    // Upper 3-sigma limit
    count: count_per_group         // Sample sizes for reference
  }

  // Calculate control limits for each point
  // Limits depend on subgroup size via the A3 constant
  // A3 = 3 / (c4 * sqrt(n)), which converts pooled SD to 3-sigma limit distance
  for (let i = 0; i < n; i++) {
    // A3 * sd gives the 3-sigma distance from centreline
    // A3 accounts for: (1) converting SD to standard error (÷sqrt(n))
    //                  (2) bias correction via c4
    //                  (3) 3-sigma multiplier
    const A3_sd: number = a3(count_per_group[i]) * sd;

    // Divide by 3 to get 1-sigma distance, then multiply for different limit levels
    const A3_sd_div_3: number = (A3_sd / 3);

    rtn.targets[i] = cl;                      // Centreline (grand mean)
    rtn.ll99[i] = cl - A3_sd;                 // Lower 3-sigma limit
    rtn.ll95[i] = cl - A3_sd_div_3 * 2;       // Lower 2-sigma limit
    rtn.ll68[i] = cl - A3_sd_div_3;           // Lower 1-sigma limit
    rtn.ul68[i] = cl + A3_sd_div_3;           // Upper 1-sigma limit
    rtn.ul95[i] = cl + A3_sd_div_3 * 2;       // Upper 2-sigma limit
    rtn.ul99[i] = cl + A3_sd;                 // Upper 3-sigma limit
  }

  return rtn;
}
