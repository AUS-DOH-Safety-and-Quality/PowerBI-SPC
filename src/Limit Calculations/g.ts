import type { controlLimitsObject, controlLimitsArgs } from "../Classes/viewModelClass";

/**
 * Calculates control limits for a G-chart (Geometric chart).
 *
 * The G-chart is used to monitor the number of opportunities (or time) between
 * rare events, such as days between incidents or patients between infections.
 * It assumes the data follows a geometric distribution, which models the number
 * of trials until the first success (event).
 *
 * **Centreline Calculation:**
 * The centreline uses the median of the observations for display, while the mean
 * is used for control limit calculations:
 *
 * $$\bar{g} = \frac{\sum_{i=1}^{n} g_i}{n}$$
 *
 * where $g_i$ is the count (opportunities between events) for observation $i$.
 *
 * **Sigma (Standard Deviation) Calculation:**
 * For a geometric distribution, the standard deviation is:
 *
 * $$\sigma = \sqrt{\bar{g}(\bar{g} + 1)}$$
 *
 * This formula comes from the variance of the geometric distribution:
 * $Var(G) = \frac{1-p}{p^2} = \mu(\mu + 1)$ where $\mu = \frac{1-p}{p}$.
 *
 * **Control Limits:**
 * - Upper Control Limit (3σ): $UCL = \bar{g} + 3\sigma = \bar{g} + 3\sqrt{\bar{g}(\bar{g} + 1)}$
 * - Lower Control Limit (3σ): $LCL = 0$ (counts cannot be negative)
 *
 * Note: Lower limits are set to 0 for all sigma levels as the geometric
 * distribution is bounded below by 0.
 *
 * @param args - The control limits calculation arguments
 * @param args.numerators - Array of counts (opportunities between events) for each observation
 * @param args.keys - Array of key objects containing x-position, id, and label for each point
 * @param args.subset_points - Array of indices indicating which points to include in limit calculations
 *
 * @returns A controlLimitsObject containing:
 *   - keys: The input keys passed through
 *   - values: The count values (plotted on the chart)
 *   - targets: The median value for each point (used as centreline for display)
 *   - ll99/ul99: Lower/Upper 3-sigma control limits
 *   - ll95/ul95: Lower/Upper 2-sigma warning limits
 *   - ll68/ul68: Lower/Upper 1-sigma limits
 *
 * @example
 * // For days between infections [5, 12, 8, 15, 3] with mean ḡ = 8.6:
 * // σ = √(8.6 × 9.6) = √82.56 ≈ 9.09
 * // UCL = 8.6 + 3(9.09) ≈ 35.87
 * // LCL = 0 (geometric distribution lower bound)
 *
 * @see {@link https://en.wikipedia.org/wiki/G-chart} for G-chart theory
 */
export default function gLimits(args: controlLimitsArgs): controlLimitsObject {
  // Extract input arrays from arguments
  const numerators: number[] = args.numerators;         // Counts (opportunities between events)
  const subset_points: number[] = args.subset_points;   // Indices of points to include
  const n_sub: number = subset_points.length;           // Number of points used for limit calculation

  // Array to store subset values for median calculation
  let numerator_subset: number[] = new Array<number>(n_sub);

  // Accumulator for mean calculation
  let cl: number = 0;

  // Calculate sum of counts for subset points and store values for median
  for (let i = 0; i < n_sub; i++) {
    numerator_subset[i] = numerators[subset_points[i]];
    cl += numerators[subset_points[i]];
  }

  // Calculate mean: ḡ = Σg / n
  cl /= n_sub;

  // Calculate median for display as centreline (more robust to outliers)
  // Sort the subset array and find the middle value
  let sorted_subset: number[] = numerator_subset.slice().sort((a, b) => a - b);
  let median_val: number;
  if (n_sub % 2 === 0) {
    // Even number of points: average of two middle values
    median_val = (sorted_subset[n_sub / 2 - 1] + sorted_subset[n_sub / 2]) / 2;
  } else {
    // Odd number of points: middle value
    median_val = sorted_subset[Math.floor(n_sub / 2)];
  }

  // Calculate sigma using geometric distribution formula: σ = √(ḡ(ḡ + 1))
  // Derived from Var(G) = μ(μ + 1) for geometric distribution
  const sigma: number = Math.sqrt(cl * (cl + 1));

  const n: number = args.keys.length; // Total number of data points

  // Initialize the return object with arrays for all limit lines
  let rtn: controlLimitsObject = {
    keys: args.keys,
    values: args.numerators,           // The plotted values (counts)
    targets: new Array<number>(n),     // Centreline (median for display)
    ll99: new Array<number>(n),        // Lower 3-sigma limit
    ll95: new Array<number>(n),        // Lower 2-sigma limit
    ll68: new Array<number>(n),        // Lower 1-sigma limit
    ul68: new Array<number>(n),        // Upper 1-sigma limit
    ul95: new Array<number>(n),        // Upper 2-sigma limit
    ul99: new Array<number>(n)         // Upper 3-sigma limit
  }

  // Calculate control limits for each point
  // G-chart has constant limits (same sigma for all points)
  // Lower limits are 0 because counts cannot be negative
  for (let i = 0; i < n; i++) {
    rtn.targets[i] = median_val;        // Use median as centreline for display
    rtn.ll68[i] = 0;                    // Lower limits all 0 (geometric lower bound)
    rtn.ll95[i] = 0;
    rtn.ll99[i] = 0;
    rtn.ul68[i] = cl + 1 * sigma;       // 1σ upper limit: ḡ + σ
    rtn.ul95[i] = cl + 2 * sigma;       // 2σ upper limit: ḡ + 2σ
    rtn.ul99[i] = cl + 3 * sigma;       // UCL: ḡ + 3σ
  }

  return rtn;
}
