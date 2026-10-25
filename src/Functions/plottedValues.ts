import { at } from "powerbi-visuals-core/util";
import type { controlLimitsArgs } from "../Classes/viewModelClass";

/** Ratios when denominators are supplied, otherwise the raw numerators; the pair is kept for the summary table */
export default function plottedValues(args: controlLimitsArgs): { values: readonly number[]; numerators?: readonly number[]; denominators?: readonly number[] } {
  const numerators = args.numerators;
  const denominators = args.denominators;
  if (denominators === undefined) {
    return { values: numerators };
  }
  const values = new Array<number>(numerators.length);
  for (let i = 0; i < values.length; i++) {
    values[i] = at(numerators, i) / at(denominators, i);
  }
  return { values, numerators, denominators };
}
