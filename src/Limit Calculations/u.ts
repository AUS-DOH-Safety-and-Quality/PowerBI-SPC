import type { controlLimitsObject, controlLimitsArgs } from "../Classes";

/**
 * Calculates control limits for a U-chart (rate per unit chart).
 *
 * The U-chart is used to monitor the rate of nonconformities (defects) per unit when
 * the sample size (number of units inspected) can vary. It tracks the average number
 * of defects per unit over time.
 *
 * **Centreline Calculation:**
 * The centreline (ū) is the overall rate of nonconformities per unit:
 *
 * $$\bar{u} = \frac{\sum_{i=1}^{n} c_i}{\sum_{i=1}^{n} n_i}$$
 *
 * where $c_i$ is the count of nonconformities and $n_i$ is the number of units inspected
 * for the i-th sample.
 *
 * **Sigma (Standard Deviation) Calculation:**
 * The standard deviation varies with sample size:
 *
 * $$\sigma_i = \sqrt{\frac{\bar{u}}{n_i}}$$
 *
 * This assumes a Poisson distribution for the count of nonconformities.
 *
 * **Control Limits:**
 * - Upper Control Limit (3σ): $UCL_i = \bar{u} + 3\sigma_i = \bar{u} + 3\sqrt{\frac{\bar{u}}{n_i}}$
 * - Lower Control Limit (3σ): $LCL_i = \max(0, \bar{u} - 3\sqrt{\frac{\bar{u}}{n_i}})$
 *
 * Lower limits are truncated at 0 since rates cannot be negative.
 *
 * @param args - The control limits calculation arguments
 * @param args.numerators - Array of nonconformity counts for each sample
 * @param args.denominators - Array of sample sizes (number of units inspected)
 * @param args.keys - Array of key objects containing x-position, id, and label for each point
 * @param args.subset_points - Array of indices indicating which points to include in rate calculation
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
export default function uLimits(args: controlLimitsArgs): controlLimitsObject {
  // Extract input arrays from arguments
  const n: number = args.keys.length;                       // Total number of data points
  const numerators: readonly number[] = args.numerators;    // Nonconformity counts
  const denominators: readonly number[] = args.denominators; // Sample sizes
  const subset_points: readonly number[] = args.subset_points; // Indices of points to include

  // Calculate centreline: overall rate = total nonconformities / total units
  let sum_numerators: number = 0;
  let sum_denominators: number = 0;
  for (let i = 0; i < subset_points.length; i++) {
    let idx = subset_points[i];
    sum_numerators += numerators[idx];
    sum_denominators += denominators[idx];
  }
  const cl: number = sum_numerators / sum_denominators;

  // Initialize the return object with arrays for all limit lines
  let rtn: controlLimitsObject = {
    keys: args.keys,
    values: new Array<number>(n),                          // The rates (nonconformities per unit)
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
  // U-chart has variable limits based on sample size
  for (let i = 0; i < n; i++) {
    // Calculate the rate for this sample
    rtn.values[i] = numerators[i] / denominators[i];

    // Calculate sigma for this sample size: σ = sqrt(ū / n)
    const sigma: number = Math.sqrt(cl / denominators[i]);

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
