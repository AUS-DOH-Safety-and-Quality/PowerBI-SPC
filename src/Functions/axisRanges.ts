import { min, max } from "powerbi-visuals-core/math";
import { isNullOrUndefined, isValidNumber } from "powerbi-visuals-core/data";
import type { AxisBounds } from "powerbi-visuals-core/rendering";
import type viewModelClass from "../Classes/viewModelClass";

// Explicit axis limits win; otherwise the keys span x, and the values, limits and targets span y
export default function axisRanges(viewModel: viewModelClass): { x: AxisBounds; y: AxisBounds } {
  const controlLimits = viewModel.controlLimits[0];
  const inputData = viewModel.inputData[0];
  const inputSettings = viewModel.inputSettings.settings[0];
  const derivedSettings = viewModel.inputSettings.derivedSettings[0];

  let xLowerLimit: number | undefined = inputSettings.x_axis.xlimit_l;
  let xUpperLimit: number | undefined = inputSettings.x_axis.xlimit_u;
  let yLowerLimit: number | undefined = inputSettings.y_axis.ylimit_l;
  let yUpperLimit: number | undefined = inputSettings.y_axis.ylimit_u;

  if (inputData?.validationStatus?.status == 0 && controlLimits) {
    const limitMultiplier: number = inputSettings.y_axis.limit_multiplier;
    const values: number[] = controlLimits.values.filter(d => isValidNumber(d));
    const ul99: number[] = controlLimits?.ul99?.filter(d => isValidNumber(d)) ?? [];
    const speclimits_upper: number[] = controlLimits?.speclimits_upper?.filter(d => isValidNumber(d)) ?? [];
    const ll99: number[] = controlLimits?.ll99?.filter(d => isValidNumber(d)) ?? [];
    const speclimits_lower: number[] = controlLimits?.speclimits_lower?.filter(d => isValidNumber(d)) ?? [];
    const alt_targets: number[] = controlLimits.alt_targets?.filter(d => isValidNumber(d)) ?? [];
    const targets: number[] = controlLimits.targets?.filter(d => isValidNumber(d)) ?? [];

    const maxValue: number = max(values);
    const maxValueOrLimit: number = max((values.concat(ul99).concat(speclimits_upper).concat(alt_targets)).filter(d => isValidNumber(d)));
    const minValueOrLimit: number = min((values.concat(ll99).concat(speclimits_lower).concat(alt_targets)).filter(d => isValidNumber(d)));
    let maxTarget: number = max(targets);
    if (!isValidNumber(maxTarget)) {
      maxTarget = (maxValueOrLimit - minValueOrLimit) / 2 + minValueOrLimit;
    }
    let minTarget: number = min(targets);
    if (!isValidNumber(minTarget)) {
      minTarget = (maxValueOrLimit - minValueOrLimit) / 2 + minValueOrLimit;
    }

    const upperLimitRaw: number = maxTarget + (maxValueOrLimit - maxTarget) * limitMultiplier;
    const lowerLimitRaw: number = minTarget - (minTarget - minValueOrLimit) * limitMultiplier;
    const multiplier: number = derivedSettings.multiplier;

    // Assume that observed values > 100% are intentional, and do not truncate
    yUpperLimit ??= (derivedSettings.percentLabels && !(maxValue > (1 * multiplier)))
                    ? Math.min(upperLimitRaw, 1 * multiplier)
                    : upperLimitRaw;

    yLowerLimit ??= derivedSettings.percentLabels
                    ? Math.max(lowerLimitRaw, 0)
                    : lowerLimitRaw;

    const keysToPlot: number[] = controlLimits.keys.map(d => d.x);

    xLowerLimit = !isNullOrUndefined(xLowerLimit)
      ? xLowerLimit
      : min(keysToPlot);

    xUpperLimit = !isNullOrUndefined(xUpperLimit)
      ? xUpperLimit
      : max(keysToPlot);
  }

  return {
    x: { lower: !isNullOrUndefined(xLowerLimit) ? xLowerLimit : 0, upper: xUpperLimit as number },
    y: { lower: yLowerLimit as number, upper: yUpperLimit as number }
  };
}
