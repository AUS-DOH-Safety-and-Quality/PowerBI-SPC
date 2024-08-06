import type { controlLimitsObject, defaultSettingsType, derivedSettingsClass } from "../Classes";
import { isNullOrUndefined } from "../Functions";

export default function assuranceIconToDraw(controlLimits: controlLimitsObject,
                                            inputSettings: defaultSettingsType,
                                            derivedSettings: derivedSettingsClass): string {
  if (!(derivedSettings.chart_type_props.has_control_limits)) {
    return "none";
  }
  const imp_direction: string = inputSettings.outliers.improvement_direction;
  const N: number = controlLimits.ll99.length - 1;
  const alt_target: number = controlLimits?.alt_targets?.[N];

  if (isNullOrUndefined(alt_target) || imp_direction === "neutral") {
    return "none";
  }

  const impDirectionIncrease: boolean = imp_direction === "increase";

  if (alt_target > controlLimits.ul99[N]) {
    return impDirectionIncrease ? "consistentFail" : "consistentPass";
  } else if (alt_target < controlLimits.ll99[N]) {
    return impDirectionIncrease ? "consistentPass" : "consistentFail";
  } else {
    return "inconsistent";
  }
}
