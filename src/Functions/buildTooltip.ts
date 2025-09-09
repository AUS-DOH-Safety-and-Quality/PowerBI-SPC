import type powerbi from "powerbi-visuals-api";
type VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import type { defaultSettingsType, derivedSettingsClass } from "../Classes";
import isNullOrUndefined from "./isNullOrUndefined";
import valueFormatter from "./valueFormatter";
import { summaryTableRowData } from "../Classes/viewModelClass";

/**
 * Builds the tooltip data for a specific index in the chart.
 *
 * @param index - The index of the data point.
 * @param controlLimits - The control limits object.
 * @param outliers - The outliers object.
 * @param inputData - The input data object.
 * @param inputSettings - The input settings object.
 * @param derivedSettings - The derived settings object.
 * @returns An array of VisualTooltipDataItem objects representing the tooltip data.
 */
// ESLint errors due to number of lines in function, but would reduce readability to separate further

export default function buildTooltip(table_row: summaryTableRowData,
                                      inputTooltips: powerbi.extensibility.VisualTooltipDataItem[],
                                      inputSettings: defaultSettingsType,
                                      derivedSettings: derivedSettingsClass): VisualTooltipDataItem[] {

  const ast_limit: string = inputSettings.outliers.astronomical_limit;
  const two_in_three_limit: string = inputSettings.outliers.two_in_three_limit;
  const formatValues = valueFormatter(inputSettings, derivedSettings);

  const tooltip: VisualTooltipDataItem[] = new Array<VisualTooltipDataItem>();
  if (inputSettings.spc.ttip_show_date) {
    tooltip.push({
      displayName: inputSettings.spc.ttip_label_date,
      value: table_row.date
    });
  }
  if (inputSettings.spc.ttip_show_value) {
    const ttip_label_value: string = inputSettings.spc.ttip_label_value;
    tooltip.push({
      displayName: ttip_label_value === "Automatic" ? derivedSettings.chart_type_props.value_name : ttip_label_value,
      value: formatValues(table_row.value, "value")
    })
  }
  if(inputSettings.spc.ttip_show_numerator && !isNullOrUndefined(table_row.numerator)) {
    tooltip.push({
      displayName: inputSettings.spc.ttip_label_numerator,
      value: formatValues(table_row.numerator, "integer")
    })
  }
  if(inputSettings.spc.ttip_show_denominator && !isNullOrUndefined(table_row.denominator)) {
    tooltip.push({
      displayName: inputSettings.spc.ttip_label_denominator,
      value: formatValues(table_row.denominator, "integer")
    })
  }
  if (inputSettings.lines.show_specification && inputSettings.lines.ttip_show_specification) {
    if (!isNullOrUndefined(table_row.speclimits_upper)) {
      tooltip.push({
        displayName: `Upper ${inputSettings.lines.ttip_label_specification}`,
        value: formatValues(table_row.speclimits_upper, "value")
      })
    }
    if (!isNullOrUndefined(table_row.speclimits_lower)) {
      tooltip.push({
        displayName: `Lower ${inputSettings.lines.ttip_label_specification}`,
        value: formatValues(table_row.speclimits_lower, "value")
      })
    }
  }
  if (derivedSettings.chart_type_props.has_control_limits) {
    ["68", "95", "99"].forEach(limit => {
      if (inputSettings.lines[`ttip_show_${limit}`] && inputSettings.lines[`show_${limit}`]) {
        tooltip.push({
          displayName: `${inputSettings.lines[`ttip_label_${limit}_prefix_upper`]}${inputSettings.lines[`ttip_label_${limit}`]}`,
          value: formatValues(table_row[`ul${limit}`], "value")
        })
      }
    })
  }
  if (inputSettings.lines.show_target && inputSettings.lines.ttip_show_target) {
    tooltip.push({
      displayName: inputSettings.lines.ttip_label_target,
      value: formatValues(table_row.target, "value")
    })
  }
  if (inputSettings.lines.show_alt_target && inputSettings.lines.ttip_show_alt_target && !isNullOrUndefined(table_row.alt_target)) {
    tooltip.push({
      displayName: inputSettings.lines.ttip_label_alt_target,
      value: formatValues(table_row.alt_target, "value")
    })
  }
  if (derivedSettings.chart_type_props.has_control_limits) {
    ["68", "95", "99"].forEach(limit => {
      if (inputSettings.lines[`ttip_show_${limit}`] && inputSettings.lines[`show_${limit}`]) {
        tooltip.push({
          displayName: `${inputSettings.lines[`ttip_label_${limit}_prefix_lower`]}${inputSettings.lines[`ttip_label_${limit}`]}`,
          value: formatValues(table_row[`ll${limit}`], "value")
        })
      }
    })
  }

  if ([table_row.astpoint, table_row.trend, table_row.shift, table_row.two_in_three].some(d => d !== "none")){
    const patterns: string[] = new Array<string>();
    if (table_row.astpoint !== "none") {
      // Note if flagged according to non-default limit
      let flag_text: string = "Astronomical Point";
      if (ast_limit !== "3 Sigma") {
        flag_text = `${flag_text} (${ast_limit})`;
      }
      patterns.push(flag_text)
    }
    if (table_row.trend !== "none") { patterns.push("Trend") }
    if (table_row.shift !== "none") { patterns.push("Shift") }
    if (table_row.two_in_three !== "none") {
      // Note if flagged according to non-default limit
      let flag_text: string = "Two-in-Three";
      if (two_in_three_limit !== "2 Sigma") {
        flag_text = `${flag_text} (${two_in_three_limit})`;
      }
      patterns.push(flag_text)
    }
    tooltip.push({
      displayName: "Pattern(s)",
      value: patterns.join("\n")
    })
  }

  if (!isNullOrUndefined(inputTooltips) && inputTooltips.length > 0) {
    inputTooltips.forEach(customTooltip => tooltip.push(customTooltip))
  }

  return tooltip;
}
