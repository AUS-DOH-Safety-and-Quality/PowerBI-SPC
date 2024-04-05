import {defaultSettingsType} from "./settingsClass"

export default class derivedSettingsClass {
  multiplier: number
  percentLabels: boolean
  chart_type_props: {
    needs_denominator: boolean,
    denominator_optional: boolean,
    numerator_non_negative: boolean,
    numerator_leq_denominator: boolean,
    has_control_limits: boolean,
    needs_sd: boolean
  }

  update(inputSettings: defaultSettingsType) {
    const chartType: string = inputSettings.spc.chart_type;
    const pChartType: boolean = ["p", "pp"].includes(chartType);
    const percentSettingString: string = inputSettings.spc.perc_labels;
    let multiplier: number = inputSettings.spc.multiplier;
    let percentLabels: boolean;

    if (percentSettingString === "Yes") {
      multiplier = 100
    }

    if (pChartType && percentSettingString !== "No") {
      multiplier = multiplier === 1 ? 100 : multiplier
    }

    if (percentSettingString === "Automatic") {
      percentLabels = pChartType && multiplier === 100;
    } else {
      percentLabels = percentSettingString === "Yes";
    }

    this.chart_type_props = {
      needs_denominator: ["p", "pp", "u", "up", "xbar", "s"].includes(chartType),
      denominator_optional: ["i", "run", "mr"].includes(chartType),
      numerator_non_negative: ["p", "pp", "u", "up", "s", "c", "g", "t"].includes(chartType),
      numerator_leq_denominator: ["p", "pp", "u", "up"].includes(chartType),
      has_control_limits: !(["run"].includes(chartType)),
      needs_sd: ["xbar"].includes(chartType)
    }

    this.multiplier = multiplier
    this.percentLabels = percentLabels
  }
}
