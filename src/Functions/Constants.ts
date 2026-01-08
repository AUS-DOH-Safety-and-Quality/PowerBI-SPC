import { sqrt, exp, lgamma, square, broadcastUnary, broadcastBinary, isNullOrUndefined } from "../Functions";

export function c4(sampleSize: number): number {
  if ((sampleSize <= 1) || isNullOrUndefined(sampleSize)) {
    return null;
  }
  const Nminus1: number = sampleSize - 1;

  return sqrt(2.0 / Nminus1)
          * exp(lgamma(sampleSize / 2.0) - lgamma(Nminus1 / 2.0));
}

export const c5 = broadcastUnary(
  (sampleSize: number): number => {
    return sqrt(1 - square(c4(sampleSize)));
  }
);

export const a3 = broadcastUnary(
  (sampleSize: number): number => {
    const filt_samp: number = sampleSize  <= 1 ? null : sampleSize;
    return 3.0 / (c4(filt_samp) * sqrt(filt_samp));
  }
);

const b_helper = broadcastBinary(
  (sampleSize: number, sigma: number): number => {
    return (sigma * c5(sampleSize)) / c4(sampleSize);
  }
)

export const b3 = broadcastBinary(
  (sampleSize: number, sigma: number): number => {
    return 1 - b_helper(sampleSize, sigma);
  }
);

export const b4 = broadcastBinary(
  (sampleSize: number, sigma: number): number => {
    return 1 + b_helper(sampleSize, sigma);
  }
);

export const LOG_2PI: number = 1.837877066409345483560659472811;
export const LOG_SQRT_2PI: number = 0.918938533204672741780329736406;
export const LOG_SQRT_PI_DIV_2: number = 0.225791352644727432363097614947;
export const EULER: number = 0.5772156649015328606065120900824024;
