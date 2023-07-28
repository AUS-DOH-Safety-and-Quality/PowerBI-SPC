export default function isNullOrUndefined<T>(x: T): boolean {
  return (x === null) || (x === undefined);
}
