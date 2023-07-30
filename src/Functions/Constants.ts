import { sqrt, exp, lgamma, square } from "./broadcastUnary";
import broadcastUnary from "./broadcastUnary";
import broadcastBinary from "./broadcastBinary";

export const c4 = broadcastUnary(
  (sampleSize: number): number => {
    if ((sampleSize <= 1) || (sampleSize === null)) {
      return null;
    }
    const Nminus1: number = sampleSize - 1;

    return sqrt(2.0 / Nminus1)
            * exp(lgamma(sampleSize / 2.0) - lgamma(Nminus1 / 2.0));
  }
);

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
  (sampleSize: number, use95: boolean): number => {
    const sigma: number = use95 ? 2 : 3;
    return (sigma * c5(sampleSize)) / c4(sampleSize);
  }
)

export const b3 = broadcastBinary(
  (sampleSize: number, use95: boolean): number => {
    return 1 - b_helper(sampleSize, use95);
  }
);

export const b4 = broadcastBinary(
  (sampleSize: number, use95: boolean): number => {
    return 1 + b_helper(sampleSize, use95);
  }
);
