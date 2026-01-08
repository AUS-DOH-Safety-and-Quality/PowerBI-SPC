import gamma from "./gamma";
import lgammacor from "./lgammacor";
import sinpi from "./sinpi";
import { LOG_SQRT_2PI, LOG_SQRT_PI_DIV_2 } from "./Constants";

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

  if (x <= 0 && x === Math.trunc(x)) {
    return Number.POSITIVE_INFINITY;
  }

  const y: number = Math.abs(x);
  if (y < 1e-306) {
    return -Math.log(y);
  }

  if (y <= 10) {
    return Math.log(Math.abs(gamma(x)));
  }

  if (y > Number.MAX_VALUE) {
    return Number.POSITIVE_INFINITY;
  }

  if (x > 0) {
    if (x > 1e17) {
      return x * (Math.log(x) - 1);
    } else {
      return LOG_SQRT_2PI + (x - 0.5) * Math.log(x) - x
              + ((x > 4934720) ? 0 : lgammacor(x))
    }
  }

  return LOG_SQRT_PI_DIV_2 + (x - 0.5) * Math.log(y)
          - x - Math.log(Math.abs(sinpi(y))) - lgammacor(y);
}
