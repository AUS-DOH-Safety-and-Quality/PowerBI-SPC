import type { settingsValueType } from "../settings"
import { createValueFormatter, resolvePercentScaling, type ValueFormatter } from "powerbi-visuals-core/data";

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
  formatValue: ValueFormatter
  chart_type_props: {
    name: string,
    needs_denominator: boolean,
    denominator_optional: boolean,
    numerator_non_negative: boolean,
    numerator_leq_denominator: boolean,
    has_control_limits: boolean,
    needs_sd: boolean,
    integer_num_den: boolean,
    value_name: string,
    x_axis_use_date: boolean,
    date_name: string,
    denominator_gt_one: boolean
  }

  constructor(inputSettingsSpc: settingsValueType["spc"]) {
    const chartType: string = inputSettingsSpc.chart_type;
    const scaling = resolvePercentScaling(["p", "pp"].includes(chartType),
                                          inputSettingsSpc.perc_labels, inputSettingsSpc.multiplier);

    this.chart_type_props = {
      name: chartType,
      needs_denominator: ["p", "pp", "u", "up", "xbar", "s"].includes(chartType),
      denominator_optional: ["i", "i_m", "i_mm", "run", "mr"].includes(chartType),
      numerator_non_negative: ["p", "pp", "u", "up", "s", "c", "g", "t"].includes(chartType),
      numerator_leq_denominator: ["p", "pp"].includes(chartType),
      has_control_limits: !(["run"].includes(chartType)),
      needs_sd: ["xbar"].includes(chartType),
      integer_num_den: ["c", "p", "pp"].includes(chartType),
      value_name: valueNames[chartType],
      x_axis_use_date: !(["g", "t"].includes(chartType)),
      date_name: !(["g", "t"].includes(chartType)) ? "Date" : "Event",
      denominator_gt_one: ["xbar", "s"].includes(chartType)
    }

    this.multiplier = scaling.multiplier
    this.percentLabels = scaling.percentLabels
    const decimalPlaces = inputSettingsSpc.sig_figs;
    this.formatValue = createValueFormatter(decimalPlaces, this.chart_type_props.integer_num_den ? 0 : decimalPlaces,
                                            scaling.percentLabels ? "%" : "");
  }
}
