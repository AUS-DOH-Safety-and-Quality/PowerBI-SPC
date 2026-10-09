import type { CalculatedLimits, controlLimitsArgs } from "../Classes/viewModelClass";
import plottedValues from "./plottedValues";
import { median } from "powerbi-visuals-core/math";

/**
 * Calculates control limits for a run chart (median-only chart with no control limits).
 *
 * A run chart is a simple line graph that displays data over time with only a centreline
 * (typically the median). Unlike control charts, run charts do not have upper or lower
 * control limits. They are used to identify shifts, trends, and patterns in data.
 *
 * **Centreline Calculation:**
 * The centreline is the median of all observations in the subset:
 *
 * $$\text{Centreline} = \text{median}(x_1, x_2, ..., x_n)$$
 *
 * If denominators are provided, each value is calculated as the ratio: $x_i = \frac{numerator_i}{denominator_i}$
 *
 * **Control Limits:**
 * Run charts do not include control limits (ll99, ul99, etc. are not defined).
 *
 * @param args - The control limits calculation arguments
 * @param args.numerators - Array of individual measurements (or numerators if using ratios)
 * @param args.denominators - Optional array of denominators for ratio calculations
 * @param args.keys - Array of key objects containing x-position, id, and label for each point
 * @param args.subset_points - Array of indices indicating which points to include in median calculation
 *
 * @returns A controlLimitsObject containing:
 *   - keys: The input keys passed through
 *   - values: The individual values (or ratios) plotted on the chart
 *   - numerators/denominators: The original values if using ratios
 *   - targets: The centreline (median) for each point
 */
export default function runLimits(args: Readonly<controlLimitsArgs>): CalculatedLimits {
  // Determine if we're calculating ratios (numerator/denominator) or raw values
  const { values, numerators, denominators } = plottedValues(args);

  // Extract input arrays from arguments
  const n_sub: number = args.subset_points.length;          // Number of points used for median calculation
  const subset_points: readonly number[] = args.subset_points; // Indices of points to include

  // Extract subset values and store for median calculation
  let ratio_subset: number[] = new Array<number>(n_sub);
  for (let i = 0; i < n_sub; i++) {
    ratio_subset[i] = values[subset_points[i]];
  }

  // Calculate median (centreline)
  const cl: number = median(ratio_subset);

  const n: number = args.keys.length; // Total number of data points

  // Initialize the return object with arrays for values and centreline
  const rtn = {
    keys: args.keys,
    values,
    numerators,
    denominators,
    targets: new Array<number>(n)                          // Centreline (median)
  }

  // Calculate values and centreline for each point
  for (let i = 0; i < n; i++) {

    rtn.targets[i] = cl;  // Centreline: median
  }

  return rtn;
}
