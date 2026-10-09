import { min, max } from "powerbi-visuals-core/math";
import { isValidNumber } from "powerbi-visuals-core/data";
import type { AxisBounds } from "powerbi-visuals-core/rendering";
import type viewModelClass from "../Classes/viewModelClass";

// Explicit axis limits win; otherwise the keys span x, and the values, limits and targets span y
export default function axisRanges(viewModel: viewModelClass): { x: AxisBounds; y: AxisBounds } {
  const controlLimits = viewModel.controlLimits[0];
  const inputSettings = viewModel.inputSettings.settings[0];
  const derivedSettings = viewModel.inputSettings.derivedSettings[0];

  const limitMultiplier: number = inputSettings.y_axis.limit_multiplier;
  const values: number[] = controlLimits.values.filter(d => isValidNumber(d));
  const ul99: number[] = controlLimits.ul99.filter(d => isValidNumber(d));
  const speclimits_upper: number[] = controlLimits.speclimits_upper.filter(d => isValidNumber(d));
  const ll99: number[] = controlLimits.ll99.filter(d => isValidNumber(d));
  const speclimits_lower: number[] = controlLimits.speclimits_lower.filter(d => isValidNumber(d));
  const alt_targets: number[] = controlLimits.alt_targets.filter(d => isValidNumber(d));
  const targets: number[] = controlLimits.targets.filter(d => isValidNumber(d));

  const maxValue: number = max(values);
  const maxValueOrLimit: number = max(values.concat(ul99).concat(speclimits_upper).concat(alt_targets));
  const minValueOrLimit: number = min(values.concat(ll99).concat(speclimits_lower).concat(alt_targets));
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
  const yUpperLimit: number = inputSettings.y_axis.ylimit_u
    ?? ((derivedSettings.percentLabels && !(maxValue > (1 * multiplier))) ? Math.min(upperLimitRaw, 1 * multiplier) : upperLimitRaw);
  const yLowerLimit: number = inputSettings.y_axis.ylimit_l
    ?? (derivedSettings.percentLabels ? Math.max(lowerLimitRaw, 0) : lowerLimitRaw);

  const keysToPlot: number[] = controlLimits.keys.map(d => d.x);
  return {
    x: { lower: inputSettings.x_axis.xlimit_l ?? min(keysToPlot), upper: inputSettings.x_axis.xlimit_u ?? max(keysToPlot) },
    y: { lower: yLowerLimit, upper: yUpperLimit }
  };
}
