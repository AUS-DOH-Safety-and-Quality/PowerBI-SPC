import chebyshev_polynomial from "./chebyshev_polynomial";
import sinpi from "./sinpi";
import lgammacor from "./lgammacor";
import stirlerr from "./stirlerr";
import { LOG_SQRT_2PI } from "./Constants";

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
  const gamcs: number[] = [
    .8571195590989331421920062399942e-2,
    .4415381324841006757191315771652e-2,
    .5685043681599363378632664588789e-1,
    -.4219835396418560501012500186624e-2,
    .1326808181212460220584006796352e-2,
    -.1893024529798880432523947023886e-3,
    .3606925327441245256578082217225e-4,
    -.6056761904460864218485548290365e-5,
    .1055829546302283344731823509093e-5,
    -.1811967365542384048291855891166e-6,
    .3117724964715322277790254593169e-7,
    -.5354219639019687140874081024347e-8,
    .9193275519859588946887786825940e-9,
    -.1577941280288339761767423273953e-9,
    .2707980622934954543266540433089e-10,
    -.4646818653825730144081661058933e-11,
    .7973350192007419656460767175359e-12,
    -.1368078209830916025799499172309e-12,
    .2347319486563800657233471771688e-13,
    -.4027432614949066932766570534699e-14,
    .6910051747372100912138336975257e-15,
    -.1185584500221992907052387126192e-15,
    .2034148542496373955201026051932e-16,
    -.3490054341717405849274012949108e-17,
    .5987993856485305567135051066026e-18,
    -.1027378057872228074490069778431e-18,
    .1762702816060529824942759660748e-19,
    -.3024320653735306260958772112042e-20,
    .5188914660218397839717833550506e-21,
    -.8902770842456576692449251601066e-22,
    .1527474068493342602274596891306e-22,
    -.2620731256187362900257328332799e-23,
    .4496464047830538670331046570666e-24,
    -.7714712731336877911703901525333e-25,
    .1323635453126044036486572714666e-25,
    -.2270999412942928816702313813333e-26,
    .3896418998003991449320816639999e-27,
    -.6685198115125953327792127999999e-28,
    .1146998663140024384347613866666e-28,
    -.1967938586345134677295103999999e-29,
    .3376448816585338090334890666666e-30,
    -.5793070335782135784625493333333e-31
  ];

  const dxrel: number = 1.490116119384765696e-8;

  if (Number.isNaN(x)) {
    return Number.NaN;
  }

  if (x == 0 || (x < 0 && x === Math.trunc(x))) {
    return Number.NaN;
  }

  let y: number = Math.abs(x);
  let value: number;

  if (y <= 10) {
    let n: number = Math.trunc(x);
    if (x < 0) {
      n--;
    }
    y = x - n;
    n--;
    value = chebyshev_polynomial(y * 2 - 1, gamcs, 22) + .9375;
    if (n == 0) {
      return value;
    }

    if (n < 0) {
      if (x < -0.5 && Math.abs(x - Math.trunc(x - 0.5) / x) < dxrel) {
        return Number.NaN;
      }

      if (y < 2.2474362225598545e-308) {
        return x < 0 ? Number.NEGATIVE_INFINITY : Number.POSITIVE_INFINITY;
      }

      n *= -1;

      for (let i: number = 0; i < n; i++) {
        value /= (x + i);
      }
      return value;
    } else {
      for (let i: number = 1; i <= n; i++) {
        value *= (y + i);
      }
      return value;
    }
  } else {
    if (x > 171.61447887182298) {
      return Number.POSITIVE_INFINITY;
    }

    if (x < -170.5674972726612) {
      return 0;
    }

    if (y <= 50 && y == Math.trunc(y)) {
      value = 1;
      for (let i: number = 2; i < y; i++) {
        value *= i;
      }
    } else {
      const two_y: number = 2 * y;
      value = Math.exp((y - 0.5) * Math.log(y) - y + LOG_SQRT_2PI
              + ((two_y == Math.trunc(two_y)) ? stirlerr(y) : lgammacor(y)));
    }

    if (x > 0) {
      return value;
    }

    const sinpiy: number = sinpi(y);
    return (sinpiy === 0) ? Number.POSITIVE_INFINITY : -Math.PI / (y * sinpiy * value);
  }
}
