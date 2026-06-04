import isNullOrUndefined from "./isNullOrUndefined";

/**
 * Checks if a value is a valid number (not null, undefined, NaN, or infinite).
 *
 * @param value The number to check.
 * @returns True if the value is a valid number, false otherwise.
 */
export default function isValidNumber<T>(value: T): value is Extract<T, number> {
  return !isNullOrUndefined(value) && !Number.isNaN(value) && Number.isFinite(value);
}
