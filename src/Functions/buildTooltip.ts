import powerbi from "powerbi-visuals-api";
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import controlLimits from "../Classes/controlLimits";
import dataObject from "../Classes/dataObject";
import settingsObject from "../Classes/settingsObject";

let valueNames: Record<string, string> = {
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

function buildTooltip(index: number, calculatedLimits: controlLimits,
                      inputData: dataObject, inputSettings: settingsObject): VisualTooltipDataItem[] {

  let date: string = calculatedLimits.keys[index].label;
  let value: number = calculatedLimits.values[index];
  let numerator: number = calculatedLimits.numerators ? calculatedLimits.numerators[index] : null;
  let denominator: number = calculatedLimits.denominators ? calculatedLimits.denominators[index] : null;
  let target: number = calculatedLimits.targets[index];
  let limits = {
      ll99: calculatedLimits.ll99 ? calculatedLimits.ll99[index] : null,
      ul99: calculatedLimits.ll99 ? calculatedLimits.ul99[index] : null
    };
  let chart_type: string = inputSettings.spc.chart_type.value;
  let prop_labels: boolean = inputData.percentLabels;
  let astpoint: string = calculatedLimits.astpoint[index];
  let trend: string = calculatedLimits.trend[index];
  let shift: string = calculatedLimits.shift[index];
  let two_in_three: string = calculatedLimits.two_in_three[index];

  let sig_figs: number = inputSettings.spc.sig_figs.value;
  let tooltip: VisualTooltipDataItem[] = new Array<VisualTooltipDataItem>();
  tooltip.push({
    displayName: "Date",
    value: date
  });
  tooltip.push({
    displayName: valueNames[chart_type],
    value: prop_labels
      ? (value * 100).toFixed(sig_figs) + "%"
      : value.toFixed(sig_figs)
  })
  if(numerator || !(numerator === null || numerator === undefined)) {
    tooltip.push({
      displayName: "Numerator",
      value: (numerator).toFixed(sig_figs)
    })
  }
  if(denominator || !(denominator === null || denominator === undefined)) {
    tooltip.push({
      displayName: "Denominator",
      value: (denominator).toFixed(sig_figs)
    })
  }
  if (chart_type !== "run") {
    tooltip.push({
      displayName: "Upper 99% Limit",
      value: prop_labels
        ? (limits.ul99 * 100).toFixed(sig_figs) + "%"
        : limits.ul99.toFixed(sig_figs)
    })
  }
  tooltip.push({
    displayName: "Centerline",
    value: prop_labels
      ? (target * 100).toFixed(sig_figs) + "%"
      : target.toFixed(sig_figs)
  })
  if (chart_type !== "run") {
    tooltip.push({
      displayName: "Lower 99% Limit",
      value: prop_labels
        ? (limits.ll99 * 100).toFixed(sig_figs) + "%"
        : limits.ll99.toFixed(sig_figs)
    })
  }

  if (astpoint !== "none" || trend !== "none" ||
      shift !== "none" || two_in_three !== "none") {
    let patterns: string[] = new Array<string>();
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

  return tooltip;
}

export default buildTooltip;
