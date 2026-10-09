import {
  numberOption, toggleOption, textOption, dropdownOption, scalingOptions, valueTooltipOptions, limitTruncationOptions
} from "powerbi-visuals-core/settings";

const spcSettings = {
  description: "SPC Settings",
  displayName: "Data Settings",
  settingsGroups: {
    "all": {
      chart_type: dropdownOption(
        "Chart Type", "i",
        ["run", "i", "i_m", "i_mm", "mr", "p", "pp", "u", "up", "c", "xbar", "s", "g", "t"], "none",
        [
          "run - Run Chart",
          "i - Individual Measurements",
          "i_m - Individual Measurements: Median centerline",
          "i_mm - Individual Measurements: Median centerline, Median MR Limits",
          "mr - Moving Range of Individual Measurements",
          "p - Proportions",
          "p prime - Proportions: Large-Sample Corrected",
          "u - Rates",
          "u prime - Rates: Large-Sample Correction",
          "c - Counts",
          "xbar - Sample Means",
          "s - Sample SDs",
          "g - Number of Non-Events Between Events",
          "t - Time Between Events"
        ]
      ),
      outliers_in_limits: toggleOption("Keep Outliers in Limit Calcs.", false),
      ...scalingOptions(),
      split_on_click: toggleOption("Split Limits on Click", false),
      num_points_subset: numberOption("Subset Number of Points for Limit Calculations", undefined, { integer: true }),
      subset_points_from: dropdownOption("Subset Points From", "Start", ["Start", "End"]),
      subset_rebaselines: toggleOption("Subset Points After Each Re-Baseline", false),
      ttip_show_date: toggleOption("Show Date in Tooltip", true),
      ttip_label_date: textOption("Date Tooltip Label", "Automatic"),
      ...valueTooltipOptions(),
      ...limitTruncationOptions()
    }
  }
};

export default spcSettings;
