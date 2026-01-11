import logcf from "./logcf";

/**
 * Computes log(1 + x) - x with improved accuracy for small values of x.
 *
 * This implementation is a TypeScript adaptation of the log1pmx function
 * from the R programming language.
 *
 * @param x The input value
 * @returns The value of log(1 + x) - x
 */
export default function log1pmx(x: number): number {
  if (x > 1 || x < -0.79149064) {
    return Math.log1p(x) - x;
  } else {
    const r: number = x / (2 + x);
    const y: number = r * r;
    if (Math.abs(x) < 1e-2) {
      const coefs: readonly number[] = [2/3, 2/5, 2/7, 2/9];
      let result: number = 0;
      for (let i: number = 0; i < coefs.length; i++) {
        result = (result + coefs[i]) * y;
      }
      return r * (result - x);
    }  else {
      return r * (2 * y * logcf(y, 3, 2, 1e-14) - x);
    }
  }
}
