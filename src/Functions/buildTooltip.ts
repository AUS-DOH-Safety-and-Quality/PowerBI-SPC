import { isNullOrUndefined } from "powerbi-visuals-core/data";
import { valueTooltips, limitTooltips, appendPatternTooltips } from "powerbi-visuals-core/powerbi";
import type powerbi from "powerbi-visuals-api";
type VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import type { settingsValueType } from "../settings";
import type derivedSettingsClass from "../Classes/derivedSettingsClass";
import type { summaryTableRowData } from "../Classes/viewModelClass";

export default function buildTooltip(table_row: summaryTableRowData,
                                      inputTooltips: powerbi.extensibility.VisualTooltipDataItem[] | undefined,
                                      inputSettings: settingsValueType,
                                      derivedSettings: derivedSettingsClass): VisualTooltipDataItem[] {

  const ast_limit: string = inputSettings.outliers.astronomical_limit;
  const two_in_three_limit: string = inputSettings.outliers.two_in_three_limit;
  const formatValues = derivedSettings.formatValue;

  const tooltip: VisualTooltipDataItem[] = new Array<VisualTooltipDataItem>();
  if (inputSettings.spc.ttip_show_date) {
    const ttip_label_date: string = inputSettings.spc.ttip_label_date;
    tooltip.push({
      displayName: ttip_label_date === "Automatic" ? derivedSettings.chart_type_props.date_name : ttip_label_date,
      value: table_row.date
    });
  }
  tooltip.push(...valueTooltips(inputSettings.spc, table_row, derivedSettings.chart_type_props.value_name, formatValues));
  if (inputSettings.lines.ttip_show_trend && inputSettings.lines.show_trend) {
    tooltip.push({
      displayName: inputSettings.lines.ttip_label_trend,
      value: formatValues(table_row.trend_line, "value")
    })
  }
  if (inputSettings.lines.show_specification && inputSettings.lines.ttip_show_specification) {
    if (!isNullOrUndefined(table_row.speclimits_upper)) {
      tooltip.push({
        displayName: `${inputSettings.lines.ttip_label_specification_prefix_upper}${inputSettings.lines.ttip_label_specification}`,
        value: formatValues(table_row.speclimits_upper, "value")
      })
    }
    if (!isNullOrUndefined(table_row.speclimits_lower)) {
      tooltip.push({
        displayName: `${inputSettings.lines.ttip_label_specification_prefix_lower}${inputSettings.lines.ttip_label_specification}`,
        value: formatValues(table_row.speclimits_lower, "value")
      })
    }
  }
  tooltip.push(...limitTooltips(inputSettings.lines, table_row, formatValues, derivedSettings.chart_type_props.has_control_limits));

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
  appendPatternTooltips(tooltip, patterns, inputTooltips);
  return tooltip;
}
