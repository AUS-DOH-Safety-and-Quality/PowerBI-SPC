import isNullOrUndefined from "./isNullOrUndefined";

/**
 * Checks if a value is a valid number (not null, undefined, NaN, or infinite).
 *
 * @param value The number to check.
 * @returns True if the value is a valid number, false otherwise.
 */
export default function isValidNumber(value: number): boolean {
  return !isNullOrUndefined(value) && !Number.isNaN(value) && Number.isFinite(value);
}
