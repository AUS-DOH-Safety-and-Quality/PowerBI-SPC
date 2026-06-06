import chebyshevPolynomial from "./chebyshevPolynomial";

/**
 * Computes the correction term for the logarithm of the gamma function for
 * large x (x >= 10).
 *
 * This implementation is a TypeScript adaptation of the lgammacor function
 * from the R programming language.
 *
 * @param x The input value for which to compute the correction term
 * @returns The correction term for the logarithm of the gamma function at x
 */
export default function lgammaCorrection(x: number): number {
  // Coefficients for the Chebyshev approximation
  const algmcs: readonly number[] = [
    .1666389480451863e+0, -.13849481760675638e-4, .9810825646924729e-8,
    -.18091294755724941e-10, .622109804189260e-13, -.3399615005417721e-15,
    .2683181998482698e-17, -.2868042435334643e-19, .3962837061046434e-21,
    -.6831888753985766e-23, .1429227355942498e-24, -.3547598158101070e-26,
    .10256800580104709e-27, -.3401102254316748e-29, .1276642195630062e-30 ];

  if (x < 10) {
    throw new Error("lgammaCorrection: x must be >= 10");
  } else if (x < 94906265.62425156) {
    // For intermediate values 10 <= x < ~9.5e7, use Chebyshev approximation
    const tmp: number = 10 / x;
    return chebyshevPolynomial(tmp * tmp * 2 - 1, algmcs, 5) / x;
  } else {
    // For very large x, use simple asymptotic approximation 1/(12x)
    return 1 / (x * 12);
  }
}
