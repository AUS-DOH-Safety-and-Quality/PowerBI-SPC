import {
  numberOption, numberOptionMin,
  numberOptionMinMax, toggleOption, textOption,
  dropdownOption
} from "./common";

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
      multiplier: numberOptionMin("Multiplier", 1, 0),
      sig_figs: numberOptionMinMax("Decimals to Report:", 2, 0, 20),
      perc_labels: dropdownOption("Report as percentage", "Automatic", ["Automatic", "Yes", "No"]),
      split_on_click: toggleOption("Split Limits on Click", false),
      num_points_subset: numberOption("Subset Number of Points for Limit Calculations", undefined),
      subset_points_from: dropdownOption("Subset Points From", "Start", ["Start", "End"]),
      ttip_show_date: toggleOption("Show Date in Tooltip", true),
      ttip_label_date: textOption("Date Tooltip Label", "Automatic"),
      ttip_show_numerator: toggleOption("Show Numerator in Tooltip", true),
      ttip_label_numerator: textOption("Numerator Tooltip Label", "Numerator"),
      ttip_show_denominator: toggleOption("Show Denominator in Tooltip", true),
      ttip_label_denominator: textOption("Denominator Tooltip Label", "Denominator"),
      ttip_show_value: toggleOption("Show Value in Tooltip", true),
      ttip_label_value: textOption("Value Tooltip Label", "Automatic"),
      ll_truncate: numberOption("Truncate Lower Limits at:", undefined),
      ul_truncate: numberOption("Truncate Upper Limits at:", undefined)
    }
  }
};

export default spcSettings;
