// Re-declare FormattingComponent here to allow use in non-PBI environment
const enum FormattingComponent {
  AlignmentGroup = "AlignmentGroup",
  ColorPicker = "ColorPicker",
  ConditionalFormattingControl = "ConditionalFormattingControl",
  DatePicker = "DatePicker",
  Dropdown = "Dropdown",
  DurationPicker = "DurationPicker",
  EmptyControl = "EmptyControl",
  ErrorRangeControl = "ErrorRangeControl",
  FieldPicker = "FieldPicker",
  FlagsSelection = "FlagsSelection",
  FontControl = "FontControl",
  FontPicker = "FontPicker",
  GradientBar = "GradientBar",
  ImageUpload = "ImageUpload",
  Link = "Link",
  ListEditor = "ListEditor",
  MarginPadding = "MarginPadding",
  NumUpDown = "NumUpDown",
  ReadOnlyText = "ReadOnlyText",
  SeriesDialogLink = "SeriesDialogLink",
  ShapeMapSelector = "ShapeMapSelector",
  Slider = "Slider",
  TextArea = "TextArea",
  TextInput = "TextInput",
  ToggleSwitch = "ToggleSwitch",
}

import {
  FONT_LIST,
  BORDER_STYLE_ITEMS,
  BORDER_STYLE_VALID,
  lineWidth,
  lineType,
  opacity,
  fontPicker,
  fontSize,
  createOutlierColours,
  createLimitLineSettings,
  createSingleLineSettings
} from './settingsFactories';

const defaultColours = {
  improvement: "#00B0F0",
  deterioration: "#E46C0A",
  neutral_low: "#490092",
  neutral_high: "#490092",
  common_cause: "#A6A6A6",
  limits: "#6495ED",
  standard: "#000000"
}

const textOptions = {
  font: {
    type: "Dropdown",
    default: "'Arial', sans-serif",
    valid: FONT_LIST
  },
  size: {
    default: 10,
    options: { minValue: { value: 0 }, maxValue: { value: 100 } }
  },
  weight: {
    default: "normal",
    valid: ["normal", "bold", "bolder", "lighter"]
  },
  text_transform: {
    default: "uppercase",
    valid: ["uppercase", "lowercase", "capitalize", "none"]
  },
  text_overflow: {
    default: "ellipsis",
    valid: ["ellipsis", "clip", "none"]
  },
  text_align: {
    default: "center",
    valid: ["center", "left", "right"]
  }
};

const borderOptions = {
  width: {
    default: 1,
    options: { minValue: { value: 0 } }
  },
  style: {
    default: "solid",
    valid: BORDER_STYLE_VALID
  },
  colour: {
    default: "#000000"
  }
}


const settingsModel = {
  canvas: {
    description: "Canvas Settings",
    displayName: "Canvas Settings",
    settingsGroups: {
      "all": {
        show_errors: {
          displayName: "Show Errors on Canvas",
          type: FormattingComponent.ToggleSwitch,
          default: true
        },
        lower_padding: {
          displayName: "Padding Below Plot (pixels):",
          type: FormattingComponent.NumUpDown,
          default: 10
        },
        upper_padding: {
          displayName: "Padding Above Plot (pixels):",
          type: FormattingComponent.NumUpDown,
          default: 10
        },
        left_padding: {
          displayName: "Padding Left of Plot (pixels):",
          type: FormattingComponent.NumUpDown,
          default: 10
        },
        right_padding: {
          displayName: "Padding Right of Plot (pixels):",
          type: FormattingComponent.NumUpDown,
          default: 10
        }
      }
    }
  },
  spc: {
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
          default: <number>null
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
          default: <number>null
        },
        ul_truncate: {
          displayName: "Truncate Upper Limits at:",
          type: FormattingComponent.NumUpDown,
          default: <number>null
        }
      }
    }
  },
  outliers: {
    description: "Outlier Settings",
    displayName: "Outlier Settings",
    settingsGroups: {
      "General" : {
        process_flag_type: {
          displayName: "Type of Change to Flag",
          type: FormattingComponent.Dropdown,
          default: "both",
          valid: ["both", "improvement", "deterioration"],
          items: [
            { displayName : "Both",                 value : "both" },
            { displayName : "Improvement (Imp.)",   value : "improvement" },
            { displayName : "Deterioration (Det.)", value : "deterioration" }
          ]
        },
        improvement_direction: {
          displayName: "Improvement Direction",
          type: FormattingComponent.Dropdown,
          default: "increase",
          valid: ["increase", "neutral", "decrease"],
          items: [
            { displayName : "Increase", value : "increase" },
            { displayName : "Neutral",  value : "neutral" },
            { displayName : "Decrease", value : "decrease" }
          ]
        }
      },
      "Astronomical Points" : {
        astronomical: {
          displayName: "Highlight Astronomical Points",
          type: FormattingComponent.ToggleSwitch,
          default: false
        },
        astronomical_limit: {
          displayName: "Limit for Astronomical Points",
          type: FormattingComponent.Dropdown,
          default: "3 Sigma",
          valid: ["1 Sigma", "2 Sigma", "3 Sigma", "Specification"],
          items: [
            { displayName : "1 Sigma", value : "1 Sigma" },
            { displayName : "2 Sigma", value : "2 Sigma" },
            { displayName : "3 Sigma", value : "3 Sigma" },
            { displayName : "Specification", value : "Specification" }
          ]
        },
        ...createOutlierColours("ast", defaultColours)
      },
      "Shifts": {
        shift: {
          displayName: "Highlight Shifts",
          type: FormattingComponent.ToggleSwitch,
          default: false
        },
        shift_n: {
          displayName: "Shift Points",
          type: FormattingComponent.NumUpDown,
          default: 7,
          options: { minValue: { value: 1 } }
        },
        ...createOutlierColours("shift", defaultColours)
      },
      "Trends": {
        trend: {
          displayName: "Highlight Trends",
          type: FormattingComponent.ToggleSwitch,
          default: false
        },
        trend_n: {
          displayName: "Trend Points",
          type: FormattingComponent.NumUpDown,
          default: 5,
          options: { minValue: { value: 1 } }
        },
        ...createOutlierColours("trend", defaultColours)
      },
      "Two-In-Three": {
        two_in_three: {
          displayName: "Highlight Two-in-Three",
          type: FormattingComponent.ToggleSwitch,
          default: false
        },
        two_in_three_highlight_series: {
          displayName: "Highlight all in Pattern",
          type: FormattingComponent.ToggleSwitch,
          default: false
        },
        two_in_three_limit: {
          displayName: "Warning Limit for Two-in-Three",
          type: FormattingComponent.Dropdown,
          default: "2 Sigma",
          valid: ["1 Sigma", "2 Sigma", "3 Sigma", "Specification"],
          items: [
            { displayName : "1 Sigma", value : "1 Sigma" },
            { displayName : "2 Sigma", value : "2 Sigma" },
            { displayName : "3 Sigma", value : "3 Sigma" },
            { displayName : "Specification", value : "Specification" }
          ]
        },
        ...createOutlierColours("twointhree", defaultColours)
      }
    }
  },
  nhs_icons: {
    description: "NHS Icons Settings",
    displayName: "NHS Icons Settings",
    settingsGroups: {
      "all": {
        show_variation_icons: {
          displayName: "Show Variation Icons",
          type: FormattingComponent.ToggleSwitch,
          default: false
        },
        flag_last_point: {
          displayName: "Flag Only Last Point",
          type: FormattingComponent.ToggleSwitch,
          default: true
        },
        variation_icons_locations: {
          displayName: "Variation Icon Locations",
          type: FormattingComponent.Dropdown,
          default: "Top Right",
          valid: ["Top Right", "Bottom Right", "Top Left", "Bottom Left"],
          items: [
            { displayName : "Top Right",    value : "Top Right" },
            { displayName : "Bottom Right", value : "Bottom Right" },
            { displayName : "Top Left",     value : "Top Left" },
            { displayName : "Bottom Left",  value : "Bottom Left" }
          ]
        },
        variation_icons_scaling: {
          displayName: "Scale Variation Icon Size",
          type: FormattingComponent.NumUpDown,
          default: 1,
          options: { minValue: { value: 0 } }
        },
        show_assurance_icons: {
          displayName: "Show Assurance Icons",
          type: FormattingComponent.ToggleSwitch,
          default: false
        },
        assurance_icons_locations: {
          displayName: "Assurance Icon Locations",
          type: FormattingComponent.Dropdown,
          default: "Top Right",
          valid: ["Top Right", "Bottom Right", "Top Left", "Bottom Left"],
          items: [
            { displayName : "Top Right",    value : "Top Right" },
            { displayName : "Bottom Right", value : "Bottom Right" },
            { displayName : "Top Left",     value : "Top Left" },
            { displayName : "Bottom Left",  value : "Bottom Left" }
          ]
        },
        assurance_icons_scaling: {
          displayName: "Scale Assurance Icon Size",
          type: FormattingComponent.NumUpDown,
          default: 1,
          options: { minValue: { value: 0 } }
        }
      }
    }
  },
  scatter: {
    description: "Scatter Settings",
    displayName: "Scatter Settings",
    settingsGroups: {
      "all": {
        show_dots: {
          displayName: "Show Scatter",
          type: FormattingComponent.ToggleSwitch,
          default: true
        },
        shape: {
          displayName: "Shape",
          type: FormattingComponent.Dropdown,
          default: "Circle",
          valid: ["Circle", "Cross", "Diamond", "Square", "Star", "Triangle", "Wye"],
          items: [
            { displayName : "Circle", value : "Circle" },
            { displayName : "Cross", value : "Cross" },
            { displayName : "Diamond", value : "Diamond" },
            { displayName : "Square", value : "Square" },
            { displayName : "Star", value : "Star" },
            { displayName : "Triangle", value : "Triangle" },
            { displayName : "Wye", value : "Wye" }
          ]
        },
        size: {
          displayName: "Size",
          type: FormattingComponent.NumUpDown,
          default: 2.5,
          options: { minValue: { value: 0 }, maxValue: { value: 100 } }
        },
        colour: {
          displayName: "Colour",
          type: FormattingComponent.ColorPicker,
          default: defaultColours.common_cause
        },
        colour_outline: {
          displayName: "Outline Colour",
          type: FormattingComponent.ColorPicker,
          default: defaultColours.common_cause
        },
        width_outline: {
          displayName: "Outline Width",
          type: FormattingComponent.NumUpDown,
          default: 1,
          options: { minValue: { value: 0 }, maxValue: { value: 100 } }
        },
        opacity: {
          displayName: "Default Opacity",
          type: FormattingComponent.NumUpDown,
          default: 1,
          options: { minValue: { value: 0 }, maxValue: { value: 1 } }
        },
        opacity_selected: {
          displayName: "Opacity if Selected",
          type: FormattingComponent.NumUpDown,
          default: 1,
          options: { minValue: { value: 0 }, maxValue: { value: 1 } }
        },
        opacity_unselected: {
          displayName: "Opacity if Unselected",
          type: FormattingComponent.NumUpDown,
          default: 0.2,
          options: { minValue: { value: 0 }, maxValue: { value: 1 } }
        }
      }
    }
  },
  lines: {
    description: "Line Settings",
    displayName: "Line Settings",
    settingsGroups: {
      "Main": createSingleLineSettings("main", "Main Line", {
        show: true,
        width: 1,
        type: "10 0",
        colour: defaultColours.common_cause,
        opacity: 1,
        opacity_unselected: 0.2
      }, false),
      "Target": createSingleLineSettings("target", "Target", {
        show: true,
        width: 1.5,
        type: "10 0",
        colour: defaultColours.standard,
        opacity: 1,
        opacity_unselected: 0.2,
        tooltip_label: "Centerline"
      }, true),
      "Alt. Target": {
        show_alt_target: {
          displayName: "Show Alt. Target Line",
          type: FormattingComponent.ToggleSwitch,
          default: false
        },
        alt_target: {
          displayName: "Additional Target Value:",
          type: FormattingComponent.NumUpDown,
          default: <number>null
        },
        multiplier_alt_target: {
          displayName: "Apply Multiplier to Alt. Target",
          type: FormattingComponent.ToggleSwitch,
          default: false
        },
        ...createSingleLineSettings("alt_target", "Alt. Target", {
          show: false,
          width: 1.5,
          type: "10 0",
          colour: defaultColours.standard,
          opacity: 1,
          opacity_unselected: 0.2,
          tooltip_label: "Alt. Target"
        }, true)
      },
      "68% Limits": createLimitLineSettings("68", "68%", {
        show: false,
        width: 2,
        type: "2 5",
        colour: defaultColours.limits,
        opacity: 1,
        opacity_unselected: 0.2
      }, true),
      "95% Limits": createLimitLineSettings("95", "95%", {
        show: true,
        width: 2,
        type: "2 5",
        colour: defaultColours.limits,
        opacity: 1,
        opacity_unselected: 0.2
      }, true),
      "99% Limits": createLimitLineSettings("99", "99%", {
        show: true,
        width: 2,
        type: "10 10",
        colour: defaultColours.limits,
        opacity: 1,
        opacity_unselected: 0.2
      }, true),
      "Specification Limits": {
        show_specification: {
          displayName: "Show Specification Lines",
          type: FormattingComponent.ToggleSwitch,
          default: false
        },
        specification_upper: {
          displayName: "Upper Specification Limit:",
          type: FormattingComponent.NumUpDown,
          default: <number>null
        },
        specification_lower: {
          displayName: "Lower Specification Limit:",
          type: FormattingComponent.NumUpDown,
          default: <number>null
        },
        multiplier_specification: {
          displayName: "Apply Multiplier to Specification Limits",
          type: FormattingComponent.ToggleSwitch,
          default: false
        },
        ...createLimitLineSettings("specification", "specification", {
          show: false,
          width: 2,
          type: "10 10",
          colour: defaultColours.limits,
          opacity: 1,
          opacity_unselected: 0.2
        }, true)
      },
      "Trend": createSingleLineSettings("trend", "Trend", {
        show: false,
        width: 1.5,
        type: "10 0",
        colour: defaultColours.common_cause,
        opacity: 1,
        opacity_unselected: 0.2,
        tooltip_label: "Centerline"
      }, true)
    }
  },
  x_axis: {
    description: "X Axis Settings",
    displayName: "X Axis Settings",
    settingsGroups: {
      "Axis": {
        xlimit_show: {
          displayName: "Show X Axis",
          type: FormattingComponent.ToggleSwitch,
          default: true
        },
        xlimit_colour: {
          displayName: "Axis Colour",
          type: FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        xlimit_l: {
          displayName: "Lower Limit",
          type: FormattingComponent.NumUpDown,
          default:<number>null
        },
        xlimit_u: {
          displayName: "Upper Limit",
          type: FormattingComponent.NumUpDown,
          default:<number>null
        }
      },
      "Ticks": {
        xlimit_ticks: {
          displayName: "Draw Ticks",
          type: FormattingComponent.ToggleSwitch,
          default: true
        },
        xlimit_tick_count: {
          displayName: "Maximum Ticks",
          type: FormattingComponent.NumUpDown,
          default: 10,
          options: { minValue: { value: 0 }, maxValue: { value: 100 } }
        },
        xlimit_tick_font: fontPicker("Tick Font", textOptions.font.default),
        xlimit_tick_size: fontSize("Tick Font Size", textOptions.size.default),
        xlimit_tick_colour: {
          displayName: "Tick Font Colour",
          type: FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        xlimit_tick_rotation: {
          displayName: "Tick Rotation (Degrees)",
          type: FormattingComponent.NumUpDown,
          default: -35,
          options: { minValue: { value: -360 }, maxValue: { value: 360 } }
        }
      },
      "Label": {
        xlimit_label: {
          displayName: "Label",
          type: FormattingComponent.TextInput,
          default: <string>null
        },
        xlimit_label_font: fontPicker("Label Font", textOptions.font.default),
        xlimit_label_size: fontSize("Label Font Size", textOptions.size.default),
        xlimit_label_colour: {
          displayName: "Label Font Colour",
          type: FormattingComponent.ColorPicker,
          default: defaultColours.standard
        }
      }
    }
  },
  y_axis: {
    description: "Y Axis Settings",
    displayName: "Y Axis Settings",
    settingsGroups: {
      "Axis": {
        ylimit_show: {
          displayName: "Show Y Axis",
          type: FormattingComponent.ToggleSwitch,
          default: true
        },
        ylimit_colour: {
          displayName: "Axis Colour",
          type: FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        limit_multiplier: {
          displayName: "Axis Scaling Factor",
          type: FormattingComponent.NumUpDown,
          default: 1.5,
          options: { minValue: { value: 0 } }
        },
        ylimit_sig_figs: {
          displayName: "Tick Decimal Places",
          type: FormattingComponent.NumUpDown,
          default:<number>null,
          options: { minValue: { value: 0 }, maxValue: { value: 100 } }
        },
        ylimit_l: {
          displayName: "Lower Limit",
          type: FormattingComponent.NumUpDown,
          default:<number>null
        },
        ylimit_u: {
          displayName: "Upper Limit",
          type: FormattingComponent.NumUpDown,
          default:<number>null
        }
      },
      "Ticks": {
        ylimit_ticks: {
          displayName: "Draw Ticks",
          type: FormattingComponent.ToggleSwitch,
          default: true
        },
        ylimit_tick_count: {
          displayName: "Maximum Ticks",
          type: FormattingComponent.NumUpDown,
          default: 10,
          options: { minValue: { value: 0 }, maxValue: { value: 100 } }
        },
        ylimit_tick_font: fontPicker("Tick Font", textOptions.font.default),
        ylimit_tick_size: fontSize("Tick Font Size", textOptions.size.default),
        ylimit_tick_colour: {
          displayName: "Tick Font Colour",
          type: FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        ylimit_tick_rotation: {
          displayName: "Tick Rotation (Degrees)",
          type: FormattingComponent.NumUpDown,
          default: 0,
          options: { minValue: { value: -360 }, maxValue: { value: 360 } }
        }
      },
      "Label": {
        ylimit_label: {
          displayName: "Label",
          type: FormattingComponent.TextInput,
          default: <string>null
        },
        ylimit_label_font: fontPicker("Label Font", textOptions.font.default),
        ylimit_label_size: fontSize("Label Font Size", textOptions.size.default),
        ylimit_label_colour: {
          displayName: "Label Font Colour",
          type: FormattingComponent.ColorPicker,
          default: defaultColours.standard
        }
      }
    }
  },
  dates: {
    description: "Date Settings",
    displayName: "Date Settings",
    settingsGroups: {
      "all": {
        date_format_day: {
          displayName: "Day Format",
          type: FormattingComponent.Dropdown,
          default: "DD",
          valid: ["DD", "Thurs DD", "Thursday DD", "(blank)"],
          items: [
            { displayName : "DD",          value : "DD" },
            { displayName : "Thurs DD",    value : "Thurs DD" },
            { displayName : "Thursday DD", value : "Thursday DD"  },
            { displayName : "(blank)",    value : "(blank)" }
          ]
        },
        date_format_month: {
          displayName: "Month Format",
          type: FormattingComponent.Dropdown,
          default: "MM",
          valid: ["MM", "Mon", "Month", "(blank)"],
          items: [
            { displayName : "MM",    value : "MM" },
            { displayName : "Mon",   value : "Mon" },
            { displayName : "Month", value : "Month" },
            { displayName : "(blank)",    value : "(blank)" }
          ]
        },
        date_format_year: {
          displayName: "Year Format",
          type: FormattingComponent.Dropdown,
          default: "YYYY",
          valid: ["YYYY", "YY", "(blank)"],
          items: [
              { displayName : "YYYY", value : "YYYY" },
              { displayName : "YY",   value : "YY" },
              { displayName : "(blank)",    value : "(blank)" }
            ]
        },
        date_format_delim: {
          displayName: "Delimiter",
          type: FormattingComponent.Dropdown,
          default: "/",
          valid: ["/", "-", " "],
          items: [
            { displayName : "/", value : "/" },
            { displayName : "-", value : "-" },
            { displayName : " ", value : " " }
          ]
        },
        date_format_locale: {
          displayName: "Locale",
          type: FormattingComponent.Dropdown,
          default: "en-GB",
          valid: ["en-GB", "en-US"],
          items: [
            { displayName : "en-GB", value : "en-GB" },
            { displayName : "en-US", value : "en-US" }
          ]
        }
      }
    }
  },
  summary_table: {
    description: "Summary Table Settings",
    displayName: "Summary Table Settings",
    settingsGroups: {
      "General": {
        show_table: {
          displayName: "Show Summary Table",
          type: FormattingComponent.ToggleSwitch,
          default: false
        },
        table_variation_filter: {
          displayName: "Filter by Variation Type",
          type: FormattingComponent.Dropdown,
          default: "all",
          valid: ["all", "common", "special", "improvement", "deterioration", "neutral"],
          items: [
            { displayName : "All",                           value : "all" },
            { displayName : "Common Cause",                  value : "common" },
            { displayName : "Special Cause - Any",           value : "special" },
            { displayName : "Special Cause - Improvement",   value : "improvement" },
            { displayName : "Special Cause - Deterioration", value : "deterioration" },
            { displayName : "Special Cause - Neutral",       value : "neutral" }
          ]
        },
        table_assurance_filter: {
          displayName: "Filter by Assurance Type",
          type: FormattingComponent.Dropdown,
          default: "all",
          valid: ["all", "any", "pass", "fail", "inconsistent"],
          items: [
            { displayName : "All",                           value : "all" },
            { displayName : "Consistent - Any",               value : "any" },
            { displayName : "Consistent Pass",               value : "pass" },
            { displayName : "Consistent Fail",               value : "fail" },
            { displayName : "Inconsistent",                  value : "inconsistent" }
          ]
        },
        table_text_overflow: {
          displayName: "Text Overflow Handling",
          type: FormattingComponent.Dropdown,
          default: textOptions.text_overflow.default,
          valid: textOptions.text_overflow.valid,
          items: [
            { displayName : "Ellipsis", value : "ellipsis" },
            { displayName : "Truncate",     value : "clip" },
            { displayName : "None",     value : "none" }
          ]
        },
        table_opacity: opacity("Default Opacity", 1),
        table_opacity_selected: opacity("Opacity if Selected", 1),
        table_opacity_unselected: opacity("Opacity if Unselected", 0.2),
        table_outer_border_style: {
          displayName: "Outer Border Style",
          type: FormattingComponent.Dropdown,
          default: borderOptions.style.default,
          valid: borderOptions.style.valid,
          items: BORDER_STYLE_ITEMS
        },
        table_outer_border_width: {
          displayName: "Outer Border Width",
          type: FormattingComponent.NumUpDown,
          default: borderOptions.width.default,
          options: borderOptions.width.options
        },
        table_outer_border_colour: {
          displayName: "Outer Border Colour",
          type: FormattingComponent.ColorPicker,
          default: borderOptions.colour.default,
        },
        table_outer_border_top: {
          displayName: "Outer Border Top",
          type: FormattingComponent.ToggleSwitch,
          default: true
        },
        table_outer_border_bottom: {
          displayName: "Outer Border Bottom",
          type: FormattingComponent.ToggleSwitch,
          default: true
        },
        table_outer_border_left: {
          displayName: "Outer Border Left",
          type: FormattingComponent.ToggleSwitch,
          default: true
        },
        table_outer_border_right: {
          displayName: "Outer Border Right",
          type: FormattingComponent.ToggleSwitch,
          default: true
        }
      },
      "Header": {
        table_header_font: fontPicker("Header Font", textOptions.font.default),
        table_header_size: fontSize("Header Font Size", textOptions.size.default),
        table_header_text_align: {
          displayName: "Text Alignment",
          type: FormattingComponent.AlignmentGroup,
          default: textOptions.text_align.default,
          valid: textOptions.text_align.valid
        },
        table_header_font_weight: {
          displayName: "Header Font Weight",
          type: FormattingComponent.Dropdown,
          default: textOptions.weight.default,
          valid: textOptions.weight.valid,
          items: [
            { displayName : "Normal", value : "normal" },
            { displayName : "Bold",   value : "bold" }
          ]
        },
        table_header_text_transform: {
          displayName: "Header Text Transform",
          type: FormattingComponent.Dropdown,
          default: textOptions.text_transform.default,
          valid: textOptions.text_transform.valid,
          items: [
            { displayName : "Uppercase",   value : "uppercase" },
            { displayName : "Lowercase",   value : "lowercase" },
            { displayName : "Capitalise",  value : "capitalize" },
            { displayName : "None",        value : "none" }
          ]
        },
        table_header_text_padding: {
          displayName: "Padding Around Text",
          type: FormattingComponent.NumUpDown,
          default: 1,
          options: { minValue: { value: 0 }, maxValue: { value: 100 } }
        },
        table_header_colour: {
          displayName: "Header Font Colour",
          type: FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        table_header_bg_colour: {
          displayName: "Header Background Colour",
          type: FormattingComponent.ColorPicker,
          default: "#D3D3D3"
        },
        table_header_border_style: {
          displayName: "Header Border Style",
          type: FormattingComponent.Dropdown,
          default: borderOptions.style.default,
          valid: borderOptions.style.valid,
          items: BORDER_STYLE_ITEMS
        },
        table_header_border_width: {
          displayName: "Header Border Width",
          type: FormattingComponent.NumUpDown,
          default: borderOptions.width.default,
          options: borderOptions.width.options
        },
        table_header_border_colour: {
          displayName: "Header Border Colour",
          type: FormattingComponent.ColorPicker,
          default: borderOptions.colour.default,
        },
        table_header_border_bottom: {
          displayName: "Bottom Border",
          type: FormattingComponent.ToggleSwitch,
          default: true
        },
        table_header_border_inner: {
          displayName: "Inner Borders",
          type: FormattingComponent.ToggleSwitch,
          default: true
        }
      },
      "Body": {
        table_body_font: fontPicker("Body Font", textOptions.font.default),
        table_body_size: fontSize("Body Font Size", textOptions.size.default),
        table_body_text_align: {
          displayName: "Text Alignment",
          type: FormattingComponent.AlignmentGroup,
          default: textOptions.text_align.default,
          valid: textOptions.text_align.valid
        },
        table_body_font_weight: {
          displayName: "Font Weight",
          type: FormattingComponent.Dropdown,
          default: textOptions.weight.default,
          valid: textOptions.weight.valid,
          items: [
            { displayName : "Normal", value : "normal" },
            { displayName : "Bold",   value : "bold" }
          ]
        },
        table_body_text_transform: {
          displayName: "Text Transform",
          type: FormattingComponent.Dropdown,
          default: textOptions.text_transform.default,
          valid: textOptions.text_transform.valid,
          items: [
            { displayName : "Uppercase",   value : "uppercase" },
            { displayName : "Lowercase",   value : "lowercase" },
            { displayName : "Capitalise",  value : "capitalize" },
            { displayName : "None",        value : "none" }
          ]
        },
        table_body_text_padding: {
          displayName: "Padding Around Text",
          type: FormattingComponent.NumUpDown,
          default: 1,
          options: { minValue: { value: 0 }, maxValue: { value: 100 } }
        },
        table_body_colour: {
          displayName: "Body Font Colour",
          type: FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        table_body_bg_colour: {
          displayName: "Body Background Colour",
          type: FormattingComponent.ColorPicker,
          default: "#FFFFFF"
        },
        table_body_border_style: {
          displayName: "Body Border Style",
          type: FormattingComponent.Dropdown,
          default: borderOptions.style.default,
          valid: borderOptions.style.valid,
          items: BORDER_STYLE_ITEMS
        },
        table_body_border_width: {
          displayName: "Body Border Width",
          type: FormattingComponent.NumUpDown,
          default: borderOptions.width.default,
          options: borderOptions.width.options
        },
        table_body_border_colour: {
          displayName: "Body Border Colour",
          type: FormattingComponent.ColorPicker,
          default: borderOptions.colour.default,
        },
        table_body_border_top_bottom: {
          displayName: "Top/Bottom Borders",
          type: FormattingComponent.ToggleSwitch,
          default: true
        },
        table_body_border_left_right: {
          displayName: "Left/Right Borders",
          type: FormattingComponent.ToggleSwitch,
          default: true
        }
      }
    }
  },
  download_options: {
    description: "Download Options",
    displayName: "Download Options",
    settingsGroups: {
      "all": {
        show_button: {
          displayName: "Show Download Button",
          type: FormattingComponent.ToggleSwitch,
          default: false
        }
      }
    }
  },
  labels: {
    description: "Labels Settings",
    displayName: "Labels Settings",
    settingsGroups: {
      "all": {
        show_labels: {
          displayName: "Show Value Labels",
          type: FormattingComponent.ToggleSwitch,
          default: true
        },
        label_position: {
          displayName: "Label Position",
          type: FormattingComponent.Dropdown,
          default: "top",
          valid: ["top", "bottom"],
          items: [
            { displayName : "Top",    value : "top" },
            { displayName : "Bottom", value : "bottom" }
          ]
        },
        label_y_offset: {
          displayName: "Label Offset from Top/Bottom (px)",
          type: FormattingComponent.NumUpDown,
          default: 20
        },
        label_line_offset: {
          displayName: "Label Offset from Connecting Line (px)",
          type: FormattingComponent.NumUpDown,
          default: 5
        },
        label_angle_offset: {
          displayName: "Label Angle Offset (degrees)",
          type: FormattingComponent.NumUpDown,
          default: 0,
          options: { minValue: { value: -90 }, maxValue: { value: 90 } }
        },
        label_font: fontPicker("Label Font", textOptions.font.default),
        label_size: fontSize("Label Font Size", textOptions.size.default),
        label_colour: {
          displayName: "Label Font Colour",
          type: FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        label_line_colour: {
          displayName: "Connecting Line Colour",
          type: FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        label_line_width: lineWidth("Connecting Line Width", 1),
        label_line_type: lineType("Connecting Line Type", "10 0"),
        label_line_max_length: {
          displayName: "Max Connecting Line Length (px)",
          type: FormattingComponent.NumUpDown,
          default: 1000,
          options: { minValue: { value: 0 }, maxValue: { value: 10000 } }
        },
        label_marker_show: {
          displayName: "Show Line Markers",
          type: FormattingComponent.ToggleSwitch,
          default: true
        },
        label_marker_offset: {
          displayName: "Marker Offset from Value (px)",
          type: FormattingComponent.NumUpDown,
          default: 5
        },
        label_marker_size: {
          displayName: "Marker Size",
          type: FormattingComponent.NumUpDown,
          default: 3,
          options: { minValue: { value: 0 }, maxValue: { value: 100 } }
        },
        label_marker_colour: {
          displayName: "Marker Fill Colour",
          type: FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        label_marker_outline_colour: {
          displayName: "Marker Outline Colour",
          type: FormattingComponent.ColorPicker,
          default: defaultColours.standard
        }
      }
    }
  }
};

/**
 * Majority of below for temporary compatibility with older code
 * for the new settings structure, to be cleaned up in future refactor
 */

type settingsModelType = typeof settingsModel;
type settingsModelKeys = keyof settingsModelType;

type MergeUnions<T> = (T extends any ? (x: T) => void : never) extends (x: infer R) => void
  ? { [K in keyof R]: R[K] }
  : never;

type settingsGroups<T> = Extract<keyof T, "settingsGroups">;
type settingsGroupMembers<T> = MergeUnions<T[settingsGroups<T>][keyof T[settingsGroups<T>]]>;
type DefaultTypes<T> = T[Extract<keyof T, "default">];

export type NestedKeysOf<T>
  = T extends object
    ? { [K in keyof T]: K extends string ? K : never; }[keyof T]
    : never;

export type defaultSettingsType = {
  [K in settingsModelKeys]: {
    [L in keyof settingsGroupMembers<settingsModelType[K]>]: DefaultTypes<settingsGroupMembers<settingsModelType[K]>[L]>
  }
}
export type defaultSettingsKeys = keyof defaultSettingsType;
export type defaultSettingsNestedKeys = NestedKeysOf<defaultSettingsType[defaultSettingsKeys]>;

const defaultSettingsArray = [];
for (const key in settingsModel) {
  const curr_card = [];
  for (const group in settingsModel[key].settingsGroups) {
    for (const setting in settingsModel[key].settingsGroups[group]) {
      curr_card.push([setting, settingsModel[key].settingsGroups[group][setting]]);
    }
  }
  defaultSettingsArray.push([key, Object.fromEntries(curr_card)]);
}

const defaultSettings = Object.fromEntries(defaultSettingsArray) as defaultSettingsType;

export { defaultSettings }
export default settingsModel;
