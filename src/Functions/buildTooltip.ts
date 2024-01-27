import type powerbi from "powerbi-visuals-api";
type VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import type { controlLimitsObject, defaultSettingsType, derivedSettingsClass, outliersObject } from "../Classes";
import type { dataObject } from "./extractInputData";

const valueNames: Record<string, string> = {
  "i": "Observation",
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

const integerParams: string[] = ["c", "p", "pp"];

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
export default function buildTooltip(index: number,
                                      controlLimits: controlLimitsObject,
                                      outliers: outliersObject,
                                      inputData: dataObject,
                                      inputSettings: defaultSettingsType,
                                      derivedSettings: derivedSettingsClass): VisualTooltipDataItem[] {
  const chart_type: string = inputSettings.spc.chart_type;
  const date: string = controlLimits.labels[index];
  const value: number = controlLimits.values[index];
  const numerator: number = controlLimits.numerators?.[index];
  const denominator: number = controlLimits.denominators?.[index];
  const target: number = controlLimits.targets[index];
  const limits = {
    ll99: controlLimits?.ll99?.[index],
    ul99: controlLimits?.ul99?.[index]
  };
  const astpoint: string = outliers.astpoint[index];
  const trend: string = outliers.trend[index];
  const shift: string = outliers.shift[index];
  const two_in_three: string = outliers.two_in_three[index];
  const suffix: string = derivedSettings.percentLabels ? "%" : "";
  const intNumDen: boolean = integerParams.includes(chart_type);

  const sig_figs: number = inputSettings.spc.sig_figs;
  const tooltip: VisualTooltipDataItem[] = new Array<VisualTooltipDataItem>();
  tooltip.push({
    displayName: "Date",
    value: date
  });
  tooltip.push({
    displayName: valueNames[chart_type],
    value: (value).toFixed(sig_figs) + suffix
  })
  if(numerator || !(numerator === null || numerator === undefined)) {
    tooltip.push({
      displayName: "Numerator",
      value: (numerator).toFixed(intNumDen ? 0 : sig_figs)
    })
  }
  if(denominator || !(denominator === null || denominator === undefined)) {
    tooltip.push({
      displayName: "Denominator",
      value: (denominator).toFixed(intNumDen ? 0 : sig_figs)
    })
  }
  if (chart_type !== "run") {
    tooltip.push({
      displayName: "Upper 99% Limit",
      value: (limits.ul99).toFixed(sig_figs) + suffix
    })
  }
  tooltip.push({
    displayName: "Centerline",
    value: (target).toFixed(sig_figs) + suffix
  })
  if (chart_type !== "run") {
    tooltip.push({
      displayName: "Lower 99% Limit",
      value: (limits.ll99).toFixed(sig_figs) + suffix
    })
  }

  if (astpoint !== "none" || trend !== "none" ||
      shift !== "none" || two_in_three !== "none") {
    const patterns: string[] = new Array<string>();
    if (astpoint !== "none") {
      patterns.push("Astronomical Point")
    }
    if (trend !== "none") {
      patterns.push("Trend")
    }
    if (shift !== "none") {
      patterns.push("Shift")
    }
    if (two_in_three !== "none") {
      patterns.push("Two-in-Three")
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
