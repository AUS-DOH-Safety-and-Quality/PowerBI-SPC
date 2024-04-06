export default function isNullOrUndefined<T>(value: T): boolean {
  return value === null || value === undefined;
}
