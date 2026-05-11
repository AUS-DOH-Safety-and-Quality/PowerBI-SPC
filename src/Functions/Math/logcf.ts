/**
 * Computes the continued fraction for the calculation of sum_{k=0}^Inf x^k/(i+k*d)
 *
 * This implementation is a TypeScript adaptation of the logcf function
 * from the R programming language.
 *
 *
 * @param x The value of x in the continued fraction
 * @param i The initial index i
 * @param d The increment d
 * @param eps The desired precision epsilon
 * @returns The value of the continued fraction
 */
export default function logcf(x: number, i: number, d: number, eps: number): number {
  let c1: number = 2 * d;
  let c2: number = i + d;
  let c4: number = c2 + d;
  let a1: number = c2;
  let b1: number = i * (c2 - i * x);
  let b2: number = d * d * x;
  let a2: number = c4 * c2 - b2;
  const scalefactor: number = 1.157921e+77;

  b2 = c4 * b1 - i * b2;

  // Evaluate continued fraction using modified Lentz's method
  while (Math.abs(a2 * b1 - a1 * b2) > Math.abs(eps * b1 * b2)) {
    let c3: number = c2 * c2 * x;
    c2 += d;
    c4 += d;
    a1 = c4 * a2 - c3 * a1;
    b1 = c4 * b2 - c3 * b1;

    c3 = c1 * c1 * x;
    c1 += d;
    c4 += d;
    a2 = c4 * a1 - c3 * a2;
    b2 = c4 * b1 - c3 * b2;

    // Rescale to prevent overflow/underflow
    if (Math.abs(b2) > scalefactor) {
      a1 /= scalefactor;
      b1 /= scalefactor;
      a2 /= scalefactor;
      b2 /= scalefactor;
    } else if (Math.abs(b2) < 1 / scalefactor) {
      a1 *= scalefactor;
      b1 *= scalefactor;
      a2 *= scalefactor;
      b2 *= scalefactor;
    }
  }
  return a2 / b2;
}
