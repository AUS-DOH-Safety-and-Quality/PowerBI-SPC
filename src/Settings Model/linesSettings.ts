import { createLineGroup, numberOption, toggleOption } from "powerbi-visuals-core/settings";

const linesSettings = {
  description: "Line Settings",
  displayName: "Line Settings",
  settingsGroups: {
    "Main": createLineGroup("main", {
      showLabel: "Show Main Line",
      showDescription: "Draws the line joining the points.",
      showDefault: true,
      namePrefix: "Main ",
      width: 1,
      type: "10 0",
      colour: "common_cause",
      rebaselines: true
    }),
    "Target": createLineGroup("target", {
      showLabel: "Show Target",
      showDescription: "Draws the centreline.",
      showDefault: true,
      width: 1.5,
      type: "10 0",
      colour: "standard",
      rebaselines: true,
      tooltipLabel: "Centerline"
    }),
    "Alt. Target": createLineGroup("alt_target", {
      showLabel: "Show Alt. Target Line",
      showDescription: "Draws a line at the Additional Target Value; the assurance icon needs it.",
      showDefault: false,
      width: 1.5,
      type: "10 0",
      colour: "standard",
      rebaselines: true,
      tooltipLabel: "Alt. Target"
    }, {
      alt_target: numberOption("Additional Target Value:", "Value of the target line, as a plotted value unless the multiplier is applied.", undefined),
      multiplier_alt_target: toggleOption("Apply Multiplier to Alt. Target",
                                          "Multiplies the target by the Multiplier, for targets entered as raw proportions or rates.", false)
    }),
    "68% Limits": createLineGroup("68", {
      showLabel: "Show 68% Lines",
      showDescription: "Draws the one-sigma lines.",
      showDefault: false,
      width: 2,
      type: "2 5",
      colour: "limits",
      rebaselines: true,
      tooltipLabel: "68% Limit",
      tooltipPrefixes: true
    }),
    "95% Limits": createLineGroup("95", {
      showLabel: "Show 95% Lines",
      showDescription: "Draws the two-sigma lines.",
      showDefault: true,
      width: 2,
      type: "2 5",
      colour: "limits",
      rebaselines: true,
      tooltipLabel: "95% Limit",
      tooltipPrefixes: true
    }),
    "99% Limits": createLineGroup("99", {
      showLabel: "Show 99% Lines",
      showDescription: "Draws the three-sigma control limits.",
      showDefault: true,
      width: 2,
      type: "10 10",
      colour: "limits",
      rebaselines: true,
      tooltipLabel: "99% Limit",
      tooltipPrefixes: true
    }),
    "Specification Limits": createLineGroup("specification", {
      showLabel: "Show Specification Lines",
      showDescription: "Draws the specification limits, which patterns using the Specification limit need.",
      showDefault: false,
      width: 2,
      type: "10 10",
      colour: "limits",
      rebaselines: true,
      tooltipLabel: "Specification Limit",
      tooltipPrefixes: true
    }, {
      specification_upper: numberOption("Upper Specification Limit:",
                                        "Upper specification limit, as a plotted value unless the multiplier is applied.", undefined),
      specification_lower: numberOption("Lower Specification Limit:",
                                        "Lower specification limit, as a plotted value unless the multiplier is applied.", undefined),
      multiplier_specification: toggleOption("Apply Multiplier to Specification Limits",
                                             "Multiplies the limits by the Multiplier, for limits entered as raw proportions or rates.", false)
    }),
    "Trend": createLineGroup("trend", {
      showLabel: "Show Trend",
      showDescription: "Draws a least-squares trend line through each rebaseline period.",
      showDefault: false,
      width: 1.5,
      type: "10 0",
      colour: "common_cause",
      rebaselines: true,
      tooltipLabel: "Trend"
    })
  }
};

export default linesSettings;
