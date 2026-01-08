import lgamma from "./lgamma";
import ldexp from "./ldexp";
import lgamma1p from "./lgamma1p";
import { LOG_2PI, LOG_SQRT_2PI } from "./Constants";

/**
 * Computes the (log) Stirling's error term for a given n.
 *
 * This implementation is a TypeScript adaptation of the stirlerr
 * function from the R programming language.
 *
 * @param n The input value for which to compute the Stirling's error term
 * @returns The Stirling's error term for the input n
 */
export default function stirlerr(n: number): number {
  const s_coeffs: number[] = [
    0.083333333333333333333,
    0.00277777777777777777778,
    0.00079365079365079365079365,
    0.000595238095238095238095238,
    0.0008417508417508417508417508,
    0.0019175269175269175269175262,
    0.0064102564102564102564102561,
    0.029550653594771241830065352,
    0.17964437236883057316493850,
    1.3924322169059011164274315,
    13.402864044168391994478957,
    156.84828462600201730636509,
    2193.1033333333333333333333,
    36108.771253724989357173269,
    691472.26885131306710839498,
    15238221.539407416192283370,
    382900751.39141414141414141
  ];

  const sferr_halves: number[] = [
    0.0,
    0.1534264097200273452913848,
    0.0810614667953272582196702,
    0.0548141210519176538961390,
    0.0413406959554092940938221,
    0.03316287351993628748511048,
    0.02767792568499833914878929,
    0.02374616365629749597132920,
    0.02079067210376509311152277,
    0.01848845053267318523077934,
    0.01664469118982119216319487,
    0.01513497322191737887351255,
    0.01387612882307074799874573,
    0.01281046524292022692424986,
    0.01189670994589177009505572,
    0.01110455975820691732662991,
    0.010411265261972096497478567,
    0.009799416126158803298389475,
    0.009255462182712732917728637,
    0.008768700134139385462952823,
    0.008330563433362871256469318,
    0.007934114564314020547248100,
    0.007573675487951840794972024,
    0.007244554301320383179543912,
    0.006942840107209529865664152,
    0.006665247032707682442354394,
    0.006408994188004207068439631,
    0.006171712263039457647532867,
    0.005951370112758847735624416,
    0.005746216513010115682023589,
    0.005554733551962801371038690
  ];

  if (n <= 5.25) {
    if (n >= 1) {
      const l_n: number = Math.log(n);
      return lgamma(n) + n * (1 - l_n) + ldexp(l_n - LOG_2PI, -1);
    }
    else {
      return lgamma1p(n) - (n + 0.5) * Math.log(n) + n - LOG_SQRT_2PI;
    }
  }

  let nn: number = n + n;
  if (n <= 15 && nn === Math.trunc(nn)) {
    return sferr_halves[nn];
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
