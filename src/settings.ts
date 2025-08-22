import powerbi from "powerbi-visuals-api"

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
    valid: [
      "'Arial', sans-serif",
      "Arial",
      "'Arial Black'",
      "'Arial Unicode MS'",
      "Calibri",
      "Cambria",
      "'Cambria Math'",
      "Candara",
      "'Comic Sans MS'",
      "Consolas",
      "Constantia",
      "Corbel",
      "'Courier New'",
      "wf_standard-font, helvetica, arial, sans-serif",
      "wf_standard-font_light, helvetica, arial, sans-serif",
      "Georgia",
      "'Lucida Sans Unicode'",
      "'Segoe UI', wf_segoe-ui_normal, helvetica, arial, sans-serif",
      "'Segoe UI Light', wf_segoe-ui_light, helvetica, arial, sans-serif",
      "'Segoe UI Semibold', wf_segoe-ui_semibold, helvetica, arial, sans-serif",
      "'Segoe UI Bold', wf_segoe-ui_bold, helvetica, arial, sans-serif",
      "Symbol",
      "Tahoma",
      "'Times New Roman'",
      "'Trebuchet MS'",
      "Verdana",
      "Wingdings"
    ]
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
    valid: ["solid", "dotted", "dashed", "double", "groove", "ridge", "inset", "outset", "none"]
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
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        lower_padding: {
          displayName: "Padding Below Plot (pixels):",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 10
        },
        upper_padding: {
          displayName: "Padding Above Plot (pixels):",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 10
        },
        left_padding: {
          displayName: "Padding Left of Plot (pixels):",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 10
        },
        right_padding: {
          displayName: "Padding Right of Plot (pixels):",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
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
          type: powerbi.visuals.FormattingComponent.Dropdown,
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
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        multiplier: {
          displayName: "Multiplier",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          options: { minValue: { value: 0 } }
        },
        sig_figs: {
          displayName: "Decimals to Report:",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 2,
          options: { minValue: { value: 0 }, maxValue: { value: 20 } }
        },
        perc_labels: {
          displayName: "Report as percentage",
          type: powerbi.visuals.FormattingComponent.Dropdown,
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
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        num_points_subset: {
          displayName: "Subset Number of Points for Limit Calculations",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: <number>null
        },
        subset_points_from: {
          displayName: "Subset Points From",
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "Start",
          valid: ["Start", "End"],
          items: [
            { displayName : "Start", value : "Start" },
            { displayName : "End",   value : "End" }
          ]
        },
        ttip_show_numerator: {
          displayName: "Show Numerator in Tooltip",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        ttip_label_numerator: {
          displayName: "Numerator Tooltip Label",
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: "Numerator"
        },
        ttip_show_denominator: {
          displayName: "Show Denominator in Tooltip",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        ttip_label_denominator: {
          displayName: "Denominator Tooltip Label",
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: "Denominator"
        },
        ttip_show_value: {
          displayName: "Show Value in Tooltip",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        ttip_label_value: {
          displayName: "Value Tooltip Label",
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: "Automatic"
        },
        ll_truncate: {
          displayName: "Truncate Lower Limits at:",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: <number>null
        },
        ul_truncate: {
          displayName: "Truncate Upper Limits at:",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
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
          type: powerbi.visuals.FormattingComponent.Dropdown,
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
          type: powerbi.visuals.FormattingComponent.Dropdown,
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
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        astronomical_limit: {
          displayName: "Limit for Astronomical Points",
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "3 Sigma",
          valid: ["1 Sigma", "2 Sigma", "3 Sigma", "Specification"],
          items: [
            { displayName : "1 Sigma", value : "1 Sigma" },
            { displayName : "2 Sigma", value : "2 Sigma" },
            { displayName : "3 Sigma", value : "3 Sigma" },
            { displayName : "Specification", value : "Specification" }
          ]
        },
        ast_colour_improvement: {
          displayName: "Imp. Ast. Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.improvement
        },
        ast_colour_deterioration: {
          displayName: "Det. Ast. Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.deterioration
        },
        ast_colour_neutral_low: {
          displayName: "Neutral (Low) Ast. Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.neutral_low
        },
        ast_colour_neutral_high: {
          displayName: "Neutral (High) Ast. Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.neutral_high
        }
      },
      "Shifts": {
        shift: {
          displayName: "Highlight Shifts",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        shift_n: {
          displayName: "Shift Points",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 7,
          options: { minValue: { value: 1 } }
        },
        shift_colour_improvement: {
          displayName: "Imp. Shift Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.improvement
        },
        shift_colour_deterioration: {
          displayName: "Det. Shift Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.deterioration
        },
        shift_colour_neutral_low: {
          displayName: "Neutral (Low) Shift Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.neutral_low
        },
        shift_colour_neutral_high: {
          displayName: "Neutral (High) Shift Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.neutral_high
        }
      },
      "Trends": {
        trend: {
          displayName: "Highlight Trends",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        trend_n: {
          displayName: "Trend Points",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 5,
          options: { minValue: { value: 1 } }
        },
        trend_colour_improvement: {
          displayName: "Imp. Trend Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.improvement
        },
        trend_colour_deterioration: {
          displayName: "Det. Trend Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.deterioration
        },
        trend_colour_neutral_low: {
          displayName: "Neutral (Low) Trend Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.neutral_low
        },
        trend_colour_neutral_high: {
          displayName: "Neutral (High) Trend Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.neutral_high
        }
      },
      "Two-In-Three": {
        two_in_three: {
          displayName: "Highlight Two-in-Three",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        two_in_three_highlight_series: {
          displayName: "Highlight all in Pattern",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        two_in_three_limit: {
          displayName: "Warning Limit for Two-in-Three",
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "2 Sigma",
          valid: ["1 Sigma", "2 Sigma", "3 Sigma", "Specification"],
          items: [
            { displayName : "1 Sigma", value : "1 Sigma" },
            { displayName : "2 Sigma", value : "2 Sigma" },
            { displayName : "3 Sigma", value : "3 Sigma" },
            { displayName : "Specification", value : "Specification" }
          ]
        },
        twointhree_colour_improvement: {
          displayName: "Imp. Two-in-Three Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.improvement
        },
        twointhree_colour_deterioration: {
          displayName: "Det. Two-in-Three Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.deterioration
        },
        twointhree_colour_neutral_low: {
          displayName: "Neutral (Low) Two-in-Three Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.neutral_low
        },
        twointhree_colour_neutral_high: {
          displayName: "Neutral (High) Two-in-Three Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.neutral_high
        }
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
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        flag_last_point: {
          displayName: "Flag Only Last Point",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        variation_icons_locations: {
          displayName: "Variation Icon Locations",
          type: powerbi.visuals.FormattingComponent.Dropdown,
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
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          options: { minValue: { value: 0 } }
        },
        show_assurance_icons: {
          displayName: "Show Assurance Icons",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        assurance_icons_locations: {
          displayName: "Assurance Icon Locations",
          type: powerbi.visuals.FormattingComponent.Dropdown,
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
          type: powerbi.visuals.FormattingComponent.NumUpDown,
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
        shape: {
          displayName: "Shape",
          type: powerbi.visuals.FormattingComponent.Dropdown,
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
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 2.5,
          options: { minValue: { value: 0 }, maxValue: { value: 100 } }
        },
        colour: {
          displayName: "Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.common_cause
        },
        colour_outline: {
          displayName: "Outline Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.common_cause
        },
        width_outline: {
          displayName: "Outline Width",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          options: { minValue: { value: 0 }, maxValue: { value: 100 } }
        },
        opacity: {
          displayName: "Default Opacity",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          options: { minValue: { value: 0 }, maxValue: { value: 1 } }
        },
        opacity_selected: {
          displayName: "Opacity if Selected",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          options: { minValue: { value: 0 }, maxValue: { value: 1 } }
        },
        opacity_unselected: {
          displayName: "Opacity if Unselected",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
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
      "Main": {
        show_main: {
          displayName: "Show Main Line",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        width_main: {
          displayName: "Main Line Width",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          options: { minValue: { value: 0 }, maxValue: { value: 100 } }
        },
        type_main: {
          displayName: "Main Line Type",
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "10 0",
          valid: ["10 0", "10 10", "2 5"],
          items: [
            { displayName : "Solid",  value : "10 0" },
            { displayName : "Dashed", value : "10 10" },
            { displayName : "Dotted", value : "2 5" }
          ]
        },
        colour_main: {
          displayName: "Main Line Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.common_cause
        },
        opacity_main: {
          displayName: "Default Opacity",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          options: { minValue: { value: 0 }, maxValue: { value: 1 } }
        },
        opacity_unselected_main: {
          displayName: "Opacity if Any Selected",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 0.2,
          options: { minValue: { value: 0 }, maxValue: { value: 1 } }
        },
        join_rebaselines_main: {
          displayName: "Connect Rebaselined Limits",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        plot_label_show_main: {
          displayName: "Show Value on Plot",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        plot_label_show_all_main: {
          displayName: "Show Value at all Re-Baselines",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        plot_label_show_n_main: {
          displayName: "Show Value at Last N Re-Baselines",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          options: { minValue: { value: 1 } }
        },
        plot_label_position_main: {
          displayName: "Position of Value on Line(s)",
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "beside",
          valid: ["above", "below", "beside"],
          items: [
            { displayName : "Above",      value : "above" },
            { displayName : "Below",      value : "below" },
            { displayName : "Beside",     value : "beside" }
          ]
        },
        plot_label_vpad_main: {
          displayName: "Value Vertical Padding",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 0
        },
        plot_label_hpad_main: {
          displayName: "Value Horizontal Padding",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 10
        },
        plot_label_font_main: {
          displayName: "Value Font",
          type: powerbi.visuals.FormattingComponent.FontPicker,
          default: textOptions.font.default,
          valid: textOptions.font.valid
        },
        plot_label_size_main: {
          displayName: "Value Font Size",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: textOptions.size.default,
          options: textOptions.size.options
        },
        plot_label_colour_main: {
          displayName: "Value Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        plot_label_prefix_main: {
          displayName: "Value Prefix",
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: ""
        }
      },
      "Target": {
        show_target: {
          displayName: "Show Target",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        width_target: {
          displayName: "Line Width",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1.5,
          options: { minValue: { value: 0 }, maxValue: { value: 100 } }
        },
        type_target: {
          displayName: "Line Type",
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "10 0",
          valid: ["10 0", "10 10", "2 5"],
          items: [
            { displayName : "Solid",  value : "10 0" },
            { displayName : "Dashed", value : "10 10" },
            { displayName : "Dotted", value : "2 5" }
          ]
        },
        colour_target: {
          displayName: "Line Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        opacity_target: {
          displayName: "Default Opacity",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          options: { minValue: { value: 0 }, maxValue: { value: 1 } }
        },
        opacity_unselected_target: {
          displayName: "Opacity if Any Selected",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 0.2,
          options: { minValue: { value: 0 }, maxValue: { value: 1 } }
        },
        join_rebaselines_target: {
          displayName: "Connect Rebaselined Limits",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        ttip_show_target: {
          displayName: "Show value in tooltip",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        ttip_label_target: {
          displayName: "Tooltip Label",
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: "Centerline"
        },
        plot_label_show_target: {
          displayName: "Show Value on Plot",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        plot_label_show_all_target: {
          displayName: "Show Value at all Re-Baselines",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        plot_label_show_n_target: {
          displayName: "Show Value at Last N Re-Baselines",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          options: { minValue: { value: 1 } }
        },
        plot_label_position_target: {
          displayName: "Position of Value on Line(s)",
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "beside",
          valid: ["above", "below", "beside"],
          items: [
            { displayName : "Above",      value : "above" },
            { displayName : "Below",      value : "below" },
            { displayName : "Beside",     value : "beside" }
          ]
        },
        plot_label_vpad_target: {
          displayName: "Value Vertical Padding",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 0
        },
        plot_label_hpad_target: {
          displayName: "Value Horizontal Padding",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 10
        },
        plot_label_font_target: {
          displayName: "Value Font",
          type: powerbi.visuals.FormattingComponent.FontPicker,
          default: textOptions.font.default,
          valid: textOptions.font.valid
        },
        plot_label_size_target: {
          displayName: "Value Font Size",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: textOptions.size.default,
          options: textOptions.size.options
        },
        plot_label_colour_target: {
          displayName: "Value Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        plot_label_prefix_target: {
          displayName: "Value Prefix",
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: ""
        }
      },
      "Alt. Target": {
        show_alt_target: {
          displayName: "Show Alt. Target Line",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        alt_target: {
          displayName: "Additional Target Value:",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: <number>null
        },
        multiplier_alt_target: {
          displayName: "Apply Multiplier to Alt. Target",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        width_alt_target: {
          displayName: "Line Width",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1.5,
          options: { minValue: { value: 0 }, maxValue: { value: 100 } }
        },
        type_alt_target: {
          displayName: "Line Type",
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "10 0",
          valid: ["10 0", "10 10", "2 5"],
          items: [
            { displayName : "Solid",  value : "10 0" },
            { displayName : "Dashed", value : "10 10" },
            { displayName : "Dotted", value : "2 5" }
          ]
        },
        colour_alt_target: {
          displayName: "Line Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        opacity_alt_target: {
          displayName: "Default Opacity",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          options: { minValue: { value: 0 }, maxValue: { value: 1 } }
        },
        opacity_unselected_alt_target: {
          displayName: "Opacity if Any Selected",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 0.2,
          options: { minValue: { value: 0 }, maxValue: { value: 1 } }
        },
        join_rebaselines_alt_target: {
          displayName: "Connect Rebaselined Limits",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        ttip_show_alt_target: {
          displayName: "Show value in tooltip",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        ttip_label_alt_target: {
          displayName: "Tooltip Label",
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: "Alt. Target"
        },
        plot_label_show_alt_target: {
          displayName: "Show Value on Plot",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        plot_label_show_all_alt_target: {
          displayName: "Show Value at all Re-Baselines",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        plot_label_show_n_alt_target: {
          displayName: "Show Value at Last N Re-Baselines",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          options: { minValue: { value: 1 } }
        },
        plot_label_position_alt_target: {
          displayName: "Position of Value on Line(s)",
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "beside",
          valid: ["above", "below", "beside"],
          items: [
            { displayName : "Above",      value : "above" },
            { displayName : "Below",      value : "below" },
            { displayName : "Beside",     value : "beside" }
          ]
        },
        plot_label_vpad_alt_target: {
          displayName: "Value Vertical Padding",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 0
        },
        plot_label_hpad_alt_target: {
          displayName: "Value Horizontal Padding",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 10
        },
        plot_label_font_alt_target: {
          displayName: "Value Font",
          type: powerbi.visuals.FormattingComponent.FontPicker,
          default: textOptions.font.default,
          valid: textOptions.font.valid
        },
        plot_label_size_alt_target: {
          displayName: "Value Font Size",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: textOptions.size.default,
          options: textOptions.size.options
        },
        plot_label_colour_alt_target: {
          displayName: "Value Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        plot_label_prefix_alt_target: {
          displayName: "Value Prefix",
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: ""
        }
      },
      "68% Limits": {
        show_68: {
          displayName: "Show 68% Lines",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        width_68: {
          displayName: "Line Width",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 2,
          options: { minValue: { value: 0 }, maxValue: { value: 100 } }
        },
        type_68: {
          displayName: "Line Type",
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "2 5",
          valid: ["10 0", "10 10", "2 5"],
          items: [
            { displayName : "Solid",  value : "10 0" },
            { displayName : "Dashed", value : "10 10" },
            { displayName : "Dotted", value : "2 5" }
          ]
        },
        colour_68: {
          displayName: "Line Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.limits
        },
        opacity_68: {
          displayName: "Default Opacity",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          options: { minValue: { value: 0 }, maxValue: { value: 1 } }
        },
        opacity_unselected_68: {
          displayName: "Opacity if Any Selected",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 0.2,
          options: { minValue: { value: 0 }, maxValue: { value: 1 } }
        },
        join_rebaselines_68: {
          displayName: "Connect Rebaselined Limits",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        ttip_show_68: {
          displayName: "Show value in tooltip",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        ttip_label_68: {
          displayName: "Tooltip Label",
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: "68% Limit"
        },
        ttip_label_68_prefix_lower: {
          displayName: "Tooltip Label - Lower Prefix",
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: "Lower "
        },
        ttip_label_68_prefix_upper: {
          displayName: "Tooltip Label - Upper Prefix",
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: "Upper "
        },
        plot_label_show_68: {
          displayName: "Show Value on Plot",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        plot_label_show_all_68: {
          displayName: "Show Value at all Re-Baselines",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        plot_label_show_n_68: {
          displayName: "Show Value at Last N Re-Baselines",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          options: { minValue: { value: 1 } }
        },
        plot_label_position_68: {
          displayName: "Position of Value on Line(s)",
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "beside",
          valid: ["outside", "inside", "above", "below", "beside"],
          items: [
            { displayName : "Outside",    value : "outside" },
            { displayName : "Inside",     value : "inside" },
            { displayName : "Above",      value : "above" },
            { displayName : "Below",      value : "below" },
            { displayName : "Beside",     value : "beside" }
          ]
        },
        plot_label_vpad_68: {
          displayName: "Value Vertical Padding",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 0
        },
        plot_label_hpad_68: {
          displayName: "Value Horizontal Padding",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 10
        },
        plot_label_font_68: {
          displayName: "Value Font",
          type: powerbi.visuals.FormattingComponent.FontPicker,
          default: textOptions.font.default,
          valid: textOptions.font.valid
        },
        plot_label_size_68: {
          displayName: "Value Font Size",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: textOptions.size.default,
          options: textOptions.size.options
        },
        plot_label_colour_68: {
          displayName: "Value Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        plot_label_prefix_68: {
          displayName: "Value Prefix",
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: ""
        }
      },
      "95% Limits": {
        show_95: {
          displayName: "Show 95% Lines",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        width_95: {
          displayName: "Line Width",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 2,
          options: { minValue: { value: 0 }, maxValue: { value: 100 } }
        },
        type_95: {
          displayName: "Line Type",
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "2 5",
          valid: ["10 0", "10 10", "2 5"],
          items: [
            { displayName : "Solid",  value : "10 0" },
            { displayName : "Dashed", value : "10 10" },
            { displayName : "Dotted", value : "2 5" }
          ]
        },
        colour_95: {
          displayName: "Line Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.limits
        },
        opacity_95: {
          displayName: "Default Opacity",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          options: { minValue: { value: 0 }, maxValue: { value: 1 } }
        },
        opacity_unselected_95: {
          displayName: "Opacity if Any Selected",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 0.2,
          options: { minValue: { value: 0 }, maxValue: { value: 1 } }
        },
        join_rebaselines_95: {
          displayName: "Connect Rebaselined Limits",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        ttip_show_95: {
          displayName: "Show value in tooltip",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        ttip_label_95: {
          displayName: "Tooltip Label",
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: "95% Limit"
        },
        ttip_label_95_prefix_lower: {
          displayName: "Tooltip Label - Lower Prefix",
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: "Lower "
        },
        ttip_label_95_prefix_upper: {
          displayName: "Tooltip Label - Upper Prefix",
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: "Upper "
        },
        plot_label_show_95: {
          displayName: "Show Value on Plot",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        plot_label_show_all_95: {
          displayName: "Show Value at all Re-Baselines",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        plot_label_show_n_95: {
          displayName: "Show Value at Last N Re-Baselines",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          options: { minValue: { value: 1 } }
        },
        plot_label_position_95: {
          displayName: "Position of Value on Line(s)",
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "beside",
          valid: ["outside", "inside", "above", "below", "beside"],
          items: [
            { displayName : "Outside",    value : "outside" },
            { displayName : "Inside",     value : "inside" },
            { displayName : "Above",      value : "above" },
            { displayName : "Below",      value : "below" },
            { displayName : "Beside",     value : "beside" }
          ]
        },
        plot_label_vpad_95: {
          displayName: "Value Vertical Padding",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 0
        },
        plot_label_hpad_95: {
          displayName: "Value Horizontal Padding",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 10
        },
        plot_label_font_95: {
          displayName: "Value Font",
          type: powerbi.visuals.FormattingComponent.FontPicker,
          default: textOptions.font.default,
          valid: textOptions.font.valid
        },
        plot_label_size_95: {
          displayName: "Value Font Size",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: textOptions.size.default,
          options: textOptions.size.options
        },
        plot_label_colour_95: {
          displayName: "Value Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        plot_label_prefix_95: {
          displayName: "Value Prefix",
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: ""
        }
      },
      "99% Limits": {
        show_99: {
          displayName: "Show 99% Lines",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        width_99: {
          displayName: "Line Width",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 2,
          options: { minValue: { value: 0 }, maxValue: { value: 100 } }
        },
        type_99: {
          displayName: "Line Type",
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "10 10",
          valid: ["10 0", "10 10", "2 5"],
          items: [
            { displayName : "Solid",  value : "10 0" },
            { displayName : "Dashed", value : "10 10" },
            { displayName : "Dotted", value : "2 5" }
          ]
        },
        colour_99: {
          displayName: "Line Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.limits
        },
        opacity_99: {
          displayName: "Default Opacity",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          options: { minValue: { value: 0 }, maxValue: { value: 1 } }
        },
        opacity_unselected_99: {
          displayName: "Opacity if Any Selected",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 0.2,
          options: { minValue: { value: 0 }, maxValue: { value: 1 } }
        },
        join_rebaselines_99: {
          displayName: "Connect Rebaselined Limits",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        ttip_show_99: {
          displayName: "Show value in tooltip",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        ttip_label_99: {
          displayName: "Tooltip Label",
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: "99% Limit"
        },
        ttip_label_99_prefix_lower: {
          displayName: "Tooltip Label - Lower Prefix",
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: "Lower "
        },
        ttip_label_99_prefix_upper: {
          displayName: "Tooltip Label - Upper Prefix",
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: "Upper "
        },
        plot_label_show_99: {
          displayName: "Show Value on Plot",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        plot_label_show_all_99: {
          displayName: "Show Value at all Re-Baselines",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        plot_label_show_n_99: {
          displayName: "Show Value at Last N Re-Baselines",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          options: { minValue: { value: 1 } }
        },
        plot_label_position_99: {
          displayName: "Position of Value on Line(s)",
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "beside",
          valid: ["outside", "inside", "above", "below", "beside"],
          items: [
            { displayName : "Outside",    value : "outside" },
            { displayName : "Inside",     value : "inside" },
            { displayName : "Above",      value : "above" },
            { displayName : "Below",      value : "below" },
            { displayName : "Beside",     value : "beside" }
          ]
        },
        plot_label_vpad_99: {
          displayName: "Value Vertical Padding",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 0
        },
        plot_label_hpad_99: {
          displayName: "Value Horizontal Padding",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 10
        },
        plot_label_font_99: {
          displayName: "Value Font",
          type: powerbi.visuals.FormattingComponent.FontPicker,
          default: textOptions.font.default,
          valid: textOptions.font.valid
        },
        plot_label_size_99: {
          displayName: "Value Font Size",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: textOptions.size.default,
          options: textOptions.size.options
        },
        plot_label_colour_99: {
          displayName: "Value Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        plot_label_prefix_99: {
          displayName: "Value Prefix",
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: ""
        }
      },
      "Specification Limits": {
        show_specification: {
          displayName: "Show Specification Lines",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        specification_upper: {
          displayName: "Upper Specification Limit:",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: <number>null
        },
        specification_lower: {
          displayName: "Lower Specification Limit:",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: <number>null
        },
        multiplier_specification: {
          displayName: "Apply Multiplier to Specification Limits",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        width_specification: {
          displayName: "Line Width",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 2,
          options: { minValue: { value: 0 }, maxValue: { value: 100 } }
        },
        type_specification: {
          displayName: "Line Type",
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "10 10",
          valid: ["10 0", "10 10", "2 5"],
          items: [
            { displayName : "Solid",  value : "10 0" },
            { displayName : "Dashed", value : "10 10" },
            { displayName : "Dotted", value : "2 5" }
          ]
        },
        colour_specification: {
          displayName: "Line Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.limits
        },
        opacity_specification: {
          displayName: "Default Opacity",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          options: { minValue: { value: 0 }, maxValue: { value: 1 } }
        },
        opacity_unselected_specification: {
          displayName: "Opacity if Any Selected",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 0.2,
          options: { minValue: { value: 0 }, maxValue: { value: 1 } }
        },
        join_rebaselines_specification: {
          displayName: "Connect Rebaselined Limits",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        ttip_show_specification: {
          displayName: "Show value in tooltip",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        ttip_label_specification: {
          displayName: "Tooltip Label",
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: "specification Limit"
        },
        ttip_label_specification_prefix_lower: {
          displayName: "Tooltip Label - Lower Prefix",
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: "Lower "
        },
        ttip_label_specification_prefix_upper: {
          displayName: "Tooltip Label - Upper Prefix",
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: "Upper "
        },
        plot_label_show_specification: {
          displayName: "Show Value on Plot",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        plot_label_show_all_specification: {
          displayName: "Show Value at all Re-Baselines",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        plot_label_show_n_specification: {
          displayName: "Show Value at Last N Re-Baselines",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          options: { minValue: { value: 1 } }
        },
        plot_label_position_specification: {
          displayName: "Position of Value on Line(s)",
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "beside",
          valid: ["outside", "inside", "above", "below", "beside"],
          items: [
            { displayName : "Outside",    value : "outside" },
            { displayName : "Inside",     value : "inside" },
            { displayName : "Above",      value : "above" },
            { displayName : "Below",      value : "below" },
            { displayName : "Beside",     value : "beside" }
          ]
        },
        plot_label_vpad_specification: {
          displayName: "Value Vertical Padding",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 0
        },
        plot_label_hpad_specification: {
          displayName: "Value Horizontal Padding",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 10
        },
        plot_label_font_specification: {
          displayName: "Value Font",
          type: powerbi.visuals.FormattingComponent.FontPicker,
          default: textOptions.font.default,
          valid: textOptions.font.valid
        },
        plot_label_size_specification: {
          displayName: "Value Font Size",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: textOptions.size.default,
          options: textOptions.size.options
        },
        plot_label_colour_specification: {
          displayName: "Value Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        plot_label_prefix_specification: {
          displayName: "Value Prefix",
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: ""
        }
      }
    }
  },
  x_axis: {
    description: "X Axis Settings",
    displayName: "X Axis Settings",
    settingsGroups: {
      "Axis": {
        xlimit_colour: {
          displayName: "Axis Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        xlimit_l: {
          displayName: "Lower Limit",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default:<number>null
        },
        xlimit_u: {
          displayName: "Upper Limit",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default:<number>null
        }
      },
      "Ticks": {
        xlimit_ticks: {
          displayName: "Draw Ticks",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        xlimit_tick_count: {
          displayName: "Maximum Ticks",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 10,
          options: { minValue: { value: 0 }, maxValue: { value: 100 } }
        },
        xlimit_tick_font: {
          displayName: "Tick Font",
          type: powerbi.visuals.FormattingComponent.FontPicker,
          default: textOptions.font.default,
          valid: textOptions.font.valid
        },
        xlimit_tick_size: {
          displayName: "Tick Font Size",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: textOptions.size.default,
          options: textOptions.size.options
        },
        xlimit_tick_colour: {
          displayName: "Tick Font Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        xlimit_tick_rotation: {
          displayName: "Tick Rotation (Degrees)",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: -35,
          options: { minValue: { value: -360 }, maxValue: { value: 360 } }
        }
      },
      "Label": {
        xlimit_label: {
          displayName: "Label",
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: <string>null
        },
        xlimit_label_font: {
          displayName: "Label Font",
          type: powerbi.visuals.FormattingComponent.FontPicker,
          default: textOptions.font.default,
          valid: textOptions.font.valid
        },
        xlimit_label_size: {
          displayName: "Label Font Size",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: textOptions.size.default,
          options: textOptions.size.options
        },
        xlimit_label_colour: {
          displayName: "Label Font Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
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
        ylimit_colour: {
          displayName: "Axis Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        limit_multiplier: {
          displayName: "Axis Scaling Factor",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1.5,
          options: { minValue: { value: 0 } }
        },
        ylimit_sig_figs: {
          displayName: "Tick Decimal Places",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default:<number>null
        },
        ylimit_l: {
          displayName: "Lower Limit",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default:<number>null
        },
        ylimit_u: {
          displayName: "Upper Limit",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default:<number>null
        }
      },
      "Ticks": {
        ylimit_ticks: {
          displayName: "Draw Ticks",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        ylimit_tick_count: {
          displayName: "Maximum Ticks",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 10,
          options: { minValue: { value: 0 }, maxValue: { value: 100 } }
        },
        ylimit_tick_font: {
          displayName: "Tick Font",
          type: powerbi.visuals.FormattingComponent.FontPicker,
          default: textOptions.font.default,
          valid: textOptions.font.valid
        },
        ylimit_tick_size: {
          displayName: "Tick Font Size",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: textOptions.size.default,
          options: textOptions.size.options
        },
        ylimit_tick_colour: {
          displayName: "Tick Font Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        ylimit_tick_rotation: {
          displayName: "Tick Rotation (Degrees)",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: -35,
          options: { minValue: { value: -360 }, maxValue: { value: 360 } }
        }
      },
      "Label": {
        ylimit_label: {
          displayName: "Label",
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: <string>null
        },
        ylimit_label_font: {
          displayName: "Label Font",
          type: powerbi.visuals.FormattingComponent.FontPicker,
          default: textOptions.font.default,
          valid: textOptions.font.valid
        },
        ylimit_label_size: {
          displayName: "Label Font Size",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: textOptions.size.default,
          options: textOptions.size.options
        },
        ylimit_label_colour: {
          displayName: "Label Font Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
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
          type: powerbi.visuals.FormattingComponent.Dropdown,
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
          type: powerbi.visuals.FormattingComponent.Dropdown,
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
          type: powerbi.visuals.FormattingComponent.Dropdown,
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
          type: powerbi.visuals.FormattingComponent.Dropdown,
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
          type: powerbi.visuals.FormattingComponent.Dropdown,
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
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        table_variation_filter: {
          displayName: "Filter by Variation Type",
          type: powerbi.visuals.FormattingComponent.Dropdown,
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
          type: powerbi.visuals.FormattingComponent.Dropdown,
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
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: textOptions.text_overflow.default,
          valid: textOptions.text_overflow.valid,
          items: [
            { displayName : "Ellipsis", value : "ellipsis" },
            { displayName : "Truncate",     value : "clip" },
            { displayName : "None",     value : "none" }
          ]
        },
        table_opacity: {
          displayName: "Default Opacity",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          options: { minValue: { value: 0 }, maxValue: { value: 1 } }
        },
        table_opacity_selected: {
          displayName: "Opacity if Selected",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          options: { minValue: { value: 0 }, maxValue: { value: 1 } }
        },
        table_opacity_unselected: {
          displayName: "Opacity if Unselected",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 0.2,
          options: { minValue: { value: 0 }, maxValue: { value: 1 } }
        },
        table_outer_border_style: {
          displayName: "Outer Border Style",
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: borderOptions.style.default,
          valid: borderOptions.style.valid,
          items: [
            { displayName : "Solid",  value : "solid" },
            { displayName : "Dashed", value : "dashed" },
            { displayName : "Dotted", value : "dotted" },
            { displayName : "Double", value : "double" },
            { displayName : "Groove", value : "groove" },
            { displayName : "Ridge",  value : "ridge" },
            { displayName : "Inset",  value : "inset" },
            { displayName : "Outset", value : "outset" }
          ]
        },
        table_outer_border_width: {
          displayName: "Outer Border Width",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: borderOptions.width.default,
          options: borderOptions.width.options
        },
        table_outer_border_colour: {
          displayName: "Outer Border Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: borderOptions.colour.default,
        },
        table_outer_border_top: {
          displayName: "Outer Border Top",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        table_outer_border_bottom: {
          displayName: "Outer Border Bottom",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        table_outer_border_left: {
          displayName: "Outer Border Left",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        table_outer_border_right: {
          displayName: "Outer Border Right",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        }
      },
      "Header": {
        table_header_font: {
          displayName: "Header Font",
          type: powerbi.visuals.FormattingComponent.FontPicker,
          default: textOptions.font.default,
          valid: textOptions.font.valid
        },
        table_header_size: {
          displayName: "Header Font Size",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: textOptions.size.default,
          options: textOptions.size.options
        },
        table_header_text_align: {
          displayName: "Text Alignment",
          type: powerbi.visuals.FormattingComponent.AlignmentGroup,
          default: textOptions.text_align.default,
          valid: textOptions.text_align.valid
        },
        table_header_font_weight: {
          displayName: "Header Font Weight",
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: textOptions.weight.default,
          valid: textOptions.weight.valid,
          items: [
            { displayName : "Normal", value : "normal" },
            { displayName : "Bold",   value : "bold" }
          ]
        },
        table_header_text_transform: {
          displayName: "Header Text Transform",
          type: powerbi.visuals.FormattingComponent.Dropdown,
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
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          options: { minValue: { value: 0 }, maxValue: { value: 100 } }
        },
        table_header_colour: {
          displayName: "Header Font Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        table_header_bg_colour: {
          displayName: "Header Background Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: "#D3D3D3"
        },
        table_header_border_style: {
          displayName: "Header Border Style",
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: borderOptions.style.default,
          valid: borderOptions.style.valid,
          items: [
            { displayName : "Solid",  value : "solid" },
            { displayName : "Dashed", value : "dashed" },
            { displayName : "Dotted", value : "dotted" },
            { displayName : "Double", value : "double" },
            { displayName : "Groove", value : "groove" },
            { displayName : "Ridge",  value : "ridge" },
            { displayName : "Inset",  value : "inset" },
            { displayName : "Outset", value : "outset" }
          ]
        },
        table_header_border_width: {
          displayName: "Header Border Width",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: borderOptions.width.default,
          options: borderOptions.width.options
        },
        table_header_border_colour: {
          displayName: "Header Border Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: borderOptions.colour.default,
        },
        table_header_border_bottom: {
          displayName: "Bottom Border",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        table_header_border_inner: {
          displayName: "Inner Borders",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        }
      },
      "Body": {
        table_body_font: {
          displayName: "Body Font",
          type: powerbi.visuals.FormattingComponent.FontPicker,
          default: textOptions.font.default,
          valid: textOptions.font.valid
        },
        table_body_size: {
          displayName: "Body Font Size",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: textOptions.size.default,
          options: textOptions.size.options
        },
        table_body_text_align: {
          displayName: "Text Alignment",
          type: powerbi.visuals.FormattingComponent.AlignmentGroup,
          default: textOptions.text_align.default,
          valid: textOptions.text_align.valid
        },
        table_body_font_weight: {
          displayName: "Font Weight",
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: textOptions.weight.default,
          valid: textOptions.weight.valid,
          items: [
            { displayName : "Normal", value : "normal" },
            { displayName : "Bold",   value : "bold" }
          ]
        },
        table_body_text_transform: {
          displayName: "Text Transform",
          type: powerbi.visuals.FormattingComponent.Dropdown,
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
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          options: { minValue: { value: 0 }, maxValue: { value: 100 } }
        },
        table_body_colour: {
          displayName: "Body Font Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        table_body_bg_colour: {
          displayName: "Body Background Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: "#FFFFFF"
        },
        table_body_border_style: {
          displayName: "Body Border Style",
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: borderOptions.style.default,
          valid: borderOptions.style.valid,
          items: [
            { displayName : "Solid",  value : "solid" },
            { displayName : "Dashed", value : "dashed" },
            { displayName : "Dotted", value : "dotted" },
            { displayName : "Double", value : "double" },
            { displayName : "Groove", value : "groove" },
            { displayName : "Ridge",  value : "ridge" },
            { displayName : "Inset",  value : "inset" },
            { displayName : "Outset", value : "outset" }
          ]
        },
        table_body_border_width: {
          displayName: "Body Border Width",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: borderOptions.width.default,
          options: borderOptions.width.options
        },
        table_body_border_colour: {
          displayName: "Body Border Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: borderOptions.colour.default,
        },
        table_body_border_top_bottom: {
          displayName: "Top/Bottom Borders",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        table_body_border_left_right: {
          displayName: "Left/Right Borders",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
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
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
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
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        label_position: {
          displayName: "Label Position",
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "top",
          valid: ["top", "bottom"],
          items: [
            { displayName : "Top",    value : "top" },
            { displayName : "Bottom", value : "bottom" }
          ]
        },
        label_y_offset: {
          displayName: "Label Offset from Top/Bottom (px)",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 20
        },
        label_line_offset: {
          displayName: "Label Offset from Connecting Line (px)",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 5
        },
        label_angle_offset: {
          displayName: "Label Angle Offset (degrees)",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 0,
          options: { minValue: { value: -90 }, maxValue: { value: 90 } }
        },
        label_font: {
          displayName: "Label Font",
          type: powerbi.visuals.FormattingComponent.FontPicker,
          default: textOptions.font.default,
          valid: textOptions.font.valid
        },
        label_size: {
          displayName: "Label Font Size",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: textOptions.size.default,
          options: textOptions.size.options
        },
        label_colour: {
          displayName: "Label Font Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        label_line_colour: {
          displayName: "Connecting Line Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        label_line_width: {
          displayName: "Connecting Line Width",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          options: { minValue: { value: 0 }, maxValue: { value: 100 } }
        },
        label_line_type: {
          displayName: "Connecting Line Type",
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "10 0",
          valid: ["10 0", "10 10", "2 5"],
          items: [
            { displayName : "Solid",  value : "10 0" },
            { displayName : "Dashed", value : "10 10" },
            { displayName : "Dotted", value : "2 5" }
          ]
        },
        label_line_max_length: {
          displayName: "Max Connecting Line Length (px)",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1000,
          options: { minValue: { value: 0 }, maxValue: { value: 10000 } }
        },
        label_marker_show: {
          displayName: "Show Line Markers",
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        label_marker_offset: {
          displayName: "Marker Offset from Value (px)",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 5
        },
        label_marker_size: {
          displayName: "Marker Size",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 3,
          options: { minValue: { value: 0 }, maxValue: { value: 100 } }
        },
        label_marker_colour: {
          displayName: "Marker Fill Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        label_marker_outline_colour: {
          displayName: "Marker Outline Colour",
          type: powerbi.visuals.FormattingComponent.ColorPicker,
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
