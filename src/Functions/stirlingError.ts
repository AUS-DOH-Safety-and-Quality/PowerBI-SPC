import lgamma from "./lgamma";
import ldexp from "./ldexp";
import lgamma1p from "./lgamma1p";
import { LOG_TWO_PI, LOG_SQRT_TWO_PI } from "./Constants";

/**
 * Computes the (log) Stirling's error term for a given n.
 *
 * This implementation is a TypeScript adaptation of the stirlerr
 * function from the R programming language.
 *
 * @param n The input value for which to compute the Stirling's error term
 * @returns The Stirling's error term for the input n
 */
export default function stirlingError(n: number): number {
  const s_coeffs: readonly number[] = [
    0.08333333333333333, 0.002777777777777777, 0.000793650793650793650,
    0.0005952380952380952, 0.0008417508417508417, 0.001917526917526917,
    0.006410256410256410, 0.02955065359477124, 0.17964437236883057,
    1.3924322169059011, 13.402864044168391, 156.8482846260020, 2193.103333333333,
    36108.77125372498, 691472.2688513130, 15238221.53940741, 382900751.3914141 ];

  const sferr_halves: readonly number[] = [
    0.0, 0.1534264097200273, 0.08106146679532725, 0.05481412105191765,
    0.04134069595540929, 0.03316287351993628, 0.02767792568499833,
    0.02374616365629749, 0.020790672103765093, 0.01848845053267318,
    0.01664469118982119, 0.015134973221917378, 0.013876128823070747,
    0.012810465242920226, 0.011896709945891770, 0.0111045597582069173,
    0.010411265261972096, 0.00979941612615880, 0.0092554621827127329,
    0.00876870013413938, 0.008330563433362871, 0.007934114564314020,
    0.007573675487951840, 0.007244554301320383, 0.006942840107209529,
    0.006665247032707682, 0.006408994188004207, 0.0061717122630394576,
    0.005951370112758847, 0.005746216513010115, 0.005554733551962801 ];

  let nn: number = n + n;
  if (n <= 15 && nn === Math.trunc(nn)) {
    return sferr_halves[nn];
  }

  if (n <= 5.25) {
    if (n >= 1) {
      const l_n: number = Math.log(n);
      return lgamma(n) + n * (1 - l_n) + ldexp(l_n - LOG_TWO_PI, -1);
    }
    else {
      return lgamma1p(n) - (n + 0.5) * Math.log(n) + n - LOG_SQRT_TWO_PI;
    }
  }

  let start_coeff: number;
  if (n > 15.7e6) {
    start_coeff = 0;
  } else if (n > 6180) {
    start_coeff = 1;
  } else if (n > 205) {
    start_coeff = 2;
  } else if (n > 86) {
    start_coeff = 3;
  } else if (n > 27) {
    start_coeff = 4;
  } else if (n > 23.5) {
    start_coeff = 5;
  } else if (n > 12.8) {
    start_coeff = 6;
  } else if (n > 12.3) {
    start_coeff = 7;
  } else if (n > 8.9) {
    start_coeff = 8;
  } else if (n > 7.3) {
    start_coeff = 10;
  } else if (n > 6.6) {
    start_coeff = 12;
  } else if (n > 6.1) {
    start_coeff = 14;
  } else {
    start_coeff = 16;
  }

  nn = n * n;
  let sum: number = s_coeffs[start_coeff];
  for (let i = start_coeff - 1; i >= 0; i--) {
    sum = s_coeffs[i] - sum / nn;
  }
  return sum / n;
}
