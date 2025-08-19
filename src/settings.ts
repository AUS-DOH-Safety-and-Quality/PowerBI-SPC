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
    valid: { numberRange: { min: 0, max: 100 } }
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
    valid: { numberRange: { min: 0 } }
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
    settingGroups: {
      "all": {
        chart_type: {
          displayName: "Chart Type",
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "i",
          valid: ["run", "i", "i_m", "i_mm", "mr", "p", "pp", "u", "up", "c", "xbar", "s", "g", "t"]
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
          valid: { numberRange: { min: 0 } }
        },
        sig_figs: {
          displayName: "Decimals to Report:",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 2,
          valid: { numberRange: { min: 0, max: 20 } }
        },
        perc_labels: {
          displayName: "Report as percentage",
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "Automatic",
          valid: ["Automatic", "Yes", "No"]
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
          valid: ["Start", "End"]
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
          valid: ["both", "improvement", "deterioration"]
        },
        improvement_direction: {
          displayName: "Improvement Direction",
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "increase",
          valid: ["increase", "neutral", "decrease"]
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
          valid: ["1 Sigma", "2 Sigma", "3 Sigma", "Specification"]
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
          valid: { numberRange: { min: 1 } }
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
          valid: { numberRange: { min: 1 } }
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
          valid: ["1 Sigma", "2 Sigma", "3 Sigma", "Specification"]
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
          valid: ["Top Right", "Bottom Right", "Top Left", "Bottom Left"]
        },
        variation_icons_scaling: {
          displayName: "Scale Variation Icon Size",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          valid: { numberRange: { min: 0 } }
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
          valid: ["Top Right", "Bottom Right", "Top Left", "Bottom Left"]
        },
        assurance_icons_scaling: {
          displayName: "Scale Assurance Icon Size",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          valid: { numberRange: { min: 0 } }
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
          valid: ["Circle", "Cross", "Diamond", "Square", "Star", "Triangle", "Wye"]
        },
        size: {
          displayName: "Size",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 2.5,
          valid: { numberRange: { min: 0, max: 100 }}
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
          valid: { numberRange: { min: 0, max: 100 } }
        },
        opacity: {
          displayName: "Default Opacity",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          valid: { numberRange: { min: 0, max: 1 } }
        },
        opacity_selected: {
          displayName: "Opacity if Selected",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          valid: { numberRange: { min: 0, max: 1 } }
        },
        opacity_unselected: {
          displayName: "Opacity if Unselected",
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 0.2,
          valid: { numberRange: { min: 0, max: 1 } }
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
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        width_main: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          valid: { numberRange: { min: 0, max: 100 } }
        },
        type_main: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "10 0",
          valid: ["10 0", "10 10", "2 5"]
        },
        colour_main: {
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.common_cause
        },
        opacity_main: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          valid: { numberRange: { min: 0, max: 1 } }
        },
        opacity_unselected_main: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 0.2,
          valid: { numberRange: { min: 0, max: 1 } }
        },
        join_rebaselines_main: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        plot_label_show_main: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        plot_label_show_all_main: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        plot_label_show_n_main: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          valid: { numberRange: { min: 1 } }
        },
        plot_label_position_main: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "beside",
          valid: ["above", "below", "beside"]
        },
        plot_label_vpad_main: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 0
        },
        plot_label_hpad_main: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 10
        },
        plot_label_font_main: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: textOptions.font.default,
          valid: textOptions.font.valid
        },
        plot_label_size_main: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: textOptions.size.default,
          valid: textOptions.size.valid
        },
        plot_label_colour_main: {
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        plot_label_prefix_main: {
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: ""
        }
      },
      "Target": {
        show_target: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        width_target: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1.5,
          valid: { numberRange: { min: 0, max: 100 } }
        },
        type_target: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "10 0",
          valid: ["10 0", "10 10", "2 5"]
        },
        colour_target: {
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        opacity_target: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          valid: { numberRange: { min: 0, max: 1 } }
        },
        opacity_unselected_target: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 0.2,
          valid: { numberRange: { min: 0, max: 1 } }
        },
        join_rebaselines_target: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        ttip_show_target: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        ttip_label_target: {
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: "Centerline"
        },
        plot_label_show_target: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        plot_label_show_all_target: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        plot_label_show_n_target: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          valid: { numberRange: { min: 1 } }
        },
        plot_label_position_target: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "beside",
          valid: ["above", "below", "beside"]
        },
        plot_label_vpad_target: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 0
        },
        plot_label_hpad_target: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 10
        },
        plot_label_font_target: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: textOptions.font.default,
          valid: textOptions.font.valid
        },
        plot_label_size_target: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: textOptions.size.default,
          valid: textOptions.size.valid
        },
        plot_label_colour_target: {
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        plot_label_prefix_target: {
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: ""
        }
      },
      "Alt. Target": {
        show_alt_target: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        alt_target: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: <number>null
        },
        multiplier_alt_target: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        width_alt_target: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1.5,
          valid: { numberRange: { min: 0, max: 100 } }
        },
        type_alt_target: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "10 0",
          valid: ["10 0", "10 10", "2 5"]
        },
        colour_alt_target: {
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        opacity_alt_target: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          valid: { numberRange: { min: 0, max: 1 } }
        },
        opacity_unselected_alt_target: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 0.2,
          valid: { numberRange: { min: 0, max: 1 } }
        },
        join_rebaselines_alt_target: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        ttip_show_alt_target: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        ttip_label_alt_target: {
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: "Alt. Target"
        },
        plot_label_show_alt_target: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        plot_label_show_all_alt_target: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        plot_label_show_n_alt_target: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          valid: { numberRange: { min: 1 } }
        },
        plot_label_position_alt_target: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "beside",
          valid: ["above", "below", "beside"]
        },
        plot_label_vpad_alt_target: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 0
        },
        plot_label_hpad_alt_target: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 10
        },
        plot_label_font_alt_target: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: textOptions.font.default,
          valid: textOptions.font.valid
        },
        plot_label_size_alt_target: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: textOptions.size.default,
          valid: textOptions.size.valid
        },
        plot_label_colour_alt_target: {
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        plot_label_prefix_alt_target: {
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: ""
        }
      },
      "68% Limits": {
        show_68: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        width_68: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 2,
          valid: { numberRange: { min: 0, max: 100 } }
        },
        type_68: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "2 5",
          valid: ["10 0", "10 10", "2 5"]
        },
        colour_68: {
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.limits
        },
        opacity_68: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          valid: { numberRange: { min: 0, max: 1 } }
        },
        opacity_unselected_68: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 0.2,
          valid: { numberRange: { min: 0, max: 1 } }
        },
        join_rebaselines_68: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        ttip_show_68: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        ttip_label_68: {
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: "68% Limit"
        },
        ttip_label_68_prefix_lower: {
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: "Lower "
        },
        ttip_label_68_prefix_upper: {
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: "Upper "
        },
        plot_label_show_68: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        plot_label_show_all_68: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        plot_label_show_n_68: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          valid: { numberRange: { min: 1 } }
        },
        plot_label_position_68: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "beside",
          valid: ["outside", "inside", "above", "below", "beside"]
        },
        plot_label_vpad_68: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 0
        },
        plot_label_hpad_68: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 10
        },
        plot_label_font_68: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: textOptions.font.default,
          valid: textOptions.font.valid
        },
        plot_label_size_68: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: textOptions.size.default,
          valid: textOptions.size.valid
        },
        plot_label_colour_68: {
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        plot_label_prefix_68: {
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: ""
        }
      },
      "95% Limits": {
        show_95: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        width_95: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 2,
          valid: { numberRange: { min: 0, max: 100 } }
        },
        type_95: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "2 5",
          valid: ["10 0", "10 10", "2 5"]
        },
        colour_95: {
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.limits
        },
        opacity_95: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          valid: { numberRange: { min: 0, max: 1 } }
        },
        opacity_unselected_95: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 0.2,
          valid: { numberRange: { min: 0, max: 1 } }
        },
        join_rebaselines_95: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        ttip_show_95: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        ttip_label_95: {
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: "95% Limit"
        },
        ttip_label_95_prefix_lower: {
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: "Lower "
        },
        ttip_label_95_prefix_upper: {
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: "Upper "
        },
        plot_label_show_95: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        plot_label_show_all_95: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        plot_label_show_n_95: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          valid: { numberRange: { min: 1 } }
        },
        plot_label_position_95: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "beside",
          valid: ["outside", "inside", "above", "below", "beside"]
        },
        plot_label_vpad_95: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 0
        },
        plot_label_hpad_95: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 10
        },
        plot_label_font_95: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: textOptions.font.default,
          valid: textOptions.font.valid
        },
        plot_label_size_95: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: textOptions.size.default,
          valid: textOptions.size.valid
        },
        plot_label_colour_95: {
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        plot_label_prefix_95: {
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: ""
        }
      },
      "99% Limits": {
        show_99: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        width_99: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 2,
          valid: { numberRange: { min: 0, max: 100 } }
        },
        type_99: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "2 5",
          valid: ["10 0", "10 10", "2 5"]
        },
        colour_99: {
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.limits
        },
        opacity_99: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          valid: { numberRange: { min: 0, max: 1 } }
        },
        opacity_unselected_99: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 0.2,
          valid: { numberRange: { min: 0, max: 1 } }
        },
        join_rebaselines_99: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        ttip_show_99: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        ttip_label_99: {
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: "99% Limit"
        },
        ttip_label_99_prefix_lower: {
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: "Lower "
        },
        ttip_label_99_prefix_upper: {
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: "Upper "
        },
        plot_label_show_99: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        plot_label_show_all_99: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        plot_label_show_n_99: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          valid: { numberRange: { min: 1 } }
        },
        plot_label_position_99: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "beside",
          valid: ["outside", "inside", "above", "below", "beside"]
        },
        plot_label_vpad_99: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 0
        },
        plot_label_hpad_99: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 10
        },
        plot_label_font_99: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: textOptions.font.default,
          valid: textOptions.font.valid
        },
        plot_label_size_99: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: textOptions.size.default,
          valid: textOptions.size.valid
        },
        plot_label_colour_99: {
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        plot_label_prefix_99: {
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: ""
        }
      },
      "Specification Limits": {
        show_specification: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        width_specification: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 2,
          valid: { numberRange: { min: 0, max: 100 } }
        },
        type_specification: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "10 10",
          valid: ["10 0", "10 10", "2 5"]
        },
        colour_specification: {
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.limits
        },
        opacity_specification: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          valid: { numberRange: { min: 0, max: 1 } }
        },
        opacity_unselected_specification: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 0.2,
          valid: { numberRange: { min: 0, max: 1 } }
        },
        join_rebaselines_specification: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        ttip_show_specification: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        ttip_label_specification: {
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: "specification Limit"
        },
        ttip_label_specification_prefix_lower: {
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: "Lower "
        },
        ttip_label_specification_prefix_upper: {
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: "Upper "
        },
        plot_label_show_specification: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        plot_label_show_all_specification: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        plot_label_show_n_specification: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          valid: { numberRange: { min: 1 } }
        },
        plot_label_position_specification: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "beside",
          valid: ["outside", "inside", "above", "below", "beside"]
        },
        plot_label_vpad_specification: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 0
        },
        plot_label_hpad_specification: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 10
        },
        plot_label_font_specification: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: textOptions.font.default,
          valid: textOptions.font.valid
        },
        plot_label_size_specification: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: textOptions.size.default,
          valid: textOptions.size.valid
        },
        plot_label_colour_specification: {
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        plot_label_prefix_specification: {
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
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        xlimit_l: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default:<number>null
        },
        xlimit_u: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default:<number>null
        }
      },
      "Ticks": {
        xlimit_ticks: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        xlimit_tick_count: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 10,
          valid: { numberRange: { min: 0, max: 100 }}
        },
        xlimit_tick_font: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: textOptions.font.default,
          valid: textOptions.font.valid
        },
        xlimit_tick_size: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: textOptions.size.default,
          valid: textOptions.size.valid
        },
        xlimit_tick_colour: {
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        xlimit_tick_rotation: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: -35,
          valid: { numberRange: { min: -360, max: 360 }}
        }
      },
      "Label": {
        xlimit_label: {
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: <string>null
        },
        xlimit_label_font: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: textOptions.font.default,
          valid: textOptions.font.valid
        },
        xlimit_label_size: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: textOptions.size.default,
          valid: textOptions.size.valid
        },
        xlimit_label_colour: {
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
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        limit_multiplier: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1.5,
          valid: { numberRange: { min: 0} }
        },
        ylimit_sig_figs: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default:<number>null
        },
        ylimit_l: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default:<number>null
        },
        ylimit_u: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default:<number>null
        }
      },
      "Ticks": {
        ylimit_ticks: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        ylimit_tick_count: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 10,
          valid: { numberRange: { min: 0, max: 100 }}
        },
        ylimit_tick_font: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: textOptions.font.default,
          valid: textOptions.font.valid
        },
        ylimit_tick_size: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: textOptions.size.default,
          valid: textOptions.size.valid
        },
        ylimit_tick_colour: {
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        ylimit_tick_rotation: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: -35,
          valid: { numberRange: { min: -360, max: 360 }}
        }
      },
      "Label": {
        ylimit_label: {
          type: powerbi.visuals.FormattingComponent.TextInput,
          default: <string>null
        },
        ylimit_label_font: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: textOptions.font.default,
          valid: textOptions.font.valid
        },
        ylimit_label_size: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: textOptions.size.default,
          valid: textOptions.size.valid
        },
        ylimit_label_colour: {
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
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "DD",
          valid: ["DD", "Thurs DD", "Thursday DD", "(blank)"]
        },
        date_format_month: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "MM",
          valid: ["MM", "Mon", "Month", "(blank)"]
        },
        date_format_year: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "YYYY",
          valid: ["YYYY", "YY", "(blank)"]
        },
        date_format_delim: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "/",
          valid: ["/", "-", " "]
        },
        date_format_locale: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "en-GB",
          valid: ["en-GB", "en-US"]
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
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: false
        },
        table_variation_filter: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "all",
          valid: ["all", "common", "special", "improvement", "deterioration", "neutral"]
        },
        table_assurance_filter: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "all",
          valid: ["all", "any", "pass", "fail", "inconsistent"]
        },
        table_text_overflow: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: textOptions.text_overflow.default,
          valid: textOptions.text_overflow.valid
        },
        table_opacity: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          valid: { numberRange: { min: 0, max: 1 } }
        },
        table_opacity_selected: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          valid: { numberRange: { min: 0, max: 1 } }
        },
        table_opacity_unselected: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 0.2,
          valid: { numberRange: { min: 0, max: 1 } }
        },
        table_outer_border_style: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: borderOptions.style.default,
          valid: borderOptions.style.valid
        },
        table_outer_border_width: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: borderOptions.width.default,
          valid: borderOptions.width.valid
        },
        table_outer_border_colour: {
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: borderOptions.colour.default,
        },
        table_outer_border_top: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        table_outer_border_bottom: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        table_outer_border_left: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        table_outer_border_right: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        }
      },
      "Header": {
        table_header_font: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: textOptions.font.default,
          valid: textOptions.font.valid
        },
        table_header_size: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: textOptions.size.default,
          valid: textOptions.size.valid
        },
        table_header_text_align: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: textOptions.text_align.default,
          valid: textOptions.text_align.valid
        },
        table_header_font_weight: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: textOptions.weight.default,
          valid: textOptions.weight.valid
        },
        table_header_text_transform: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: textOptions.text_transform.default,
          valid: textOptions.text_transform.valid
        },
        table_header_text_padding: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          valid: { numberRange: { min: 0, max: 100 }}
        },
        table_header_colour: {
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        table_header_bg_colour: {
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: "#D3D3D3"
        },
        table_header_border_style: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: borderOptions.style.default,
          valid: borderOptions.style.valid
        },
        table_header_border_width: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: borderOptions.width.default,
          valid: borderOptions.width.valid
        },
        table_header_border_colour: {
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: borderOptions.colour.default,
        },
        table_header_border_bottom: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        table_header_border_inner: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        }
      },
      "Body": {
        table_body_font: {
          type: powerbi.visuals.FormattingComponent.FontPicker,
          default: textOptions.font.default,
          valid: textOptions.font.valid
        },
        table_body_size: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: textOptions.size.default,
          valid: textOptions.size.valid
        },
        table_body_text_align: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: textOptions.text_align.default,
          valid: textOptions.text_align.valid
        },
        table_body_font_weight: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: textOptions.weight.default,
          valid: textOptions.weight.valid
        },
        table_body_text_transform: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: textOptions.text_transform.default,
          valid: textOptions.text_transform.valid
        },
        table_body_text_padding: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          valid: { numberRange: { min: 0, max: 100 }}
        },
        table_body_colour: {
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        table_body_bg_colour: {
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: "#FFFFFF"
        },
        table_body_border_style: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: borderOptions.style.default,
          valid: borderOptions.style.valid
        },
        table_body_border_width: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: borderOptions.width.default,
          valid: borderOptions.width.valid
        },
        table_body_border_colour: {
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: borderOptions.colour.default,
        },
        table_body_border_top_bottom: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        table_body_border_left_right: {
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
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        label_position: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "top",
          valid: ["top", "bottom"]
        },
        label_y_offset: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 20
        },
        label_line_offset: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 5
        },
        label_angle_offset: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 0,
          valid: { numberRange: { min: -90, max: 90 }}
        },
        label_font: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: textOptions.font.default,
          valid: textOptions.font.valid
        },
        label_size: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: textOptions.size.default,
          valid: textOptions.size.valid
        },
        label_colour: {
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        label_line_colour: {
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        label_line_width: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1,
          valid: { numberRange: { min: 0, max: 100 } }
        },
        label_line_type: {
          type: powerbi.visuals.FormattingComponent.Dropdown,
          default: "10 0",
          valid: ["10 0", "10 10", "2 5"]
        },
        label_line_max_length: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 1000,
          valid: { numberRange: { min: 0, max: 10000 }}
        },
        label_marker_show: {
          type: powerbi.visuals.FormattingComponent.ToggleSwitch,
          default: true
        },
        label_marker_offset: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 5
        },
        label_marker_size: {
          type: powerbi.visuals.FormattingComponent.NumUpDown,
          default: 3,
          valid: { numberRange: { min: 0, max: 100 }}
        },
        label_marker_colour: {
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        },
        label_marker_outline_colour: {
          type: powerbi.visuals.FormattingComponent.ColorPicker,
          default: defaultColours.standard
        }
      }
    }
  }
}

export default settingsModel;
