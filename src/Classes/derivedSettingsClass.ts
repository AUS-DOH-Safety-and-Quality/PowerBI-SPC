import { defaultSettingsType } from "./settingsClass"

const valueNames: Record<string, string> = {
  "i": "Observation",
  "i_m": "Observation",
  "i_mm": "Observation",
  "c": "Count",
  "t": "Time",
  "xbar": "Group Mean",
  "s": "Group SD",
  "g": "Non-Events",
  "run": "Observation",
  "mr": "Moving Range",
  "p": "Proportion",
  "pp": "Proportion",
  "u": "Rate",
  "up": "Rate"
}

export default class derivedSettingsClass {
  multiplier: number
  percentLabels: boolean
  chart_type_props: {
    name: string,
    needs_denominator: boolean,
    denominator_optional: boolean,
    numerator_non_negative: boolean,
    numerator_leq_denominator: boolean,
    has_control_limits: boolean,
    needs_sd: boolean,
    integer_num_den: boolean,
    value_name: string
  }

  update(inputSettingsSpc: defaultSettingsType["spc"]) {
    const chartType: string = inputSettingsSpc.chart_type;
    const pChartType: boolean = ["p", "pp"].includes(chartType);
    const percentSettingString: string = inputSettingsSpc.perc_labels;
    let multiplier: number = inputSettingsSpc.multiplier;
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
      name: chartType,
      needs_denominator: ["p", "pp", "u", "up", "xbar", "s"].includes(chartType),
      denominator_optional: ["i", "i_m", "i_mm", "run", "mr"].includes(chartType),
      numerator_non_negative: ["p", "pp", "u", "up", "s", "c", "g", "t"].includes(chartType),
      numerator_leq_denominator: ["p", "pp", "u", "up"].includes(chartType),
      has_control_limits: !(["run"].includes(chartType)),
      needs_sd: ["xbar"].includes(chartType),
      integer_num_den: ["c", "p", "pp"].includes(chartType),
      value_name: valueNames[chartType]
    }

    this.multiplier = multiplier
    this.percentLabels = percentLabels
  }
}
