/**
 * Computes the Chebyshev polynomial approximation at a given point x
 * using the provided coefficients a and degree n.
 *
 * This implementation is a TypeScript adaptation of the chebyshev_eval
 * function from the R programming language.
 *
 * @param x The point at which to evaluate the Chebyshev polynomial
 * @param a The coefficients of the Chebyshev polynomial
 * @param n The degree of the Chebyshev polynomial
 * @returns The value of the Chebyshev polynomial at point x
 */
export default function chebyshevPolynomial(x: number, a: readonly number[], n: number): number {
  if (x < -1.1 || x > 1.1) {
    throw new Error("chebyshevPolynomial: x must be in [-1,1]");
  }

  if (n < 1 || n > 1000) {
    throw new Error("chebyshevPolynomial: n must be in [1,1000]");
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
