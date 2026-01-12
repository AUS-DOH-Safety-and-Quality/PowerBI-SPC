import { b3, b4 } from "../Functions/sampleConstants";
import type { controlLimitsObject, controlLimitsArgs } from "../Classes/viewModelClass";

/**
 * Calculates control limits for an S-chart (Standard Deviation chart).
 *
 * The S-chart is used to monitor the process variability (standard deviation) over time
 * when subgroup sizes are greater than 10, or when subgroup sizes vary. It plots the
 * standard deviation of each subgroup and calculates control limits based on a pooled
 * estimate of the process standard deviation.
 *
 * **Centreline Calculation:**
 * The centreline (s̄) is the pooled standard deviation across all subgroups:
 *
 * $$\bar{s} = \sqrt{\frac{\sum_{i=1}^{k} (n_i - 1) s_i^2}{\sum_{i=1}^{k} (n_i - 1)}}$$
 *
 * where $s_i$ is the standard deviation and $n_i$ is the sample size for subgroup $i$.
 * This weighted pooling by degrees of freedom properly accounts for varying subgroup sizes.
 *
 * **Sigma (Standard Deviation) Calculation:**
 * The standard deviation of the sample standard deviation is:
 *
 * $$\sigma_s = \bar{s} \cdot \frac{c_5(n)}{c_4(n)}$$
 *
 * where $c_4$ and $c_5$ are bias correction constants derived from the chi-square distribution.
 *
 * **Control Limits:**
 * - Upper Control Limit (3σ): $UCL_i = B_4(n_i, 3) \cdot \bar{s}$ where $B_4 = 1 + \frac{3 c_5(n)}{c_4(n)}$
 * - Lower Control Limit (3σ): $LCL_i = B_3(n_i, 3) \cdot \bar{s}$ where $B_3 = 1 - \frac{3 c_5(n)}{c_4(n)}$
 *
 * Note: $B_3$ can be negative for small sample sizes, resulting in $LCL = 0$.
 *
 * @param args - The control limits calculation arguments
 * @param args.numerators - Array of standard deviations for each subgroup (plotted values)
 * @param args.denominators - Array of sample sizes (counts) for each subgroup
 * @param args.keys - Array of key objects containing x-position, id, and label for each point
 * @param args.subset_points - Array of indices indicating which points to include in limit calculations
 *
 * @returns A controlLimitsObject containing:
 *   - keys: The input keys passed through
 *   - values: The subgroup standard deviations (plotted on the chart)
 *   - targets: The centreline (pooled standard deviation) for each point
 *   - ll99/ul99: Lower/Upper 3-sigma control limits
 *   - ll95/ul95: Lower/Upper 2-sigma warning limits
 *   - ll68/ul68: Lower/Upper 1-sigma limits
 *
 * @example
 * // For 3 subgroups with SDs [2.0, 1.5, 1.8] and sizes [10, 10, 10]:
 * // Pooled SD s̄ = √[(9×4 + 9×2.25 + 9×3.24) / 27] = √3.16 ≈ 1.78
 * // For n=10: B3(10,3) ≈ 0.284, B4(10,3) ≈ 1.716
 * // UCL = 1.716 × 1.78 ≈ 3.05
 * // LCL = 0.284 × 1.78 ≈ 0.51
 *
 * @see {@link https://en.wikipedia.org/wiki/Xbar_and_s_chart} for S-chart theory
 */
export default function sLimits(args: controlLimitsArgs): controlLimitsObject {
  // Extract input arrays from arguments
  const group_sd: number[] = args.numerators;       // Standard deviation of each subgroup
  const count_per_group: number[] = args.denominators; // Sample size of each subgroup
  const n_sub: number = args.subset_points.length;  // Number of points used for limit calculation

  // Accumulators for pooled variance calculation
  let Nm1_sum: number = 0;           // Sum of degrees of freedom (n-1) across subgroups
  let weighted_sd_sum: number = 0;   // Sum of (n-1) * variance for pooled variance

  // Calculate pooled variance components using only the subset points
  // The pooled variance formula is: s_pooled² = Σ[(n_i - 1) * s_i²] / Σ(n_i - 1)
  for (let i = 0; i < n_sub; i++) {
    const curr_count: number = count_per_group[args.subset_points[i]];
    const curr_sd: number = group_sd[args.subset_points[i]];
    const Nm1: number = curr_count - 1; // Degrees of freedom for this subgroup

    Nm1_sum += Nm1;
    weighted_sd_sum += Nm1 * Math.pow(curr_sd, 2); // Weight variance by degrees of freedom
  }

  // Calculate pooled (weighted) standard deviation - this becomes the centreline
  // cl = sqrt(pooled variance) = sqrt(Σ[(n-1)*s²] / Σ(n-1))
  const cl: number = Math.sqrt(weighted_sd_sum / Nm1_sum);

  const n: number = args.keys.length; // Total number of data points

  // Initialize the return object with arrays for all limit lines
  let rtn: controlLimitsObject = {
    keys: args.keys,
    values: group_sd,              // The plotted values (subgroup SDs)
    targets: new Array<number>(n), // Centreline (pooled SD)
    ll99: new Array<number>(n),    // Lower 3-sigma limit
    ll95: new Array<number>(n),    // Lower 2-sigma limit
    ll68: new Array<number>(n),    // Lower 1-sigma limit
    ul68: new Array<number>(n),    // Upper 1-sigma limit
    ul95: new Array<number>(n),    // Upper 2-sigma limit
    ul99: new Array<number>(n)     // Upper 3-sigma limit
  }

  // Calculate control limits for each point
  // Limits depend on subgroup size via B3 and B4 constants
  // B3 = 1 - (k * c5/c4), B4 = 1 + (k * c5/c4), where k is the sigma multiplier
  for (let i = 0; i < n; i++) {
    rtn.targets[i] = cl;
    rtn.ll99[i] = cl * b3(count_per_group[i], 3); // 3-sigma lower limit
    rtn.ll95[i] = cl * b3(count_per_group[i], 2); // 2-sigma lower limit
    rtn.ll68[i] = cl * b3(count_per_group[i], 1); // 1-sigma lower limit
    rtn.ul68[i] = cl * b4(count_per_group[i], 1); // 1-sigma upper limit
    rtn.ul95[i] = cl * b4(count_per_group[i], 2); // 2-sigma upper limit
    rtn.ul99[i] = cl * b4(count_per_group[i], 3); // 3-sigma upper limit
  }

  return rtn;
}
