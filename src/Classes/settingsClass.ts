import { SettingsStore, type SettingsGroupRule } from "powerbi-visuals-core/powerbi";
import settingsModel, { type settingsValueType } from "../settings";
import { orderedBoundsError } from "powerbi-visuals-core/settings";
import derivedSettingsClass from "./derivedSettingsClass";

/** Limits from moving ranges, which a single point lacks */
const movingRangeCharts: ReadonlySet<string> = new Set(["i", "i_m", "i_mm", "mr", "t", "pp", "up"]);

const rules: SettingsGroupRule<settingsValueType>[] = [
  settings => {
    const patterns = settings.outliers;
    if (settings.nhs_icons.show_variation_icons && !patterns.astronomical && !patterns.shift && !patterns.trend && !patterns.two_in_three) {
      return "Variation icons require at least one outlier pattern to be selected";
    }
    return undefined;
  },
  settings => {
    const outliers = settings.outliers;
    const flagsOnSpecification = (outliers.astronomical && outliers.astronomical_limit === "Specification")
      || (outliers.two_in_three && outliers.two_in_three_limit === "Specification");
    if (flagsOnSpecification && !settings.lines.show_specification) {
      return "Flagging against specification limits requires the specification lines to be shown";
    }
    return undefined;
  },
  settings => orderedBoundsError(settings, settings.spc),
  settings => {
    if (settings.spc.num_points_subset === 1 && movingRangeCharts.has(settings.spc.chart_type)) {
      return "Moving range limits require a subset of at least 2 points";
    }
    return undefined;
  }
];

export default class settingsClass extends SettingsStore<typeof settingsModel, derivedSettingsClass> {
  constructor() {
    super(settingsModel, settings => new derivedSettingsClass(settings.spc), rules);
  }
}
