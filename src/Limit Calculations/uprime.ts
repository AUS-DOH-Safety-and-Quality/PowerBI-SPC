import type { controlLimitsObject, controlLimitsArgs } from "../Classes/viewModelClass";

/**
 * Calculates control limits for a U'-chart (standardized U-chart using moving range).
 *
 * The U'-chart is a variation of the U-chart that uses the moving range method to
 * estimate sigma, similar to an I-chart. This makes the chart more robust to local
 * variation and is useful when the standard Poisson assumption may not hold perfectly.
 *
 * **Centreline Calculation:**
 * The centreline (ū) is the overall rate of nonconformities per unit:
 *
 * $$\bar{u} = \frac{\sum_{i=1}^{n} c_i}{\sum_{i=1}^{n} n_i}$$
 *
 * where $c_i$ is the count of nonconformities and $n_i$ is the number of units inspected.
 *
 * **Sigma (Standard Deviation) Calculation:**
 * Unlike the standard U-chart, U' estimates sigma using the moving range of z-scores:
 *
 * $$z_i = \frac{u_i - \bar{u}}{\sqrt{\bar{u}/n_i}}$$
 *
 * $$\sigma_i = \sqrt{\frac{\bar{u}}{n_i}} \times \frac{\overline{MR_z}}{1.128}$$
 *
 * where $\overline{MR_z}$ is the average moving range of the z-scores and $d_2 = 1.128$.
 *
 * Optionally, outliers can be screened from the moving range calculation using:
 * $MR_{limit} = 3.267 \times \overline{MR_z}$ (the upper limit for moving range).
 *
 * **Control Limits:**
 * - Upper Control Limit (3σ): $UCL_i = \bar{u} + 3\sigma_i$
 * - Lower Control Limit (3σ): $LCL_i = \max(0, \bar{u} - 3\sigma_i)$
 *
 * Lower limits are truncated at 0 since rates cannot be negative.
 *
 * @param args - The control limits calculation arguments
 * @param args.numerators - Array of nonconformity counts for each sample
 * @param args.denominators - Array of sample sizes (number of units inspected)
 * @param args.keys - Array of key objects containing x-position, id, and label for each point
 * @param args.subset_points - Array of indices indicating which points to include in calculations
 * @param args.outliers_in_limits - If false, screens out extreme moving ranges before calculating sigma
 *
 * @returns A controlLimitsObject containing:
 *   - keys: The input keys passed through
 *   - values: The rates (nonconformities per unit) for each sample
 *   - numerators: The original nonconformity counts
 *   - denominators: The original sample sizes
 *   - targets: The centreline (overall rate) for each point
 *   - ll99/ul99: Lower/Upper 3-sigma control limits (lower limits truncated at 0)
 *   - ll95/ul95: Lower/Upper 2-sigma warning limits (lower limits truncated at 0)
 *   - ll68/ul68: Lower/Upper 1-sigma limits (lower limits truncated at 0)
 */
export default function uprimeLimits(args: controlLimitsArgs): controlLimitsObject {
  // Extract input arrays from arguments
  const n: number = args.keys.length;                       // Total number of data points
  const numerators: readonly number[] = args.numerators;    // Nonconformity counts
  const denominators: readonly number[] = args.denominators; // Sample sizes
  const subset_points: readonly number[] = args.subset_points; // Indices of points to include
  const n_sub: number = subset_points.length;               // Number of subset points

  // Calculate values (rates) for all points
  let val: number[] = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    val[i] = numerators[i] / denominators[i];
  }

  // Calculate centreline: overall rate = total nonconformities / total units (from subset)
  let sum_numerators: number = 0;
  let sum_denominators: number = 0;
  for (let i = 0; i < n_sub; i++) {
    let idx = subset_points[i];
    sum_numerators += numerators[idx];
    sum_denominators += denominators[idx];
  }
  const cl: number = sum_numerators / sum_denominators;

  // Calculate standard deviations for each point (based on Poisson assumption)
  let sd: number[] = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    sd[i] = Math.sqrt(cl / denominators[i]);
  }

  // Calculate z-scores for subset points: z = (u - ū) / σ
  let zscore: number[] = new Array<number>(n_sub);
  for (let i = 0; i < n_sub; i++) {
    let idx = subset_points[i];
    zscore[i] = (val[idx] - cl) / sd[idx];
  }

  // Calculate moving ranges of z-scores: MR_i = |z_i - z_{i-1}|
  let consec_diff: number[] = new Array<number>(n_sub - 1);
  let amr: number = 0;  // Running sum for average moving range
  for (let i = 1; i < n_sub; i++) {
    consec_diff[i - 1] = Math.abs(zscore[i] - zscore[i - 1]);
    amr += consec_diff[i - 1];
  }

  // Calculate initial average moving range: AMR = Σ|z_i - z_{i-1}| / (n-1)
  amr /= (n_sub - 1);

  // Optional outlier screening for moving range calculation
  // If outliers_in_limits is false, screen out extreme moving ranges
  if (!args.outliers_in_limits) {
    // Upper limit for moving range: MR_limit = 3.267 × AMR (D4 constant for n=2)
    const consec_diff_ulim: number = amr * 3.267;

    // Recalculate AMR excluding values above the limit
    let screened_amr: number = 0;
    let screened_count: number = 0;
    for (let i = 0; i < consec_diff.length; i++) {
      if (consec_diff[i] < consec_diff_ulim) {
        screened_amr += consec_diff[i];
        screened_count += 1;
      }
    }
    amr = screened_amr / screened_count; // Recalculated AMR without outliers
  }

  // Calculate sigma adjustment factor from average moving range: AMR / d2
  // d2 = 1.128 is the expected value of the range for sample size n=2
  const sigma_multiplier: number = amr / 1.128;

  // Initialize the return object with arrays for all limit lines
  let rtn: controlLimitsObject = {
    keys: args.keys,
    values: val,                                           // The rates (nonconformities per unit)
    numerators: args.numerators,                           // Original nonconformity counts
    denominators: args.denominators,                       // Original sample sizes
    targets: new Array<number>(n),                         // Centreline (overall rate)
    ll99: new Array<number>(n),                            // Lower 3-sigma limit
    ll95: new Array<number>(n),                            // Lower 2-sigma limit
    ll68: new Array<number>(n),                            // Lower 1-sigma limit
    ul68: new Array<number>(n),                            // Upper 1-sigma limit
    ul95: new Array<number>(n),                            // Upper 2-sigma limit
    ul99: new Array<number>(n)                             // Upper 3-sigma limit
  }

  // Calculate control limits for each point
  // U'-chart has variable limits based on sample size and moving range
  for (let i = 0; i < n; i++) {
    // Calculate sigma for this sample: σ = base_sd × (MR / d2)
    const sigma: number = sd[i] * sigma_multiplier;

    rtn.targets[i] = cl;                                   // Centreline: ū
    rtn.ll99[i] = Math.max(0, cl - 3 * sigma);             // LCL: max(0, ū - 3σ)
    rtn.ll95[i] = Math.max(0, cl - 2 * sigma);             // 2σ lower: max(0, ū - 2σ)
    rtn.ll68[i] = Math.max(0, cl - 1 * sigma);             // 1σ lower: max(0, ū - σ)
    rtn.ul68[i] = cl + 1 * sigma;                          // 1σ upper: ū + σ
    rtn.ul95[i] = cl + 2 * sigma;                          // 2σ upper: ū + 2σ
    rtn.ul99[i] = cl + 3 * sigma;                          // UCL: ū + 3σ
  }

  return rtn;
}
