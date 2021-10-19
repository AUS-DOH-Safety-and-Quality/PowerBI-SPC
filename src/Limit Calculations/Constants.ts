import * as rmath from "lib-r-math.js";
import { sqrt } from "./HelperFunctions";
import { pow } from "./HelperFunctions";
import { subtract } from "./HelperFunctions";
import { add } from "./HelperFunctions";
import { exp } from "./HelperFunctions";

function c4(sampleSizes: number[]): number[] {
    let filt_samp: number[] = sampleSizes.map(d => d <= 1 ? null : d);
    let Nminus1: number[] = subtract(filt_samp, 1);
    let lg_n2: number[] = rmath.special.lgamma(rmath.R.div(filt_samp, 2));
    let lg_n12: number[] = rmath.special.lgamma(rmath.R.div(Nminus1,2));
    let term1: number[] = sqrt(rmath.R.div(2, Nminus1));
    let term2: number[] = exp(subtract(lg_n2,lg_n12));

    return rmath.R.mult(term1, term2);
  }

function c5(sampleSizes: number[]): number[] {
    return sqrt(subtract(1,pow(c4(sampleSizes), 2)));
}

function a3(sampleSizes: number[]): number[] {
    let filt_samp: number[] = sampleSizes.map(d => d <= 1 ? null : d);
    return rmath.R.div(3,rmath.R.mult(c4(filt_samp), sqrt(filt_samp)));
}

function b_helper(sampleSizes: number[]): number[] {
    return rmath.R.div(rmath.R.mult(3, c5(sampleSizes)), c4(sampleSizes));
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
