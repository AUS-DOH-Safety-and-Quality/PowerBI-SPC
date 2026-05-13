import { FormattingComponent } from "./common";

const spcSettings = {
  description: "SPC Settings",
  displayName: "Data Settings",
  settingsGroups: {
    "all": {
      chart_type: {
        displayName: "Chart Type",
        type: FormattingComponent.Dropdown,
        default: "i",
        valid: ["run", "i", "i_m", "i_mm", "mr", "p", "pp", "u", "up", "c", "xbar", "s", "g", "t"],
        items: [
          { displayName : "run - Run Chart",                                   value : "run" },
          { displayName : "i - Individual Measurements",                       value : "i" },
          { displayName : "i_m - Individual Measurements: Median centerline",  value : "i_m" },
          { displayName : "i_mm - Individual Measurements: Median centerline, Median MR Limits",  value : "i_mm" },
          { displayName : "mr - Moving Range of Individual Measurements",       value : "mr" },
          { displayName : "p - Proportions",                                    value : "p" },
          { displayName : "p prime - Proportions: Large-Sample Corrected",      value : "pp" },
          { displayName : "u - Rates",                                          value : "u" },
          { displayName : "u prime - Rates: Large-Sample Correction",           value : "up" },
          { displayName : "c - Counts",                                         value : "c" },
          { displayName : "xbar - Sample Means",                                value : "xbar" },
          { displayName : "s - Sample SDs",                                     value : "s" },
          { displayName : "g - Number of Non-Events Between Events",            value : "g" },
          { displayName : "t - Time Between Events",                            value : "t" }
        ]
      },
      outliers_in_limits: {
        displayName: "Keep Outliers in Limit Calcs.",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      multiplier: {
        displayName: "Multiplier",
        type: FormattingComponent.NumUpDown,
        default: 1,
        options: { minValue: { value: 0 } }
      },
      sig_figs: {
        displayName: "Decimals to Report:",
        type: FormattingComponent.NumUpDown,
        default: 2,
        options: { minValue: { value: 0 }, maxValue: { value: 20 } }
      },
      perc_labels: {
        displayName: "Report as percentage",
        type: FormattingComponent.Dropdown,
        default: "Automatic",
        valid: ["Automatic", "Yes", "No"],
        items: [
          { displayName : "Automatic",  value : "Automatic" },
          { displayName : "Yes",        value : "Yes" },
          { displayName : "No",         value : "No" }
        ]
      },
      split_on_click: {
        displayName: "Split Limits on Click",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      num_points_subset: {
        displayName: "Subset Number of Points for Limit Calculations",
        type: FormattingComponent.NumUpDown,
        default: undefined as number | undefined
      },
      subset_points_from: {
        displayName: "Subset Points From",
        type: FormattingComponent.Dropdown,
        default: "Start",
        valid: ["Start", "End"],
        items: [
          { displayName : "Start", value : "Start" },
          { displayName : "End",   value : "End" }
        ]
      },
      ttip_show_date: {
        displayName: "Show Date in Tooltip",
        type: FormattingComponent.ToggleSwitch,
        default: true
      },
      ttip_label_date: {
        displayName: "Date Tooltip Label",
        type: FormattingComponent.TextInput,
        default: "Automatic"
      },
      ttip_show_numerator: {
        displayName: "Show Numerator in Tooltip",
        type: FormattingComponent.ToggleSwitch,
        default: true
      },
      ttip_label_numerator: {
        displayName: "Numerator Tooltip Label",
        type: FormattingComponent.TextInput,
        default: "Numerator"
      },
      ttip_show_denominator: {
        displayName: "Show Denominator in Tooltip",
        type: FormattingComponent.ToggleSwitch,
        default: true
      },
      ttip_label_denominator: {
        displayName: "Denominator Tooltip Label",
        type: FormattingComponent.TextInput,
        default: "Denominator"
      },
      ttip_show_value: {
        displayName: "Show Value in Tooltip",
        type: FormattingComponent.ToggleSwitch,
        default: true
      },
      ttip_label_value: {
        displayName: "Value Tooltip Label",
        type: FormattingComponent.TextInput,
        default: "Automatic"
      },
      ll_truncate: {
        displayName: "Truncate Lower Limits at:",
        type: FormattingComponent.NumUpDown,
        default: undefined as number | undefined
      },
      ul_truncate: {
        displayName: "Truncate Upper Limits at:",
        type: FormattingComponent.NumUpDown,
        default: undefined as number | undefined
      }
    }
  }
};

export default spcSettings;
