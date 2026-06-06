import chebyshevPolynomial from "./chebyshevPolynomial";
import sinpi from "./sinpi";
import lgammaCorrection from "./lgammaCorrection";
import stirlingError from "./stirlingError";
import { LOG_SQRT_TWO_PI } from "./Constants";

/**
 * Computes the gamma function Γ(x) for a given input x.
 *
 * This implementation is a TypeScript adaptation of the gamma function
 * from the R programming language.
 *
 * @param x - The input value for which to compute the gamma function
 * @returns The value of the gamma function at x
 */
export default function gamma(x: number): number {
  // Coefficients for the Chebyshev approximation
  const gamcs: readonly number[] = [
    .8571195590989331e-2, .4415381324841006e-2, .5685043681599363e-1,
    -.4219835396418560e-2, .1326808181212460e-2, -.1893024529798880e-3,
    .3606925327441245e-4, -.6056761904460864e-5, .105582954630228334e-5,
    -.1811967365542384e-6, .3117724964715322e-7, -.5354219639019687e-8,
    .9193275519859588e-9, -.1577941280288339e-9, .2707980622934954e-10,
    -.4646818653825730e-11, .7973350192007419e-12, -.13680782098309160e-12,
    .2347319486563800e-13, -.4027432614949066e-14, .6910051747372100e-15,
    -.11855845002219929e-15, .2034148542496373e-16, -.3490054341717405e-17,
    .5987993856485305e-18, -.10273780578722280e-18, .17627028160605298e-19,
    -.3024320653735306e-20, .5188914660218397e-21, -.8902770842456576e-22,
    .15274740684933426e-22, -.2620731256187362e-23, .4496464047830538e-24,
    -.7714712731336877e-25, .1323635453126044e-25, -.2270999412942928e-26,
    .3896418998003991e-27, -.66851981151259533e-28, .11469986631400243e-28,
    -.1967938586345134e-29, .3376448816585338e-30, -.5793070335782135e-31 ];

  const dxrel = 1.4901161193847656e-8;

  if (Number.isNaN(x)) {
    return Number.NaN;
  }

  // Gamma function has singularities at zero and negative integers.
  if (x == 0 || (x < 0 && x === Math.trunc(x))) {
    return Number.NaN;
  }

  let y: number = Math.abs(x);
  let value: number;

  // Use Chebyshev polynomial approximation for small values (|x| <= 10).
  if (y <= 10) {
    let n: number = Math.trunc(x);
    if (x < 0) {
      n--;
    }
    y = x - n;
    n--;
    value = chebyshevPolynomial(y * 2 - 1, gamcs, 22) + .9375;
    if (n == 0) {
      return value;
    }

    // Handle negative range by recursion: Gamma(z) = Gamma(z+1) / z
    if (n < 0) {
      // Check for proximity to non-positive integers (singularities)
      if (x < -0.5 && Math.abs(x - Math.trunc(x - 0.5) / x) < dxrel) {
        return Number.NaN;
      }

      // Check if y is too close to zero (underflow territory)
      if (y < 2.2474362225598545e-308) {
        return x < 0 ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
      }

      n *= -1;

      for (let i = 0; i < n; i++) {
        value /= (x + i);
      }
      return value;
    } else {
      // Handle positive range recursion: Gamma(z+1) = z * Gamma(z)
      for (let i = 1; i <= n; i++) {
        value *= (y + i);
      }
      return value;
    }
  } else {
    // Check for overflow (Gamma(172) > Number.MAX_VALUE).
    if (x > 171.6144788718229) {
      return Number.POSITIVE_INFINITY;
    }

    // For very small negative numbers, Gamma approaches zero.
    if (x < -170.5674972726612) {
      return 0;
    }

    // For integer values <= 50, compute factorial directly.
    if (y <= 50 && y == Math.trunc(y)) {
      value = 1;
      for (let i = 2; i < y; i++) {
        value *= i;
      }
    } else {
      // For larger values, use Stirling's approximation
      const two_y: number = 2 * y;
      value = Math.exp((y - 0.5) * Math.log(y) - y + LOG_SQRT_TWO_PI
              + ((two_y == Math.trunc(two_y)) ? stirlingError(y) : lgammaCorrection(y)));
    }

    if (x > 0) {
      return value;
    }

    // Reflection formula for negative numbers: Gamma(x) = -pi / (x * sin(pi*x) * Gamma(-x))
    const sinpiy: number = sinpi(y);
    return (sinpiy === 0) ? Number.POSITIVE_INFINITY : -Math.PI / (y * sinpiy * value);
  }
}
