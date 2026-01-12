import type { defaultSettingsType } from "../Classes/settingsClass";
import type { outliersObject } from "../Classes/viewModelClass";

/**
 * Determines which variation icons to display based on detected outliers and improvement direction.
 *
 * This function examines all detected outliers (astronomical points, shifts, trends, and
 * two-in-three) and returns the appropriate icon identifiers. Icons are adjusted based on
 * the improvement direction (increase/decrease/neutral) and can be filtered to show only
 * the last point or all points.
 *
 * @param outliers - Object containing all detected outlier arrays
 * @param inputSettings - User-defined settings including improvement direction and flag settings
 * @returns Array of icon identifiers to display (e.g., "improvementHigh", "concernLow", "commonCause")
 */
export default function variationIconsToDraw(outliers: outliersObject, inputSettings: defaultSettingsType): string[] {
  const imp_direction: string = inputSettings.outliers.improvement_direction;

  // Map improvement direction to suffix for icon names
  const suffix_map: Record<string, string> = {
    "increase" : "High",
    "decrease" : "Low",
    "neutral" : ""
  }
  // Invert suffix for concern icons (deterioration is opposite of improvement)
  const invert_suffix_map: Record<string, string> = {
    "High" : "Low",
    "Low" : "High",
    "" : ""
  }
  const suffix: string = suffix_map[imp_direction];
  const flag_last: boolean = inputSettings.nhs_icons.flag_last_point;
  let allFlags: string[];

  // Collect flags from either just the last point or all points
  if (flag_last) {
    const N: number = outliers.astpoint.length - 1;
    allFlags = [outliers.astpoint[N], outliers.shift[N], outliers.trend[N], outliers.two_in_three[N]];
  } else {
    allFlags = outliers.astpoint.concat(outliers.shift, outliers.trend, outliers.two_in_three);
  }

  const iconsPresent: string[] = new Array<string>();

  // Check for each type of variation and add appropriate icon
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

  // No triggers/outliers detected - show common cause variation icon
  if (iconsPresent.length === 0) {
    iconsPresent.push("commonCause")
  }

  return iconsPresent;
}
