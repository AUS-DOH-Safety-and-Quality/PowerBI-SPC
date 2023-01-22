import powerbi from "powerbi-visuals-api";
import VisualTooltipDataItem = powerbi.extensibility.VisualTooltipDataItem;


type tooltipArgs = {
  date: string,
  value: number,
  numerator?: number,
  denominator?: number,
  target: number,
  limits: { ll99: number, ul99: number},
  chart_type: string,
  multiplier: number,
  prop_labels: boolean,
  astpoint: string,
  trend: string,
  shift: string,
  two_in_three: string
}

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

function buildTooltip(args: tooltipArgs, sig_figs: number): VisualTooltipDataItem[] {
  let tooltip: VisualTooltipDataItem[] = new Array<VisualTooltipDataItem>();
  tooltip.push({
    displayName: "Date",
    value: args.date
  });
  tooltip.push({
    displayName: valueNames[args.chart_type],
    value: args.prop_labels
      ? (args.value * 100).toFixed(sig_figs) + "%"
      : args.value.toFixed(sig_figs)
  })
  if(args.numerator || !(args.numerator === null || args.numerator === undefined)) {
    tooltip.push({
      displayName: "Numerator",
      value: (args.numerator).toFixed(sig_figs)
    })
  }
  if(args.denominator || !(args.denominator === null || args.denominator === undefined)) {
    tooltip.push({
      displayName: "Denominator",
      value: (args.denominator).toFixed(sig_figs)
    })
  }
  if (args.chart_type !== "run") {
    tooltip.push({
      displayName: "Upper 99% Limit",
      value: args.prop_labels
        ? (args.limits.ul99 * 100).toFixed(sig_figs) + "%"
        : args.limits.ul99.toFixed(sig_figs)
    })
  }
  tooltip.push({
    displayName: "Centerline",
    value: args.prop_labels
      ? (args.target * 100).toFixed(sig_figs) + "%"
      : args.target.toFixed(sig_figs)
  })
  if (args.chart_type !== "run") {
    tooltip.push({
      displayName: "Lower 99% Limit",
      value: args.prop_labels
        ? (args.limits.ll99 * 100).toFixed(sig_figs) + "%"
        : args.limits.ll99.toFixed(sig_figs)
    })
  }

  if (args.astpoint !== "none" || args.trend !== "none" ||
      args.shift !== "none" || args.two_in_three !== "none") {
    let patterns: string[] = new Array<string>();
    if (args.astpoint !== "none") {
      patterns.push("Astronomical Point")
    }
    if (args.trend !== "none") {
      patterns.push("Trend")
    }
    if (args.shift !== "none") {
      patterns.push("Shift")
    }
    if (args.two_in_three !== "none") {
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
