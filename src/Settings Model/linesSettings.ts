import { createLineGroup, numberOption, toggleOption } from "powerbi-visuals-core/settings";

const linesSettings = {
  description: "Line Settings",
  displayName: "Line Settings",
  settingsGroups: {
    "Main": createLineGroup("main", {
      showLabel: "Show Main Line", showDefault: true, namePrefix: "Main ",
      width: 1, type: "10 0", colour: "common_cause", rebaselines: true
    }),
    "Target": createLineGroup("target", {
      showLabel: "Show Target", showDefault: true,
      width: 1.5, type: "10 0", colour: "standard", rebaselines: true, tooltipLabel: "Centerline"
    }),
    "Alt. Target": createLineGroup("alt_target", {
      showLabel: "Show Alt. Target Line", showDefault: false,
      width: 1.5, type: "10 0", colour: "standard", rebaselines: true, tooltipLabel: "Alt. Target"
    }, {
      alt_target: numberOption("Additional Target Value:", undefined),
      multiplier_alt_target: toggleOption("Apply Multiplier to Alt. Target", false)
    }),
    "68% Limits": createLineGroup("68", {
      showLabel: "Show 68% Lines", showDefault: false,
      width: 2, type: "2 5", colour: "limits", rebaselines: true, tooltipLabel: "68% Limit", tooltipPrefixes: true
    }),
    "95% Limits": createLineGroup("95", {
      showLabel: "Show 95% Lines", showDefault: true,
      width: 2, type: "2 5", colour: "limits", rebaselines: true, tooltipLabel: "95% Limit", tooltipPrefixes: true
    }),
    "99% Limits": createLineGroup("99", {
      showLabel: "Show 99% Lines", showDefault: true,
      width: 2, type: "10 10", colour: "limits", rebaselines: true, tooltipLabel: "99% Limit", tooltipPrefixes: true
    }),
    "Specification Limits": createLineGroup("specification", {
      showLabel: "Show Specification Lines", showDefault: false,
      width: 2, type: "10 10", colour: "limits", rebaselines: true, tooltipLabel: "specification Limit", tooltipPrefixes: true
    }, {
      specification_upper: numberOption("Upper Specification Limit:", undefined),
      specification_lower: numberOption("Lower Specification Limit:", undefined),
      multiplier_specification: toggleOption("Apply Multiplier to Specification Limits", false)
    }),
    "Trend": createLineGroup("trend", {
      showLabel: "Show Trend", showDefault: false,
      width: 1.5, type: "10 0", colour: "common_cause", rebaselines: true, tooltipLabel: "Centerline"
    })
  }
};

export default linesSettings;
