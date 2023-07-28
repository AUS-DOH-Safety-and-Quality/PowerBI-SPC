export default function isNotNullOrUndefined<T>(x: T): boolean {
  return (x !== null) && (x !== undefined);
}
