import iLimits from "./i"
import type { controlLimitsObject, controlLimitsArgs } from "../Classes/viewModelClass";

/**
 * Calculates control limits for a T-chart (time-between-events chart).
 *
 * The T-chart is used to monitor the time between rare events (e.g., accidents,
 * defects, failures). It applies a power transformation (x^(1/3.6)) to stabilize
 * the variance of exponentially distributed time data, then uses I-chart methodology
 * on the transformed data.
 *
 * **Transformation:**
 * The data is transformed using a power of 1/3.6:
 *
 * $$y_i = x_i^{1/3.6}$$
 *
 * This transformation stabilizes variance for exponentially distributed data.
 *
 * **Control Limit Calculation:**
 * After transformation, control limits are calculated using the I-chart method
 * (mean ± 3σ where σ is estimated from moving ranges). The limits are then
 * back-transformed using a power of 3.6:
 *
 * $$UCL = (UCL_y)^{3.6}, \quad LCL = \max(0, (LCL_y)^{3.6})$$
 *
 * Lower limits are truncated at 0 since time cannot be negative.
 *
 * @param args - The control limits calculation arguments
 * @param args.numerators - Array of time-between-events measurements
 * @param args.denominators - Not used for T-charts (should be null or undefined)
 * @param args.keys - Array of key objects containing x-position, id, and label for each point
 * @param args.subset_points - Array of indices indicating which points to include in limit calculations
 * @param args.outliers_in_limits - If false, screens out extreme moving ranges before calculating sigma
 *
 * @returns A controlLimitsObject containing:
 *   - keys: The input keys passed through
 *   - values: The original time values (not transformed)
 *   - targets: The centreline (back-transformed mean) for each point
 *   - ll99/ul99: Lower/Upper 3-sigma control limits (lower limits truncated at 0)
 *   - ll95/ul95: Lower/Upper 2-sigma warning limits (lower limits truncated at 0)
 *   - ll68/ul68: Lower/Upper 1-sigma limits (lower limits truncated at 0)
 */
export default function tLimits(args: Readonly<controlLimitsArgs>): controlLimitsObject {
  const n: number = args.keys.length;

  // Transform data: y = x^(1/3.6)
  let val: number[] = new Array<number>(n);
  for (let i = 0; i < n; i++) {
    val[i] = Math.pow(args.numerators[i], 1 / 3.6);
  }

  // Create a copy of args with transformed data and no denominators
  const inputArgsCopy: Readonly<controlLimitsArgs> = {
    numerators: val,
    keys: args.keys,
    subset_points: args.subset_points,
    outliers_in_limits: args.outliers_in_limits
  };

  // Calculate I-chart limits on transformed data
  const limits: controlLimitsObject = iLimits(inputArgsCopy);

  // Limits & target are constant for i-chart, so only extract and back-transform once
  const cl: number = Math.pow(limits.targets[0], 3.6);
  const ll99: number = Math.max(0, Math.pow(limits.ll99![0], 3.6));
  const ll95: number = Math.max(0, Math.pow(limits.ll95![0], 3.6));
  const ll68: number = Math.max(0, Math.pow(limits.ll68![0], 3.6));
  const ul68: number = Math.pow(limits.ul68![0], 3.6);
  const ul95: number = Math.pow(limits.ul95![0], 3.6);
  const ul99: number = Math.pow(limits.ul99![0], 3.6);

  let rtn: controlLimitsObject = {
    keys: args.keys,
    values: args.numerators,                          // The plotted values
    targets: new Array<number>(n),                         // Centreline (mean)
    ll99: new Array<number>(n),                            // Lower 3-sigma limit
    ll95: new Array<number>(n),                            // Lower 2-sigma limit
    ll68: new Array<number>(n),                            // Lower 1-sigma limit
    ul68: new Array<number>(n),                            // Upper 1-sigma limit
    ul95: new Array<number>(n),                            // Upper 2-sigma limit
    ul99: new Array<number>(n)                             // Upper 3-sigma limit
  }

  for (let i = 0; i < n; i++) {
    rtn.targets[i] = cl;               // Centreline: x̄
    rtn.ll99![i] = ll99;      // LCL: x̃ - 3σ
    rtn.ll95![i] = ll95;      // 2σ lower limit: x̃ - 2σ
    rtn.ll68![i] = ll68;      // 1σ lower limit: x̃ - σ
    rtn.ul68![i] = ul68;      // 1σ upper limit: x̃ + σ
    rtn.ul95![i] = ul95;      // 2σ upper limit: x̃ + 2σ
    rtn.ul99![i] = ul99;      // UCL: x̃ + 3σ
  }
  return rtn;
}
