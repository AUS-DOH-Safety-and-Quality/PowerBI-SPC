import { divide, rep, median, extractValues } from "../Functions";
import { type controlLimitsObject, type controlLimitsArgs } from "../Classes";

export default function runLimits(args: controlLimitsArgs): controlLimitsObject {
  const useRatio: boolean = (args.denominators && args.denominators.length > 0);
  const ratio: number[] = useRatio
    ? divide(args.numerators, args.denominators)
    : args.numerators;

  const cl: number = median(extractValues(ratio, args.subset_points));
  return {
    keys: args.keys,
    values: ratio.map(d => isNaN(d) ? 0 : d),
    numerators: useRatio ? args.numerators : undefined,
    denominators: useRatio ? args.denominators : undefined,
    targets: rep(cl, args.keys.length)
  };
}
