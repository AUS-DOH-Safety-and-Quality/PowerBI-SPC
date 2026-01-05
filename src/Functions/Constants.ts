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
