import type { controlLimitsObject, controlLimitsArgs } from "../Classes/viewModelClass";

/**
 * Calculates control limits for an I-mR chart using the median instead of mean.
 *
 * The I-mR chart (Individuals-Moving Range chart using median) is a variation of the
 * standard I-chart that uses the median as the centreline instead of the mean. This
 * makes the chart more robust to outliers and extreme values.
 *
 * **Centreline Calculation:**
 * The centreline is the median of all individual observations (x̃) rather than the mean.
 *
 * If denominators are provided, each value is calculated as the ratio: $x_i = \frac{numerator_i}{denominator_i}$
 *
 * **Sigma (Standard Deviation) Calculation:**
 * The standard deviation is estimated from the average moving range (AMR):
 *
 * $$\sigma = \frac{\overline{MR}}{d_2} = \frac{\overline{MR}}{1.128}$$
 *
 * where the moving range is the absolute difference between consecutive observations:
 *
 * $$MR_i = |x_i - x_{i-1}|$$
 *
 * $$\overline{MR} = \frac{\sum_{i=2}^{n} MR_i}{n-1}$$
 *
 * and $d_2 = 1.128$ is the expected value of the range for a sample size of 2.
 *
 * Optionally, outliers can be screened from the moving range calculation using:
 * $MR_{limit} = 3.267 \times \overline{MR}$ (the upper limit for moving range).
 *
 * **Control Limits:**
 * - Upper Control Limit (3σ): $UCL = \tilde{x} + 3\sigma = \tilde{x} + \frac{3 \times \overline{MR}}{1.128}$
 * - Lower Control Limit (3σ): $LCL = \tilde{x} - 3\sigma = \tilde{x} - \frac{3 \times \overline{MR}}{1.128}$
 *
 * @param args - The control limits calculation arguments
 * @param args.numerators - Array of individual measurements (or numerators if using ratios)
 * @param args.denominators - Optional array of denominators for ratio calculations
 * @param args.keys - Array of key objects containing x-position, id, and label for each point
 * @param args.subset_points - Array of indices indicating which points to include in limit calculations
 * @param args.outliers_in_limits - If false, screens out extreme moving ranges before calculating sigma
 *
 * @returns A controlLimitsObject containing:
 *   - keys: The input keys passed through
 *   - values: The individual values (or ratios) plotted on the chart
 *   - numerators/denominators: The original values if using ratios
 *   - targets: The centreline (median) for each point
 *   - ll99/ul99: Lower/Upper 3-sigma control limits
 *   - ll95/ul95: Lower/Upper 2-sigma warning limits
 *   - ll68/ul68: Lower/Upper 1-sigma limits
 */
export default function imLimits(args: controlLimitsArgs): controlLimitsObject {
  // Determine if we're calculating ratios (numerator/denominator) or raw values
  const useRatio: boolean = (args.denominators && args.denominators.length > 0);

  // Extract input arrays from arguments
  const n_sub: number = args.subset_points.length;          // Number of points used for limit calculation
  const numerators: readonly number[] = args.numerators;    // Raw values or numerators for ratios
  const denominators: readonly number[] = args.denominators; // Denominators for ratio calculation
  const subset_points: readonly number[] = args.subset_points; // Indices of points to include

  // Extract subset values and store for median calculation
  let ratio_subset: number[] = new Array<number>(n_sub);
  for (let i = 0; i < n_sub; i++) {
    ratio_subset[i] = useRatio ? numerators[subset_points[i]] / denominators[subset_points[i]]
                                : numerators[subset_points[i]];
  }

  // Calculate median (centreline) by sorting and finding middle value
  let sorted_subset: number[] = ratio_subset.slice().sort((a, b) => a - b);
  let cl: number;
  if (n_sub % 2 === 0) {
    // Even number of points: average of two middle values
    cl = (sorted_subset[n_sub / 2 - 1] + sorted_subset[n_sub / 2]) / 2;
  } else {
    // Odd number of points: middle value
    cl = sorted_subset[Math.floor(n_sub / 2)];
  }

  // Calculate moving ranges: MR_i = |x_i - x_{i-1}|
  let consec_diff: number[] = new Array<number>(n_sub - 1);
  let amr: number = 0;  // Running sum for average moving range

  for (let i = 1; i < n_sub; i++) {
    consec_diff[i - 1] = Math.abs(ratio_subset[i] - ratio_subset[i - 1]);
    amr += consec_diff[i - 1];
  }

  // Calculate initial average moving range: AMR = Σ|x_i - x_{i-1}| / (n-1)
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

  // Calculate sigma from average moving range: σ = AMR / d2
  // d2 = 1.128 is the expected value of the range for sample size n=2
  const sigma = amr / 1.128;

  const n: number = args.keys.length; // Total number of data points

  // Initialize the return object with arrays for all limit lines
  let rtn: controlLimitsObject = {
    keys: args.keys,
    values: new Array<number>(n),                          // The plotted values
    numerators: useRatio ? args.numerators : undefined,    // Original numerators (if ratio)
    denominators: useRatio ? args.denominators : undefined, // Original denominators (if ratio)
    targets: new Array<number>(n),                         // Centreline (median)
    ll99: new Array<number>(n),                            // Lower 3-sigma limit
    ll95: new Array<number>(n),                            // Lower 2-sigma limit
    ll68: new Array<number>(n),                            // Lower 1-sigma limit
    ul68: new Array<number>(n),                            // Upper 1-sigma limit
    ul95: new Array<number>(n),                            // Upper 2-sigma limit
    ul99: new Array<number>(n)                             // Upper 3-sigma limit
  }

  // Calculate control limits for each point
  // I-mR chart has constant limits (same sigma for all points)
  for (let i = 0; i < n; i++) {
    // Calculate the plotted value (raw or ratio)
    if (useRatio) {
      rtn.values[i] = numerators[i] / denominators[i];  // Ratio: numerator/denominator
      rtn.numerators![i] = numerators[i];                // Store original numerator
      rtn.denominators![i] = denominators[i];            // Store original denominator
    } else {
      rtn.values[i] = numerators[i];                     // Raw value
    }

    rtn.targets[i] = cl;               // Centreline: x̃ (median)
    rtn.ll99[i] = cl - 3 * sigma;      // LCL: x̃ - 3σ
    rtn.ll95[i] = cl - 2 * sigma;      // 2σ lower limit: x̃ - 2σ
    rtn.ll68[i] = cl - 1 * sigma;      // 1σ lower limit: x̃ - σ
    rtn.ul68[i] = cl + 1 * sigma;      // 1σ upper limit: x̃ + σ
    rtn.ul95[i] = cl + 2 * sigma;      // 2σ upper limit: x̃ + 2σ
    rtn.ul99[i] = cl + 3 * sigma;      // UCL: x̃ + 3σ
  }

  return rtn;
}
