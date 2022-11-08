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
  astpoint: boolean,
  trend: boolean,
  shift: boolean,
  two_in_three: boolean
}

let valueNames = {
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

function buildTooltip(args: tooltipArgs): VisualTooltipDataItem[] {
  let tooltip: VisualTooltipDataItem[] = new Array<VisualTooltipDataItem>();
  tooltip.push({
    displayName: "Date",
    value: args.date
  });
  tooltip.push({
    displayName: valueNames[args.chart_type],
    value: args.prop_labels
      ? (args.value * 100).toFixed(2) + "%"
      : args.value.toFixed(4)
  })
  if(args.numerator || !(args.numerator === null || args.numerator === undefined)) {
    tooltip.push({
      displayName: "Numerator",
      value: (args.numerator).toFixed(2)
    })
  }
  if(args.denominator || !(args.denominator === null || args.denominator === undefined)) {
    tooltip.push({
      displayName: "Denominator",
      value: (args.denominator).toFixed(2)
    })
  }
  tooltip.push({
    displayName: "Upper 99% Limit",
    value: args.prop_labels
      ? (args.limits.ul99 * 100).toFixed(2) + "%"
      : args.limits.ul99.toFixed(4)
  })
  tooltip.push({
    displayName: "Centerline",
    value: args.prop_labels
      ? (args.target * 100).toFixed(2) + "%"
      : args.target.toFixed(4)
  })
  tooltip.push({
    displayName: "Lower 99% Limit",
    value: args.prop_labels
      ? (args.limits.ll99 * 100).toFixed(2) + "%"
      : args.limits.ll99.toFixed(4)
  })

  if (args.astpoint || args.trend || args.shift || args.two_in_three) {
    let patterns: string[] = new Array<string>();
    if (args.astpoint) {
      patterns.push("Astronomical Point")
    }
    if (args.trend) {
      patterns.push("Trend")
    }
    if (args.shift) {
      patterns.push("Shift")
    }
    if (args.two_in_three) {
      patterns.push("Two-in-Three")
    }
    tooltip.push({
      displayName: "Patterns",
      value: patterns.join("\n")
    })
  }

  return tooltip;
}

export default buildTooltip;
