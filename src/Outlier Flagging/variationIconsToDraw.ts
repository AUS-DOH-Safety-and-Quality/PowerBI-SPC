import { at } from "powerbi-visuals-core/util";
import type { settingsValueType } from "../settings";
import type { outliersObject } from "../Classes/viewModelClass";
import type { NhsIconName } from "../D3 Plotting Functions/NHS Icons";
import type { FlagDirection } from "powerbi-visuals-core/data";

/** Variation icons for the flagged points (or only the last, per flag_last_point); common cause if none. */
export default function variationIconsToDraw(outliers: Readonly<outliersObject>, inputSettings: Readonly<settingsValueType>): NhsIconName[] {
  // Improvement and concern icons by direction; a neutral direction only ever raises the neutral flags
  const direction_icons = {
    increase: { improvement: "improvementHigh", deterioration: "concernLow" },
    decrease: { improvement: "improvementLow", deterioration: "concernHigh" }
  } as const satisfies Record<string, Record<"improvement" | "deterioration", NhsIconName>>;
  const imp_direction = inputSettings.outliers.improvement_direction;
  const icons = imp_direction === "neutral" ? undefined : direction_icons[imp_direction];
  const flag_last: boolean = inputSettings.nhs_icons.flag_last_point;

  const startIndex: number = flag_last ? outliers.astpoint.length - 1 : 0;
  const patterns: readonly (readonly FlagDirection[])[] = [outliers.astpoint, outliers.shift, outliers.trend, outliers.two_in_three];
  let improvementPresent: boolean = false;
  let deteriorationPresent: boolean = false;
  let neutralLowPresent: boolean = false;
  let neutralHighPresent: boolean = false;

  for (let i: number = startIndex; i < outliers.astpoint.length; i++) {
    for (let p = 0; p < patterns.length; p++) {
      switch (at(at(patterns, p), i)) {
        case "improvement":
          improvementPresent = true;
          break;
        case "deterioration":
          deteriorationPresent = true;
          break;
        case "neutral_low":
          neutralLowPresent = true;
          break;
        case "neutral_high":
          neutralHighPresent = true;
          break;
        case "none":
          break;
      }
    }
    if (improvementPresent && deteriorationPresent && neutralLowPresent && neutralHighPresent) {
      break;
    }
  }

  const iconsPresent: NhsIconName[] = [];

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

  if (iconsPresent.length === 0) {
    iconsPresent.push("commonCause")
  }

  return iconsPresent;
}
