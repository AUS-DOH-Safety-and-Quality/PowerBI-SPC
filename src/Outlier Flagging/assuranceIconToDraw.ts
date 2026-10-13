import type { controlLimitsObject } from "../Classes/viewModelClass";
import type { settingsValueType } from "../settings";
import type derivedSettingsClass from "../Classes/derivedSettingsClass";
import type { NhsIconName } from "../D3 Plotting Functions/NHS Icons";

/**
 * Assurance icon: a target outside the last 99% limits is consistently met or missed; inside them it is inconsistent.
 * No icon without an alt. target or limits at the last point.
 */
export default function assuranceIconToDraw(controlLimits: Readonly<controlLimitsObject>,
                                            inputSettings: Readonly<settingsValueType>,
                                            derivedSettings: Readonly<derivedSettingsClass>): NhsIconName | "none" {
  if (!(derivedSettings.chart_type_props.has_control_limits)) {
    return "none";
  }
  const imp_direction = inputSettings.outliers.improvement_direction;
  const ll99 = controlLimits.ll99;
  const ul99 = controlLimits.ul99;

  if (!inputSettings.lines.show_alt_target || imp_direction === "neutral") {
    return "none";
  }

  const N: number = ll99.length - 1;
  const alt_target = controlLimits.alt_target[N];
  const upper = ul99[N];
  const lower = ll99[N];
  const impDirectionIncrease: boolean = imp_direction === "increase";

  if (alt_target === undefined || upper === undefined || lower === undefined) {
    return "none";
  }
  if (alt_target > upper) {
    return impDirectionIncrease ? "consistentFail" : "consistentPass";
  }
  if (alt_target < lower) {
    return impDirectionIncrease ? "consistentPass" : "consistentFail";
  }
  return "inconsistent";
}
