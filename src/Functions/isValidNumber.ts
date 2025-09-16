import isNullOrUndefined from "./isNullOrUndefined";

export default function isValidNumber(value: number): boolean {
  return !isNullOrUndefined(value) && !isNaN(value) && isFinite(value);
}
