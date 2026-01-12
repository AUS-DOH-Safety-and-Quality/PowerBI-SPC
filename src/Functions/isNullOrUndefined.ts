/**
 * Basic utility function to check for null or undefined values.
 *
 * @template T The type of the input value.
 * @param value The value to check.
 * @returns True if the value is null or undefined, false otherwise.
 */
export default function isNullOrUndefined<T>(value: T): boolean {
  return value === null || value === undefined;
}
