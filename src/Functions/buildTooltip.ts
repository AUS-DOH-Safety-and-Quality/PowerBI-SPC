import type powerbi from "powerbi-visuals-api";
type VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import type { controlLimitsClass, dataClass, defaultSettingsType } from "../Classes";

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

export default function buildTooltip(index: number, controlLimits: controlLimitsClass,
                                      inputData: dataClass, inputSettings: defaultSettingsType): VisualTooltipDataItem[] {

  const date: string = controlLimits.keys[index].label;
  const value: number = controlLimits.values[index];
  const numerator: number = controlLimits.numerators ? controlLimits.numerators[index] : null;
  const denominator: number = controlLimits.denominators ? controlLimits.denominators[index] : null;
  const target: number = controlLimits.targets[index];
  const limits = {
      ll99: controlLimits.ll99 ? controlLimits.ll99[index] : null,
      ul99: controlLimits.ll99 ? controlLimits.ul99[index] : null
    };
  const chart_type: string = inputSettings.spc.chart_type;
  const prop_labels: boolean = inputData.percentLabels;
  const astpoint: string = controlLimits.astpoint[index];
  const trend: string = controlLimits.trend[index];
  const shift: string = controlLimits.shift[index];
  const two_in_three: string = controlLimits.two_in_three[index];
  const suffix: string = prop_labels ? "%" : "";
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
