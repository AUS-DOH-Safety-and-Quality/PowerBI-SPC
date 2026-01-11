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
  const algmcs: readonly number[] = [
    .1666389480451863247205729650822e+0,
    -.1384948176067563840732986059135e-4,
    .9810825646924729426157171547487e-8,
    -.1809129475572494194263306266719e-10,
    .6221098041892605227126015543416e-13,
    -.3399615005417721944303330599666e-15,
    .2683181998482698748957538846666e-17,
    -.2868042435334643284144622399999e-19,
    .3962837061046434803679306666666e-21,
    -.6831888753985766870111999999999e-23,
    .1429227355942498147573333333333e-24,
    -.3547598158101070547199999999999e-26,
    .1025680058010470912000000000000e-27,
    -.3401102254316748799999999999999e-29,
    .1276642195630062933333333333333e-30
  ];

  if (x < 10) {
    throw new Error("lgammaCorrection: x must be >= 10");
  } else if (x < 94906265.62425156) {
    const tmp: number = 10 / x;
    return chebyshevPolynomial(tmp * tmp * 2 - 1, algmcs, 5) / x;
  } else {
    return 1 / (x * 12);
  }
}
