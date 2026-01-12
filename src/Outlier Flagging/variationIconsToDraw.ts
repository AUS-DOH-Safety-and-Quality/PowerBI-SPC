import type { defaultSettingsType } from "../Classes/settingsClass";
import type { outliersObject } from "../Classes/viewModelClass";

export default function variationIconsToDraw(outliers: outliersObject, inputSettings: defaultSettingsType): string[] {
  const imp_direction: string = inputSettings.outliers.improvement_direction;
  const suffix_map: Record<string, string> = {
    "increase" : "High",
    "decrease" : "Low",
    "neutral" : ""
  }
  const invert_suffix_map: Record<string, string> = {
    "High" : "Low",
    "Low" : "High",
    "" : ""
  }
  const suffix: string = suffix_map[imp_direction];
  const flag_last: boolean = inputSettings.nhs_icons.flag_last_point;
  let allFlags: string[];
  if (flag_last) {
    const N: number = outliers.astpoint.length - 1;
    allFlags = [outliers.astpoint[N], outliers.shift[N], outliers.trend[N], outliers.two_in_three[N]];
  } else {
    allFlags = outliers.astpoint.concat(outliers.shift, outliers.trend, outliers.two_in_three);
  }

  const iconsPresent: string[] = new Array<string>();

  if (allFlags.includes("improvement")) {
    iconsPresent.push("improvement" + suffix)
  }
  if (allFlags.includes("deterioration")) {
    iconsPresent.push("concern" + invert_suffix_map[suffix])
  }
  if (allFlags.includes("neutral_low")) {
    iconsPresent.push("neutralLow")
  }
  if (allFlags.includes("neutral_high")) {
    iconsPresent.push("neutralHigh")
  }

  // No triggers/outliers detected
  if (iconsPresent.length === 0) {
    iconsPresent.push("commonCause")
  }

  return iconsPresent;
}
