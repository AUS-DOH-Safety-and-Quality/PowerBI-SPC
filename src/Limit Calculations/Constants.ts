import { sqrt, pow, subtract, add, exp, multiply, divide, lgamma } from "./HelperFunctions";

function c4(sampleSizes: number[]): number[] {
    let filt_samp: number[] = sampleSizes.map(d => d <= 1 ? null : d);
    let Nminus1: number[] = subtract(filt_samp, 1);
    let lg_n2: number[] = lgamma(divide(filt_samp, 2));
    let lg_n12: number[] = lgamma(divide(Nminus1,2));
    let term1: number[] = sqrt(divide(2, Nminus1));
    let term2: number[] = exp(subtract(lg_n2,lg_n12));

    return multiply(term1, term2);
  }

function c5(sampleSizes: number[]): number[] {
    return sqrt(subtract(1,pow(c4(sampleSizes), 2)));
}

function a3(sampleSizes: number[]): number[] {
    let filt_samp: number[] = sampleSizes.map(d => d <= 1 ? null : d);
    return divide(3,multiply(c4(filt_samp), sqrt(filt_samp)));
}

function b_helper(sampleSizes: number[]): number[] {
    return divide(multiply(3, c5(sampleSizes)), c4(sampleSizes));
}

function b3(sampleSizes: number[]): number[] {
    return subtract(1, b_helper(sampleSizes));
}

function b4(sampleSizes: number[]): number[] {
    return add(1, b_helper(sampleSizes));
}

export { a3 };
export { b3 };
export { b4 };
