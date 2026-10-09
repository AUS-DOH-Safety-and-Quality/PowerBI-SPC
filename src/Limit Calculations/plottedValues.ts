import type { controlLimitsArgs } from "../Classes/viewModelClass";

/** Ratios when denominators are supplied, otherwise the raw numerators; the pair is kept for the summary table */
export default function plottedValues(args: Readonly<controlLimitsArgs>): { values: number[]; numerators?: number[]; denominators?: number[] } {
  const numerators = args.numerators;
  const denominators = args.denominators;
  if (denominators === undefined || denominators.length === 0) {
    return { values: numerators.slice() };
  }
  const values = new Array<number>(numerators.length);
  for (let i = 0; i < values.length; i++) {
    values[i] = numerators[i] / denominators[i];
  }
  return { values, numerators, denominators };
}
