import gamma from "./gamma";
import lgammaCorrection from "./lgammaCorrection";
import sinpi from "./sinpi";
import { LOG_SQRT_TWO_PI, LOG_SQRT_PI_DIV_2 } from "./Constants";

/**
 * Computes the natural logarithm of the absolute value of the
 * gamma function: ln|Γ(x)|
 *
 * This implementation is a TypeScript adaptation of the lgamma function
 * from the R programming language.
 *
 * @param x - The input value for which to compute lgamma
 * @returns The natural logarithm of the absolute value of the gamma function at x
 */
export default function lgamma(x: number): number {
  if (Number.isNaN(x)) {
    return Number.NaN;
  }

  // Gamma function has singularities at non-positive integers.
  // The limit of |Gamma(x)| approaches infinity, so lgamma approaches infinity.
  if (x <= 0 && x === Math.trunc(x)) {
    return Number.POSITIVE_INFINITY;
  }

  const y: number = Math.abs(x);

  // For very small numbers, Gamma(x) ~ 1/x, so lgamma(x) ~ -ln(x)
  if (y < 1e-306) {
    return -Math.log(y);
  }

  // For small numbers, compute Gamma directly and take the log.
  // This avoids complexity of approximation for this range.
  if (y <= 10) {
    return Math.log(Math.abs(gamma(x)));
  }

  // Check for overflow.
  if (y > Number.MAX_VALUE) {
    return Number.POSITIVE_INFINITY;
  }

  if (x > 0) {
    // For very large positive numbers, use a simplified Stirling's approximation:
    // ln(Gamma(x)) ~ x * (ln(x) - 1)
    if (x > 1e17) {
      return x * (Math.log(x) - 1);
    } else {
      // For moderately large positive numbers, use a more precise Stirling's approximation
      // with correction terms.
      return LOG_SQRT_TWO_PI + (x - 0.5) * Math.log(x) - x
              + ((x > 4934720) ? 0 : lgammaCorrection(x))
    }
  }

  // Reflection formula for negative numbers:
  // Gamma(1-z) * Gamma(z) = pi / sin(pi * z)
  // Used to compute lgamma for negative x using positive y = |x|.
  return LOG_SQRT_PI_DIV_2 + (x - 0.5) * Math.log(y)
          - x - Math.log(Math.abs(sinpi(y))) - lgammaCorrection(y);
}
