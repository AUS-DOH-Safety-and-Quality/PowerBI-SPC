import { at } from "powerbi-visuals-core/util";
import { isValidNumber } from "powerbi-visuals-core/data";
import type { AxisBounds } from "powerbi-visuals-core/rendering";
import type viewModelClass from "../Classes/viewModelClass";

/** Running min/max that skip blank and non-finite entries */
function finiteMin(current: number, value: number | undefined): number {
  return isValidNumber(value) ? Math.min(current, value) : current;
}

function finiteMax(current: number, value: number | undefined): number {
  return isValidNumber(value) ? Math.max(current, value) : current;
}

/** Explicit axis limits win; otherwise the keys span x, and the values, limits and targets span y */
export default function axisRanges(viewModel: viewModelClass): { x: AxisBounds; y: AxisBounds } {
  const controlLimits = at(viewModel.controlLimits, 0);
  const { settings: inputSettings, derivedSettings } = viewModel.inputSettings.group(0);

  const limitMultiplier: number = inputSettings.y_axis.limit_multiplier;
  let maxValue: number = Number.NEGATIVE_INFINITY;
  let minValue: number = Number.POSITIVE_INFINITY;
  let maxValueOrLimit: number = Number.NEGATIVE_INFINITY;
  let minValueOrLimit: number = Number.POSITIVE_INFINITY;
  let maxTarget: number = Number.NEGATIVE_INFINITY;
  let minTarget: number = Number.POSITIVE_INFINITY;
  let minKey: number = Number.POSITIVE_INFINITY;
  let maxKey: number = Number.NEGATIVE_INFINITY;
  for (let i = 0; i < controlLimits.keys.length; i++) {
    const key = at(controlLimits.keys, i);
    const value = at(controlLimits.values, i);
    const altTarget = controlLimits.alt_target[i];
    const target = controlLimits.target[i];
    maxValue = finiteMax(maxValue, value);
    minValue = finiteMin(minValue, value);
    maxValueOrLimit = finiteMax(maxValueOrLimit, value);
    maxValueOrLimit = finiteMax(maxValueOrLimit, controlLimits.ul99[i]);
    maxValueOrLimit = finiteMax(maxValueOrLimit, controlLimits.speclimits_upper[i]);
    maxValueOrLimit = finiteMax(maxValueOrLimit, altTarget);
    minValueOrLimit = finiteMin(minValueOrLimit, value);
    minValueOrLimit = finiteMin(minValueOrLimit, controlLimits.ll99[i]);
    minValueOrLimit = finiteMin(minValueOrLimit, controlLimits.speclimits_lower[i]);
    minValueOrLimit = finiteMin(minValueOrLimit, altTarget);
    maxTarget = finiteMax(maxTarget, target);
    minTarget = finiteMin(minTarget, target);
    minKey = Math.min(minKey, key.x);
    maxKey = Math.max(maxKey, key.x);
  }
  if (!isValidNumber(maxTarget)) {
    maxTarget = (maxValueOrLimit - minValueOrLimit) / 2 + minValueOrLimit;
  }
  if (!isValidNumber(minTarget)) {
    minTarget = (maxValueOrLimit - minValueOrLimit) / 2 + minValueOrLimit;
  }

  const upperLimitRaw: number = maxTarget + (maxValueOrLimit - maxTarget) * limitMultiplier;
  const lowerLimitRaw: number = minTarget - (minTarget - minValueOrLimit) * limitMultiplier;
  const multiplier: number = derivedSettings.multiplier;

  // Assume that observed values above 100% or below 0% are intentional, and do not truncate
  const yUpperLimit: number = inputSettings.y_axis.ylimit_u
    ?? ((derivedSettings.percentLabels && !(maxValue > (1 * multiplier))) ? Math.min(upperLimitRaw, 1 * multiplier) : upperLimitRaw);
  const yLowerLimit: number = inputSettings.y_axis.ylimit_l
    ?? ((derivedSettings.percentLabels && !(minValue < 0)) ? Math.max(lowerLimitRaw, 0) : lowerLimitRaw);

  return {
    x: {
      lower: inputSettings.x_axis.xlimit_l ?? minKey,
      upper: inputSettings.x_axis.xlimit_u ?? maxKey
    },
    y: { lower: yLowerLimit, upper: yUpperLimit }
  };
}
