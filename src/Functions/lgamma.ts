import gamma from "./gamma";
import lgammacor from "./lgammacor";
import sinpi from "./sinpi";

export default function lgamma(x: number): number {
  const xmax: number = 2.5327372760800758e+305;
  const M_LN_SQRT_2PI: number = 0.918938533204672741780329736406;
  const M_LN_SQRT_PId2: number = 0.225791352644727432363097614947;

  if (Number.isNaN(x)) {
    return NaN;
  }

  if (x <= 0 && x === Math.trunc(x)) {
    return Infinity;
  }

  const y: number = Math.abs(x);
  if (y < 1e-306) {
    return -Math.log(y);
  }

  if (y <= 10) {
    return Math.log(Math.abs(gamma(x)));
  }

  if (y > xmax) {
    return Infinity;
  }

  if (x > 0) {
    if (x > 1e17) {
      return x * (Math.log(x) - 1);
    } else if (x > 4934720) {
      return M_LN_SQRT_2PI + (x - 0.5) * Math.log(x) - x;
    } else {
      return M_LN_SQRT_2PI + (x - 0.5) * Math.log(x) - x + lgammacor(x)
    }
  }

  return M_LN_SQRT_PId2 + (x - 0.5) * Math.log(y) - x - Math.log(Math.abs(sinpi(y))) - lgammacor(y);
}
