import type { controlLimitsObject } from "../Classes/viewModelClass";
import type { settingsValueType } from "../settings";
import type derivedSettingsClass from "../Classes/derivedSettingsClass";
import isNullOrUndefined from "../Functions/isNullOrUndefined";

/**
 * Determines which assurance icon to display based on the relationship between
 * the alternative target and the 99% control limits.
 *
 * This function evaluates whether the alternative target is consistently achievable
 * (inside control limits), consistently failing (outside control limits), or
 * inconsistent with the process capability.
 *
 * @param controlLimits - Object containing control limit arrays and alternative targets
 * @param inputSettings - User-defined settings including improvement direction
 * @param derivedSettings - Derived settings including chart type properties
 * @returns Icon identifier: "consistentPass", "consistentFail", "inconsistent", or "none"
 */
export default function assuranceIconToDraw(controlLimits: Readonly<controlLimitsObject>,
                                            inputSettings: Readonly<settingsValueType>,
                                            derivedSettings: Readonly<derivedSettingsClass>): string {
  // Return "none" if chart type doesn't support control limits
  if (!(derivedSettings.chart_type_props.has_control_limits)) {
    return "none";
  }
  const imp_direction: string = inputSettings.outliers.improvement_direction;
  const N: number = controlLimits.ll99!.length - 1;

  // No assurance icon if no alternative target or neutral improvement direction
  if (isNullOrUndefined(controlLimits?.alt_targets) || imp_direction === "neutral") {
    return "none";
  }

  const alt_target: number = controlLimits.alt_targets![N] as number;
  const impDirectionIncrease: boolean = imp_direction === "increase";

  // Target is above upper 99% limit
  if (alt_target > (controlLimits.ul99![N] as number)) {
    return impDirectionIncrease ? "consistentFail" : "consistentPass";
  // Target is below lower 99% limit
  } else if (alt_target < (controlLimits.ll99![N] as number)) {
    return impDirectionIncrease ? "consistentPass" : "consistentFail";
  // Target is within control limits (inconsistent)
  } else {
    return "inconsistent";
  }
}
