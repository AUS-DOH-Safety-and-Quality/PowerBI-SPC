import { isValidNumber } from "powerbi-visuals-core/data";
import type { AxisBounds } from "powerbi-visuals-core/rendering";
import type viewModelClass from "../Classes/viewModelClass";

/** Math.min/max order -0 and +0 as Core's min/max do; non-finite entries are skipped */
function finiteMin(current: number, value: number | undefined): number {
  return isValidNumber(value) ? Math.min(current, value) : current;
}

function finiteMax(current: number, value: number | undefined): number {
  return isValidNumber(value) ? Math.max(current, value) : current;
}

/** Explicit axis limits win; otherwise the keys span x, and the values, limits and targets span y */
export default function axisRanges(viewModel: viewModelClass): { x: AxisBounds; y: AxisBounds } {
  const controlLimits = viewModel.controlLimits[0];
  const inputSettings = viewModel.inputSettings.settings[0];
  const derivedSettings = viewModel.inputSettings.derivedSettings[0];

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
    const value = controlLimits.values[i];
    const altTarget = controlLimits.alt_targets[i];
    const target = controlLimits.targets[i];
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
    minKey = Math.min(minKey, controlLimits.keys[i].x);
    maxKey = Math.max(maxKey, controlLimits.keys[i].x);
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
