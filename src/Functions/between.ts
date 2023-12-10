/**
 * Checks if a value is between a lower and upper bound (inclusive).
 *
 * @template T - The type of the value and bounds.
 * @param x - The value to check.
 * @param lower - The lower bound.
 * @param upper - The upper bound.
 * @returns True if the value is between the lower and upper bounds,
 *            false otherwise.
 */
export default function between<T>(x: T, lower: T, upper: T): boolean {
  return (lower ? (x >= lower) : true) && (upper ? (x <= upper) : true);
}
