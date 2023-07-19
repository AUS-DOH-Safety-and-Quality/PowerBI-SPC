import { sqrt, exp, lgamma, square } from "./UnaryFunctions";
import broadcast_unary from "./UnaryFunctions";
import broadcast_binary from "./BinaryFunctions";

export const c4 = broadcast_unary(
  (sampleSize: number): number => {
    if ((sampleSize <= 1) || (sampleSize === null)) {
      return null;
    }
    const Nminus1: number = sampleSize - 1;

    return sqrt(2.0 / Nminus1)
            * exp(lgamma(sampleSize / 2.0) - lgamma(Nminus1 / 2.0));
  }
);

export const c5 = broadcast_unary(
  (sampleSize: number): number => {
    return sqrt(1 - square(c4(sampleSize)));
  }
);

export const a3 = broadcast_unary(
  (sampleSize: number): number => {
    const filt_samp: number = sampleSize  <= 1 ? null : sampleSize;
    return 3.0 / (c4(filt_samp) * sqrt(filt_samp));
  }
);

const b_helper = broadcast_binary(
  (sampleSize: number, use95: boolean): number => {
    const sigma: number = use95 ? 2 : 3;
    return (sigma * c5(sampleSize)) / c4(sampleSize);
  }
)

export const b3 = broadcast_binary(
  (sampleSize: number, use95: boolean): number => {
    return 1 - b_helper(sampleSize, use95);
  }
);

export const b4 = broadcast_binary(
  (sampleSize: number, use95: boolean): number => {
    return 1 + b_helper(sampleSize, use95);
  }
);
