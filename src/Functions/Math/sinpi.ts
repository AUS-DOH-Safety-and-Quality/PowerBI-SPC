/**
 * Numerically stable computation of sin(πx)
 *
 * This implementation is a TypeScript adaptation of the sinpi function
 * from the R programming language.
 *
 * @param x The input value
 * @returns The value of sin(πx)
 */
export default function sinpi(x: number): number {
  if (Number.isNaN(x) || !Number.isFinite(x)) {
    return Number.NaN;
  }
  let r: number = x % 2;
  if (r <= -1) {
    r += 2;
  } else if (r > 1) {
    r -= 2;
  }
  if (r === 0 || r === 1) {
    return 0;
  }
  if (r === 0.5) {
    return 1;
  }
  if (r === -0.5) {
    return -1;
  }
  return Math.sin(Math.PI * r);
}
