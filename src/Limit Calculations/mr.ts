import type { controlLimitsObject, controlLimitsArgs } from "../Classes";

/**
 * Calculates control limits for a Moving Range (MR) chart.
 *
 * The MR chart displays the absolute difference between consecutive observations
 * and is typically paired with an I-chart (Individuals chart). It monitors the
 * variation or spread in the process over time.
 *
 * **Centreline Calculation:**
 * The centreline (MR̄) is the mean of the moving ranges:
 *
 * $$\overline{MR} = \frac{\sum_{i=2}^{n} |x_i - x_{i-1}|}{n-1}$$
 *
 * where $MR_i = |x_i - x_{i-1}|$ is the moving range (absolute difference between consecutive values).
 *
 * If denominators are provided, each value is calculated as the ratio before computing moving ranges:
 * $x_i = \frac{numerator_i}{denominator_i}$
 *
 * **Control Limits:**
 * - Upper Control Limit (3σ): $UCL = D_4 \times \overline{MR} = 3.267 \times \overline{MR}$
 * - Lower Control Limit: $LCL = 0$ (moving ranges cannot be negative)
 * - 2σ limits: $\overline{MR} \times \frac{2 \times 3.267}{3} = 2.178 \times \overline{MR}$
 * - 1σ limits: $\overline{MR} \times \frac{1 \times 3.267}{3} = 1.089 \times \overline{MR}$
 *
 * where $D_4 = 3.267$ is the control chart constant for a moving range of size 2.
 *
 * @param args - The control limits calculation arguments
 * @param args.numerators - Array of individual measurements (or numerators if using ratios)
 * @param args.denominators - Optional array of denominators for ratio calculations
 * @param args.keys - Array of key objects containing x-position, id, and label for each point
 * @param args.subset_points - Array of indices indicating which points to include in limit calculations
 *
 * @returns A controlLimitsObject containing:
 *   - keys: The input keys excluding the first point (n-1 points)
 *   - values: The moving ranges (n-1 values)
 *   - numerators/denominators: The original values if using ratios, excluding first point
 *   - targets: The centreline (average moving range) for each point
 *   - ll99/ll95/ll68: Lower limits (all zero, as moving ranges cannot be negative)
 *   - ul68/ul95/ul99: Upper 1σ, 2σ, and 3σ control limits
 */
export default function mrLimits(args: controlLimitsArgs): controlLimitsObject {
  // Determine if we're calculating ratios (numerator/denominator) or raw values
  const useRatio: boolean = (args.denominators && args.denominators.length > 0);

  // Extract input arrays from arguments
  const n: number = args.keys.length;                       // Total number of data points
  const numerators: readonly number[] = args.numerators;    // Raw values or numerators for ratios
  const denominators: readonly number[] = args.denominators; // Denominators for ratio calculation
  const subset_points: readonly number[] = args.subset_points; // Indices of points to include

  // Calculate all moving ranges (n-1 values)
  let consec_diff: number[] = new Array<number>(n - 1);
  for (let i = 1; i < n; i++) {
    let prevVal: number = useRatio ? numerators[i - 1] / denominators[i - 1] : numerators[i - 1];
    let currVal: number = useRatio ? numerators[i] / denominators[i] : numerators[i];
    consec_diff[i - 1] = Math.abs(currVal - prevVal);
  }

  // Calculate mean of moving ranges from subset points
  // Note: subset_points reference the original data indices, so we need to map to consec_diff indices
  let sum_mr: number = 0;
  let count: number = 0;
  for (let i = 0; i < subset_points.length; i++) {
    let idx = subset_points[i];
    // Moving range at index idx corresponds to the difference between data[idx] and data[idx-1]
    // So moving range index is idx-1, but only if idx > 0
    if (idx > 0 && idx - 1 < consec_diff.length) {
      sum_mr += consec_diff[idx - 1];
      count++;
    }
  }
  const cl: number = sum_mr / count;

  const n_mr: number = n - 1; // Number of moving range points

  // Initialize the return object with arrays for all limit lines
  let rtn: controlLimitsObject = {
    keys: args.keys.slice(1),                                   // Exclude first key (n-1 points)
    values: new Array<number>(n_mr),                            // The moving ranges
    numerators: useRatio ? args.numerators.slice(1) : undefined,   // Original numerators (if ratio), exclude first
    denominators: useRatio ? args.denominators.slice(1) : undefined, // Original denominators (if ratio), exclude first
    targets: new Array<number>(n_mr),                           // Centreline (mean moving range)
    ll99: new Array<number>(n_mr),                              // Lower 3σ limit (always 0)
    ll95: new Array<number>(n_mr),                              // Lower 2σ limit (always 0)
    ll68: new Array<number>(n_mr),                              // Lower 1σ limit (always 0)
    ul68: new Array<number>(n_mr),                              // Upper 1σ limit
    ul95: new Array<number>(n_mr),                              // Upper 2σ limit
    ul99: new Array<number>(n_mr)                               // Upper 3σ limit
  }

  // Populate arrays with moving ranges and control limits
  // Moving ranges cannot be negative, so lower limits are always 0
  for (let i = 0; i < n_mr; i++) {
    rtn.values[i] = consec_diff[i];
    if (useRatio) {
      rtn.numerators![i] = numerators[i + 1];
      rtn.denominators![i] = denominators[i + 1];
    }
    rtn.targets[i] = cl;                        // Centreline: MR̄
    rtn.ll99[i] = 0;                            // LCL: 0
    rtn.ll95[i] = 0;                            // 2σ lower: 0
    rtn.ll68[i] = 0;                            // 1σ lower: 0
    rtn.ul68[i] = (3.267 / 3) * 1 * cl;         // 1σ upper: 1.089 × MR̄
    rtn.ul95[i] = (3.267 / 3) * 2 * cl;         // 2σ upper: 2.178 × MR̄
    rtn.ul99[i] = 3.267 * cl;                   // UCL: 3.267 × MR̄ (D4 constant)
  }

  return rtn;
}
