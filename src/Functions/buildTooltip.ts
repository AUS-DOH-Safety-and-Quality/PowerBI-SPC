import powerbi from "powerbi-visuals-api";
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;
import controlLimits from "../Classes/controlLimits";
import dataObject from "../Classes/dataObject";
import settingsObject from "../Classes/settingsObject";

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

function buildTooltip(index: number, calculatedLimits: controlLimits,
                      inputData: dataObject, inputSettings: settingsObject): VisualTooltipDataItem[] {

  const date: string = calculatedLimits.keys[index].label;
  const value: number = calculatedLimits.values[index];
  const numerator: number = calculatedLimits.numerators ? calculatedLimits.numerators[index] : null;
  const denominator: number = calculatedLimits.denominators ? calculatedLimits.denominators[index] : null;
  const target: number = calculatedLimits.targets[index];
  const limits = {
      ll99: calculatedLimits.ll99 ? calculatedLimits.ll99[index] : null,
      ul99: calculatedLimits.ll99 ? calculatedLimits.ul99[index] : null
    };
  const chart_type: string = inputSettings.spc.chart_type.value;
  const prop_labels: boolean = inputData.percentLabels;
  const astpoint: string = calculatedLimits.astpoint[index];
  const trend: string = calculatedLimits.trend[index];
  const shift: string = calculatedLimits.shift[index];
  const two_in_three: string = calculatedLimits.two_in_three[index];
  let multiplier: number = inputSettings.spc.multiplier.value;
  if (prop_labels && (multiplier === 1)) {
    multiplier = 100;
  }
  const suffix: string = prop_labels ? "%" : "";
  let intNumDen: boolean = integerParams.includes(chart_type);

  const sig_figs: number = inputSettings.spc.sig_figs.value;
  const tooltip: VisualTooltipDataItem[] = new Array<VisualTooltipDataItem>();
  tooltip.push({
    displayName: "Date",
    value: date
  });
  tooltip.push({
    displayName: valueNames[chart_type],
    value: (value * multiplier).toFixed(sig_figs) + suffix
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
      value: (limits.ul99 * multiplier).toFixed(sig_figs) + suffix
    })
  }
  tooltip.push({
    displayName: "Centerline",
    value: (target * multiplier).toFixed(sig_figs) + suffix
  })
  if (chart_type !== "run") {
    tooltip.push({
      displayName: "Lower 99% Limit",
      value: (limits.ll99 * multiplier).toFixed(sig_figs) + suffix
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

  return tooltip;
}

export default buildTooltip;
