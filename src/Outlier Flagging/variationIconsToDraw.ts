import type { settingsValueType } from "../settings";
import type { outliersObject } from "../Classes/viewModelClass";
import type { NhsIconName } from "../D3 Plotting Functions/NHS Icons";
import type { FlagDirection } from "powerbi-visuals-core/data";

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
export default function variationIconsToDraw(outliers: Readonly<outliersObject>, inputSettings: Readonly<settingsValueType>): NhsIconName[] {
  // Improvement and concern icons by direction; a neutral direction only ever raises the neutral flags
  const direction_icons = {
    increase: { improvement: "improvementHigh", deterioration: "concernLow" },
    decrease: { improvement: "improvementLow", deterioration: "concernHigh" }
  } as const satisfies Record<string, Record<"improvement" | "deterioration", NhsIconName>>;
  const imp_direction = inputSettings.outliers.improvement_direction;
  const icons = imp_direction === "neutral" ? undefined : direction_icons[imp_direction];
  const flag_last: boolean = inputSettings.nhs_icons.flag_last_point;

  // Collect flags from either just the last point or all points
  const startIndex: number = flag_last ? outliers.astpoint.length - 1 : 0;
  let improvementPresent: boolean = false;
  let deteriorationPresent: boolean = false;
  let neutralLowPresent: boolean = false;
  let neutralHighPresent: boolean = false;

  for (let i: number = startIndex; i < outliers.astpoint.length; i++) {
    const flagsToCheck: readonly FlagDirection[] = [outliers.astpoint[i], outliers.shift[i], outliers.trend[i], outliers.two_in_three[i]];

    improvementPresent = improvementPresent || flagsToCheck.includes("improvement");
    deteriorationPresent = deteriorationPresent || flagsToCheck.includes("deterioration");
    neutralLowPresent = neutralLowPresent || flagsToCheck.includes("neutral_low");
    neutralHighPresent = neutralHighPresent || flagsToCheck.includes("neutral_high");

    // Exit early if all types of variation are detected (no need to check further)
    if (improvementPresent && deteriorationPresent && neutralLowPresent && neutralHighPresent) {
      break;
    }
  }

  const iconsPresent: NhsIconName[] = [];

  // Check for each type of variation and add appropriate icon
  if (improvementPresent && icons !== undefined) {
    iconsPresent.push(icons.improvement)
  }
  if (deteriorationPresent && icons !== undefined) {
    iconsPresent.push(icons.deterioration)
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
