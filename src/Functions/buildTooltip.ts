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
  prop_labels: boolean
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
  if(args.denominator) {
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

  return tooltip;
}

export default buildTooltip;
