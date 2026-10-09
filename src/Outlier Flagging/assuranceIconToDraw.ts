import type { controlLimitsObject } from "../Classes/viewModelClass";
import type { settingsValueType } from "../settings";
import type derivedSettingsClass from "../Classes/derivedSettingsClass";
import type { NhsIconName } from "../D3 Plotting Functions/NHS Icons";

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
                                            derivedSettings: Readonly<derivedSettingsClass>): NhsIconName | "none" {
  // Return "none" if chart type doesn't support control limits
  if (!(derivedSettings.chart_type_props.has_control_limits)) {
    return "none";
  }
  const imp_direction = inputSettings.outliers.improvement_direction;
  const alt_targets = controlLimits.alt_targets;
  const ll99 = controlLimits.ll99;
  const ul99 = controlLimits.ul99;

  // No assurance icon without an alternative target line or under a neutral improvement direction
  if (!inputSettings.lines.show_alt_target || imp_direction === "neutral") {
    return "none";
  }

  const N: number = ll99.length - 1;
  const alt_target = alt_targets[N];
  const upper = ul99[N];
  const lower = ll99[N];
  const impDirectionIncrease: boolean = imp_direction === "increase";

  // Target is above upper 99% limit
  if (alt_target !== undefined && upper !== undefined && alt_target > upper) {
    return impDirectionIncrease ? "consistentFail" : "consistentPass";
  // Target is below lower 99% limit
  } else if (alt_target !== undefined && lower !== undefined && alt_target < lower) {
    return impDirectionIncrease ? "consistentPass" : "consistentFail";
  // Target is within control limits (inconsistent)
  } else {
    return "inconsistent";
  }
}
