import { sqrt, exp, lgamma, square } from "./UnaryFunctions";
import broadcast_unary from "./UnaryFunctions";
import broadcast_binary from "./BinaryFunctions";

function c4(sampleSize: number): number {
  const Nminus1: number = sampleSize - 1;

  return sqrt(2.0 / Nminus1)
          * exp(lgamma(sampleSize / 2.0) - lgamma(Nminus1 / 2.0));
}

function c5(sampleSize: number): number {
  return sqrt(1 - square(c4(sampleSize) as number));
}

export const a3 = broadcast_unary(
  (sampleSize: number): number | null => {
    if ((sampleSize === null) || (sampleSize <= 1)) {
      return null;
    }
    return 3.0 / (c4(sampleSize) as number * sqrt(sampleSize));
  }
);

const b_helper = broadcast_binary(
  (sampleSize: number, use95: boolean): number => {
    const sigma: number = use95 ? 2 : 3;
    return (sigma * c5(sampleSize)) / c4(sampleSize);
  }
)

export const b3 = broadcast_binary(
  (sampleSize: number, use95: boolean): number | null => {
    if ((sampleSize === null) || (sampleSize <= 1)) {
      return null;
    }
    return 1 - b_helper(sampleSize, use95);
  }
);

export const b4 = broadcast_binary(
  (sampleSize: number, use95: boolean): number | null => {
    if ((sampleSize === null) || (sampleSize <= 1)) {
      return null;
    }
    return 1 + b_helper(sampleSize, use95);
  }
);
