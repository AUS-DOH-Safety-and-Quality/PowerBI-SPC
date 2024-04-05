import type powerbi from "powerbi-visuals-api";
type VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import type { controlLimitsObject, defaultSettingsType, derivedSettingsClass, outliersObject } from "../Classes";
import type { dataObject } from "./extractInputData";

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
/* eslint-disable max-lines-per-function */
export default function buildTooltip(index: number,
                                      controlLimits: controlLimitsObject,
                                      outliers: outliersObject,
                                      inputData: dataObject,
                                      inputSettings: defaultSettingsType,
                                      derivedSettings: derivedSettingsClass): VisualTooltipDataItem[] {
  const numerator: number = controlLimits.numerators?.[index];
  const denominator: number = controlLimits.denominators?.[index];
  const target: number = controlLimits.targets[index];
  const alt_target: number = controlLimits?.alt_targets?.[index];
  const speclimits_lower: number = controlLimits?.speclimits_lower?.[index];
  const speclimits_upper: number = controlLimits?.speclimits_upper?.[index];
  const limits = {
    ll99: controlLimits?.ll99?.[index],
    ll95: controlLimits?.ll95?.[index],
    ll68: controlLimits?.ll68?.[index],
    ul68: controlLimits?.ul68?.[index],
    ul95: controlLimits?.ul95?.[index],
    ul99: controlLimits?.ul99?.[index]
  };
  const astpoint: string = outliers.astpoint[index];
  const trend: string = outliers.trend[index];
  const shift: string = outliers.shift[index];
  const two_in_three: string = outliers.two_in_three[index];
  const ast_limit: string = inputSettings.outliers.astronomical_limit;
  const two_in_three_limit: string = inputSettings.outliers.two_in_three_limit;
  const suffix: string = derivedSettings.percentLabels ? "%" : "";

  const sig_figs: number = inputSettings.spc.sig_figs;
  const tooltip: VisualTooltipDataItem[] = new Array<VisualTooltipDataItem>();
  tooltip.push({
    displayName: "Date",
    value: controlLimits.keys[index].label
  });
  if (inputSettings.spc.ttip_show_value) {
    const ttip_label_value: string = inputSettings.spc.ttip_label_value;
    tooltip.push({
      displayName: ttip_label_value === "Automatic" ? derivedSettings.chart_type_props.value_name : ttip_label_value,
      value: (controlLimits.values[index]).toFixed(sig_figs) + suffix
    })
  }
  if(inputSettings.spc.ttip_show_numerator && !(numerator === null || numerator === undefined)) {
    tooltip.push({
      displayName: inputSettings.spc.ttip_label_numerator,
      value: (numerator).toFixed(derivedSettings.chart_type_props.integer_num_den ? 0 : sig_figs)
    })
  }
  if(inputSettings.spc.ttip_show_denominator && !(denominator === null || denominator === undefined)) {
    tooltip.push({
      displayName: inputSettings.spc.ttip_label_denominator,
      value: (denominator).toFixed(derivedSettings.chart_type_props.integer_num_den ? 0 : sig_figs)
    })
  }
  if (inputSettings.lines.show_specification && inputSettings.lines.ttip_show_specification) {
    if (speclimits_upper !== null && speclimits_upper !== undefined) {
      tooltip.push({
        displayName: `Upper ${inputSettings.lines.ttip_label_specification}`,
        value: (speclimits_upper).toFixed(sig_figs) + suffix
      })
    }
    if (speclimits_lower !== null && speclimits_lower !== undefined) {
      tooltip.push({
        displayName: `Lower ${inputSettings.lines.ttip_label_specification}`,
        value: (speclimits_lower).toFixed(sig_figs) + suffix
      })
    }
  }
  if (derivedSettings.chart_type_props.has_control_limits) {
    ["68", "95", "99"].forEach(limit => {
      if (inputSettings.lines[`ttip_show_${limit}`] && inputSettings.lines[`show_${limit}`]) {
        tooltip.push({
          displayName: `Upper ${inputSettings.lines[`ttip_label_${limit}`]}`,
          value: (limits[`ul${limit}`]).toFixed(sig_figs) + suffix
        })
      }
    })
  }
  if (inputSettings.lines.show_target && inputSettings.lines.ttip_show_target) {
    tooltip.push({
      displayName: inputSettings.lines.ttip_label_target,
      value: (target).toFixed(sig_figs) + suffix
    })
  }
  if (inputSettings.lines.show_alt_target && inputSettings.lines.ttip_show_alt_target && !(alt_target === null || alt_target === undefined)) {
    tooltip.push({
      displayName: inputSettings.lines.ttip_label_alt_target,
      value: (alt_target).toFixed(sig_figs) + suffix
    })
  }
  if (derivedSettings.chart_type_props.has_control_limits) {
    ["68", "95", "99"].forEach(limit => {
      if (inputSettings.lines[`ttip_show_${limit}`] && inputSettings.lines[`show_${limit}`]) {
        tooltip.push({
          displayName: `Lower ${inputSettings.lines[`ttip_label_${limit}`]}`,
          value: (limits[`ll${limit}`]).toFixed(sig_figs) + suffix
        })
      }
    })
  }

  if (astpoint !== "none" || trend !== "none" || shift !== "none" || two_in_three !== "none") {
    const patterns: string[] = new Array<string>();
    if (astpoint !== "none") {
      // Note if flagged according to non-default limit
      let flag_text: string = "Astronomical Point";
      if (ast_limit !== "3 Sigma") {
        flag_text = `${flag_text} (${ast_limit})`;
      }
      patterns.push(flag_text)
    }
    if (trend !== "none") { patterns.push("Trend") }
    if (shift !== "none") { patterns.push("Shift") }
    if (two_in_three !== "none") {
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

  if (inputData.tooltips.length > 0) {
    inputData.tooltips[index].forEach(customTooltip => tooltip.push(customTooltip))
  }

  return tooltip;
}
/* eslint-enable max-lines-per-function */
