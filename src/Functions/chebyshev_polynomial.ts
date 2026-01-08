/**
 * Computes the Chebyshev polynomial approximation at a given point x
 * using the provided coefficients a and degree n.
 *
 * This implementation is a TypeScript adaptation of the chebyshev_eval
 * function from the R programming language.
 *
 * @param x
 * @param a
 * @param n
 * @returns
 */
export default function chebyshev_polynomial(x: number, a: number[], n: number): number {
  if (x < -1.1 || x > 1.1) {
    throw new Error("chebyshev_polynomial: x must be in [-1,1]");
  }

  if (n < 1 || n > 1000) {
    throw new Error("chebyshev_polynomial: n must be in [1,1000]");
  }
  const twox: number = x * 2;
  let b0: number = 0;
  let b1: number = 0;
  let b2: number = 0;
  for (let i: number = 1; i <= n; i++) {
    b2 = b1;
    b1 = b0;
    b0 = twox * b1 - b2 + a[n - i];
  }
  return (b0 - b2) * 0.5;
}
