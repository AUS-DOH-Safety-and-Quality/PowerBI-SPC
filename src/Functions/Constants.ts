import { sqrt, exp, lgamma, square } from "./UnaryFunctions";
import { subtract, add, multiply, divide } from "./BinaryFunctions";

export function c4(sampleSizes: number[]): number[] {
  const filt_samp: number[] = sampleSizes.map(d => d <= 1 ? null : d);
  const Nminus1: number[] = subtract(filt_samp, 1);
  const lg_n2: number[] = lgamma(divide(filt_samp, 2));
  const lg_n12: number[] = lgamma(divide(Nminus1,2));
  const term1: number[] = sqrt(divide(2, Nminus1));
  const term2: number[] = exp(subtract(lg_n2,lg_n12));

  return multiply(term1, term2);
}

export function c5(sampleSizes: number[]): number[] {
  return sqrt(subtract(1, square(c4(sampleSizes))));
}

export function a3(sampleSizes: number[]): number[] {
  const filt_samp: number[] = sampleSizes.map(d => d <= 1 ? null : d);
  return divide(3, multiply(c4(filt_samp), sqrt(filt_samp)));
}

export function b_helper(sampleSizes: number[], use95: boolean): number[] {
  const sigma: number = use95 ? 2 : 3;
  return divide(multiply(sigma, c5(sampleSizes)), c4(sampleSizes));
}

export function b3(sampleSizes: number[], use95: boolean): number[] {
  return subtract(1, b_helper(sampleSizes, use95));
}

export function b4(sampleSizes: number[], use95: boolean): number[] {
  return add(1, b_helper(sampleSizes, use95));
}
