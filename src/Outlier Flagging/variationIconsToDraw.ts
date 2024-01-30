import type { viewModelClass, outliersObject } from "../Classes";

export default function variationIconsToDraw(viewModel: viewModelClass): string[] {
  const currLimits: outliersObject = viewModel.outliers;
  const imp_direction: string = viewModel.inputSettings.settings.outliers.improvement_direction;
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
  const flag_last: boolean = viewModel.inputSettings.settings.nhs_icons.flag_last_point;
  let allFlags: string[];
  if (flag_last) {
    const N: number = currLimits.astpoint.length - 1;
    allFlags = [currLimits.astpoint[N], currLimits.shift[N], currLimits.trend[N], currLimits.two_in_three[N]];
  } else {
    allFlags = currLimits.astpoint.concat(currLimits.shift, currLimits.trend, currLimits.two_in_three);
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
