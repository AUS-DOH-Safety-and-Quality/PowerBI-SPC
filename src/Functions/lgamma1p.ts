import lgamma from "./lgamma";
import log1pmx from "./log1pmx";
import logcf from "./logcf";
import { EULER } from "./Constants";

/**
 * Computes the natural logarithm of the gamma function at (1 + a): ln(Γ(1 + a)),
 * providing improved accuracy for small values of a.
 *
 * This implementation is based on a series expansion and continued fraction
 * approximation for better numerical stability when a is close to zero.
 *
 * The below implementation is a TypeScript adaptation of the lgamma1p function
 * from the R programming language.
 *
 * @param a The input value for which to compute lgamma1p
 * @returns The natural logarithm of the gamma function at (1 + a): ln(Γ(1 + a))
 */
export default function lgamma1p(a: number): number {
  if (Math.abs(a) >= 0.5) {
    return lgamma(a + 1);
  }

  // Coefficients for the polynomial approximation of ln(gamma(1+x))
  const coeffs: readonly number[] = [
    0.3224670334241132e-0, 0.6735230105319809e-1, 0.2058080842778454e-1,
    0.7385551028673985e-2, 0.2890510330741523e-2, 0.1192753911703260e-2,
    0.509669524743042e-3, 0.2231547584535793e-3, 0.9945751278180853e-4,
    0.4492623673813314e-4, 0.20507212775670691e-4, 0.9439488275268395e-5,
    0.4374866789907487e-5, 0.20392157538013662e-5, 0.9551412130407419e-6,
    0.4492469198764566e-6, 0.21207184805554665e-6, 0.10043224823968099e-6,
    0.4769810169363980e-7, 0.22711094608943164e-7, 0.1083865921489695e-7,
    0.51834750419700466e-8, 0.2483674543802478e-8, 0.11921401405860912e-8,
    0.5731367241678862e-9, 0.2759522885124233e-9, 0.13304764374244489e-9,
    0.6422964563838100e-10, 0.3104424774732227e-10, 0.15021384080754142e-10,
    0.7275974480239079e-11, 0.3527742476575915e-11, 0.1711991790559617e-11,
    0.8315385841420284e-12, 0.4042200525289440e-12, 0.1966475631096616e-12,
    0.957363038783855e-13, 0.4664076026428374e-13, 0.2273736960065972e-13,
    0.11091399470834522e-13 ];

  const N: number = coeffs.length;
  const c = 0.2273736845824652e-12;

  // Use continued fraction approximation for the tail of the expansion
  let lgam: number = c * logcf(-a / 2, N + 2, 1, 1e-14);

  // Evaluate the polynomial using Horner's method
  for (let i = N - 1; i >= 0; i--) {
    lgam = coeffs[i] - a * lgam;
  }
  return (a * lgam - EULER) * a - log1pmx(a);
}
