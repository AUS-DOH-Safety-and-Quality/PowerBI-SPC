import type { settingsValueType } from "../Classes/settingsClass";
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
export default function variationIconsToDraw(outliers: Readonly<outliersObject>, inputSettings: Readonly<settingsValueType>): string[] {
  const imp_direction: string = inputSettings.outliers.improvement_direction;

  // Map improvement direction to suffix for icon names
  const suffix_map = {
    "increase" : "High",
    "decrease" : "Low",
    "neutral" : ""
  } as const;

  // Invert suffix for concern icons (deterioration is opposite of improvement)
  const invert_suffix_map = {
    "High" : "Low",
    "Low" : "High",
    "" : ""
  } as const;

  const suffix: string = suffix_map[imp_direction as keyof typeof suffix_map];
  const flag_last: boolean = inputSettings.nhs_icons.flag_last_point;

  // Collect flags from either just the last point or all points
  const startIndex: number = flag_last ? outliers.astpoint.length - 1 : 0;
  let improvementPresent: boolean = false;
  let deteriorationPresent: boolean = false;
  let neutralLowPresent: boolean = false;
  let neutralHighPresent: boolean = false;

  for (let i: number = startIndex; i < outliers.astpoint.length; i++) {
    const flagsToCheck: readonly string[] = [outliers.astpoint[i], outliers.shift[i], outliers.trend[i], outliers.two_in_three[i]];

    improvementPresent = improvementPresent || flagsToCheck.includes("improvement");
    deteriorationPresent = deteriorationPresent || flagsToCheck.includes("deterioration");
    neutralLowPresent = neutralLowPresent || flagsToCheck.includes("neutral_low");
    neutralHighPresent = neutralHighPresent || flagsToCheck.includes("neutral_high");

    // Exit early if all types of variation are detected (no need to check further)
    if (improvementPresent && deteriorationPresent && neutralLowPresent && neutralHighPresent) {
      break;
    }
  }

  let iconsPresent: string[] = new Array<string>();

  // Check for each type of variation and add appropriate icon
  if (improvementPresent) {
    iconsPresent.push("improvement" + suffix)
  }
  if (deteriorationPresent) {
    iconsPresent.push("concern" + invert_suffix_map[suffix as keyof typeof invert_suffix_map])
  }
  if (neutralLowPresent) {
    iconsPresent.push("neutralLow")
  }
  if (neutralHighPresent) {
    iconsPresent.push("neutralHigh")
  }

  // No triggers/outliers detected - show common cause variation icon
  if (iconsPresent.length === 0) {
    iconsPresent.push("commonCause")
  }

  return iconsPresent;
}
