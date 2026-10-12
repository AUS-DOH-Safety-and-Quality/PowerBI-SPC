import {
  numberOption, toggleOption, textOption, dropdownOption, scalingOptions, valueTooltipOptions, limitTruncationOptions
} from "powerbi-visuals-core/settings";

const spcSettings = {
  description: "SPC Settings",
  displayName: "Data Settings",
  settingsGroups: {
    "all": {
      chart_type: dropdownOption(
        "Chart Type", "Type of control chart; see Chart Types for the inputs each needs.", "i",
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
      outliers_in_limits: toggleOption("Keep Outliers in Limit Calcs.",
                                       "Keeps unusually large moving ranges when calculating limits; off drops them first. "
                                       + "Applies to i, i_m, i_mm, t, p prime and u prime charts.", false),
      ...scalingOptions(),
      split_on_click: toggleOption("Split Limits on Click",
                                   "Clicking a point ends a limit period there; clicking it again removes the split. "
                                   + "Splits stay when this is turned off, and are ignored when Grouping (Summary Table) is used.", false),
      num_points_subset: numberOption("Subset Number of Points for Limit Calculations",
                                      "Calculates the first period's limits from only this many points; blank or out of range uses them all.",
                                      undefined, { min: 1, integer: true }),
      subset_points_from: dropdownOption("Subset Points From", "Whether the subset is taken from the start or end of the period.",
                                         "Start", ["Start", "End"]),
      subset_rebaselines: toggleOption("Subset Points After Each Re-Baseline",
                                       "Applies the subset to every rebaseline period, not only the first.", false),
      ttip_show_date: toggleOption("Show Date in Tooltip", "Shows the date, or the point number for g and t charts, in the tooltip.", true),
      ttip_label_date: textOption("Date Tooltip Label",
                                  "Name for the date in the tooltip; Automatic uses Date, or Event for g and t charts.", "Automatic"),
      ...valueTooltipOptions(),
      ...limitTruncationOptions()
    }
  }
};

export default spcSettings;
