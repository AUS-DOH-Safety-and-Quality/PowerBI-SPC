// Values returned by each option of PBI's built-in font picker
// TODO(Andrew): Allow user to pass human-readable font names
const validFonts: string[] = [
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
];

// TODO(Andrew): Allow user to pass human-readable names
const validLineTypes: string[] = ["10 0", "10 10", "2 5"];

const defaultSettings = {
  canvas: {
    show_errors: { default: true },
    lower_padding: { default: 10 },
    upper_padding: { default: 10 },
    left_padding: { default: 10 },
    right_padding: { default: 10 }
  },
  spc: {
    chart_type: { default: "i", valid: ["run", "i", "mr", "p", "pp", "u", "up", "c", "xbar", "s", "g", "t"] },
    outliers_in_limits: { default: false },
    multiplier: { default: 1, valid: { numberRange: { min: 0 } } },
    sig_figs: { default: 2, valid: { numberRange: { min: 0, max: 20 } } },
    perc_labels: { default: "Automatic", valid: ["Automatic", "Yes", "No"]},
    split_on_click: { default: false },
    ttip_show_numerator: { default: true },
    ttip_label_numerator: { default: "Numerator"},
    ttip_show_denominator: { default: true },
    ttip_label_denominator: { default: "Denominator"},
    ttip_show_value: { default: true },
    ttip_label_value: { default: "Automatic"},
    ll_truncate: { default: <number>null },
    ul_truncate: { default: <number>null }
  },
  outliers: {
    process_flag_type: { default: "both", valid: ["both", "improvement", "deterioration"]},
    improvement_direction: { default: "increase", valid: ["increase", "neutral", "decrease"]},
    astronomical: { default: false },
    astronomical_limit: { default: "3 Sigma", valid: ["1 Sigma", "2 Sigma", "3 Sigma"]},
    ast_colour_improvement: { default: "#00B0F0" },
    ast_colour_deterioration: { default: "#E46C0A" },
    ast_colour_neutral_low: { default: "#490092" },
    ast_colour_neutral_high: { default: "#490092" },
    shift: { default: false },
    shift_n: { default: 7, valid: { numberRange: { min: 1 } } },
    shift_colour_improvement: { default: "#00B0F0" },
    shift_colour_deterioration: { default: "#E46C0A" },
    shift_colour_neutral_low: { default: "#490092" },
    shift_colour_neutral_high: { default: "#490092" },
    trend: { default: false },
    trend_n: { default: 5, valid: { numberRange: { min: 1 } } },
    trend_colour_improvement: { default: "#00B0F0" },
    trend_colour_deterioration: { default: "#E46C0A" },
    trend_colour_neutral_low: { default: "#490092" },
    trend_colour_neutral_high: { default: "#490092" },
    two_in_three: { default: false },
    two_in_three_highlight_series: { default: false },
    two_in_three_limit: { default: "2 Sigma", valid: ["1 Sigma", "2 Sigma", "3 Sigma"]},
    twointhree_colour_improvement: { default: "#00B0F0" },
    twointhree_colour_deterioration: { default: "#E46C0A" },
    twointhree_colour_neutral_low: { default: "#490092" },
    twointhree_colour_neutral_high: { default: "#490092" }
  },
  nhs_icons: {
    flag_last_point: { default: true },
    show_variation_icons: { default: false },
    variation_icons_locations: { default: "Top Right", valid: ["Top Right", "Bottom Right", "Top Left", "Bottom Left"]},
    variation_icons_scaling: { default: 1, valid: { numberRange: { min: 0} } },
    show_assurance_icons: { default: false },
    assurance_icons_locations: { default: "Top Right", valid: ["Top Right", "Bottom Right", "Top Left", "Bottom Left"]},
    assurance_icons_scaling: { default: 1, valid: { numberRange: { min: 0} } }
  },
  scatter: {
    size: { default: 2.5, valid: { numberRange: { min: 0, max: 100 }}},
    colour: { default: "#000000" },
    opacity: { default: 1, valid: { numberRange: { min: 0, max: 1 } } },
    opacity_unselected: { default: 0.2, valid: { numberRange: { min: 0, max: 1 } } }
  },
  lines: {
    show_99: { default: true },
    show_95: { default: true },
    show_68: { default: false },
    show_main: { default: true },
    show_target: { default: true },
    show_alt_target: { default: false },
    show_specification: { default: false },
    width_99: { default: 2, valid: { numberRange: { min: 0, max: 100 }}},
    width_95: { default: 2, valid: { numberRange: { min: 0, max: 100 }}},
    width_68: { default: 2, valid: { numberRange: { min: 0, max: 100 }}},
    width_main: { default: 1, valid: { numberRange: { min: 0, max: 100 }}},
    width_target: { default: 1.5, valid: { numberRange: { min: 0, max: 100 }}},
    width_alt_target: { default: 1.5, valid: { numberRange: { min: 0, max: 100 }}},
    width_specification: { default: 2, valid: { numberRange: { min: 0, max: 100 }}},
    type_99: { default: "10 10", valid: validLineTypes},
    type_95: { default: "2 5", valid: validLineTypes},
    type_68: { default: "2 5", valid: validLineTypes},
    type_main: { default: "10 0", valid: validLineTypes},
    type_target: { default: "10 0", valid: validLineTypes},
    type_alt_target: { default: "10 0", valid: validLineTypes},
    type_specification: { default: "10 10", valid: validLineTypes},
    colour_99: { default: "#6495ED" },
    colour_95: { default: "#6495ED" },
    colour_68: { default: "#6495ED" },
    colour_main: { default: "#000000" },
    colour_target: { default: "#000000" },
    colour_alt_target: { default: "#000000" },
    colour_specification: { default: "#6495ED" },
    ttip_show_99: { default: true },
    ttip_show_95: { default: false },
    ttip_show_68: { default: false },
    ttip_show_target: { default: true },
    ttip_show_alt_target: { default: true },
    ttip_show_specification: { default: true },
    ttip_label_99: { default: "99% Limit" },
    ttip_label_95: { default: "95% Limit" },
    ttip_label_68: { default: "68% Limit" },
    ttip_label_target: { default: "Centerline" },
    ttip_label_alt_target: { default: "Alt. Target" },
    ttip_label_specification: { default: "Specification Limit" },
    alt_target: { default: <number>null },
    specification_upper: { default: <number>null },
    specification_lower: { default: <number>null },
    multiplier_alt_target: { default: false },
    multiplier_specification: { default: false }
  },
  x_axis: {
    xlimit_colour: { default: "#000000" },
    xlimit_ticks: { default: true },
    xlimit_tick_font: { default: "'Arial', sans-serif", valid: validFonts},
    xlimit_tick_size: { default: 10, valid: { numberRange: { min: 0, max: 100 }}},
    xlimit_tick_colour: { default: "#000000" },
    xlimit_tick_rotation: { default: -35, valid: { numberRange: { min: -360, max: 360 }}},
    xlimit_tick_count: { default: 10, valid: { numberRange: { min: 0, max: 100 }}},
    xlimit_label: { default: <string>null },
    xlimit_label_font: { default: "'Arial', sans-serif", valid: validFonts},
    xlimit_label_size: { default: 10, valid: { numberRange: { min: 0, max: 100 }}},
    xlimit_label_colour: { default: "#000000" },
    xlimit_l: { default: <number>null },
    xlimit_u: { default: <number>null }
  },
  y_axis: {
    ylimit_colour: { default: "#000000" },
    ylimit_ticks: { default: true },
    ylimit_tick_font: { default: "'Arial', sans-serif", valid: validFonts},
    ylimit_tick_size: { default: 10, valid: { numberRange: { min: 0, max: 100 }}},
    ylimit_tick_colour: { default: "#000000" },
    ylimit_tick_rotation: { default: 0, valid: { numberRange: { min: -360, max: 360 }}},
    ylimit_tick_count: { default: 10, valid: { numberRange: { min: 0, max: 100 }}},
    ylimit_label: { default: <string>null },
    ylimit_label_font: { default: "'Arial', sans-serif", valid: validFonts},
    ylimit_label_size: { default: 10, valid: { numberRange: { min: 0, max: 100 }}},
    ylimit_label_colour: { default: "#000000" },
    ylimit_l: { default: <number>null },
    ylimit_u: { default: <number>null },
    limit_multiplier: { default: 1.5, valid: { numberRange: { min: 0} } },
    ylimit_sig_figs: { default: <number>null }
  },
  dates: {
    date_format_day: { default: "DD", valid: ["DD", "Thurs DD", "Thursday DD", "(blank)"]},
    date_format_month: { default: "MM", valid: ["MM", "Mon", "Month", "(blank)"]},
    date_format_year: { default: "YYYY", valid: ["YYYY", "YY", "(blank)"]},
    date_format_delim: { default: "/", valid: ["/", "-", " "]},
    date_format_locale: { default: "en-GB", valid: ["en-GB", "en-US"]}
  }
};


type DefaultTypes<T> = T[Extract<keyof T, "default">];

export type settingsValueTypes = {
  [K in keyof typeof defaultSettings]: {
    [L in keyof typeof defaultSettings[K]]: DefaultTypes<typeof defaultSettings[K][L]>
  }
}

export const settingsPaneGroupings = {
  outliers: {
    "General": ["process_flag_type", "improvement_direction"],
    "Astronomical Points": ["astronomical", "astronomical_limit", "ast_colour_improvement", "ast_colour_deterioration", "ast_colour_neutral_low", "ast_colour_neutral_high"],
    "Shifts": ["shift", "shift_n", "shift_colour_improvement", "shift_colour_deterioration", "shift_colour_neutral_low", "shift_colour_neutral_high"],
    "Trends": ["trend", "trend_n", "trend_colour_improvement", "trend_colour_deterioration", "trend_colour_neutral_low", "trend_colour_neutral_high"],
    "Two-In-Three": ["two_in_three", "two_in_three_highlight_series", "two_in_three_limit", "twointhree_colour_improvement", "twointhree_colour_deterioration", "twointhree_colour_neutral_low", "twointhree_colour_neutral_high"]
  },
  lines: {
    "Main": ["show_main", "width_main", "type_main", "colour_main"],
    "Target": ["show_target", "width_target", "type_target", "colour_target", "ttip_show_target", "ttip_label_target"],
    "Alt. Target": ["show_alt_target", "alt_target", "multiplier_alt_target", "width_alt_target", "type_alt_target", "colour_alt_target", "ttip_show_alt_target", "ttip_label_alt_target"],
    "68% Limits": ["show_68", "width_68", "type_68", "colour_68", "ttip_show_68", "ttip_label_68"],
    "95% Limits": ["show_95", "width_95", "type_95", "colour_95", "ttip_show_95", "ttip_label_95"],
    "99% Limits": ["show_99", "width_99", "type_99", "colour_99", "ttip_show_99", "ttip_label_99"],
    "Specification Limits": ["show_specification", "specification_upper", "specification_lower", "multiplier_specification", "width_specification", "type_specification", "colour_specification", "ttip_show_specification", "ttip_label_specification"]
  },
  x_axis: {
    "Axis": ["xlimit_colour", "xlimit_l", "xlimit_u"],
    "Ticks": ["xlimit_ticks", "xlimit_tick_count", "xlimit_tick_font", "xlimit_tick_size", "xlimit_tick_colour", "xlimit_tick_rotation"],
    "Label": ["xlimit_label", "xlimit_label_font", "xlimit_label_size", "xlimit_label_colour"]
  },
  y_axis: {
    "Axis": ["ylimit_colour", "limit_multiplier", "ylimit_sig_figs", "ylimit_l", "ylimit_u"],
    "Ticks": ["ylimit_ticks", "ylimit_tick_count", "ylimit_tick_font", "ylimit_tick_size", "ylimit_tick_colour", "ylimit_tick_rotation"],
    "Label": ["ylimit_label", "ylimit_label_font", "ylimit_label_size", "ylimit_label_colour"]
  }
}

export const settingsPaneToggles = {
  spc: {
    "ttip_show_numerator": ["ttip_label_numerator"],
    "ttip_show_denominator": ["ttip_label_denominator"],
    "ttip_show_value": ["ttip_label_value"]
  },
  outliers: {
    "Astronomical Points": {
      "astronomical": ["astronomical_limit", "ast_colour_improvement", "ast_colour_deterioration", "ast_colour_neutral_low", "ast_colour_neutral_high"]
    },
    "Shifts": {
      "shift": ["shift_n", "shift_colour_improvement", "shift_colour_deterioration", "shift_colour_neutral_low", "shift_colour_neutral_high"]
    },
    "Trends": {
      "trend": ["trend_n", "trend_colour_improvement", "trend_colour_deterioration", "trend_colour_neutral_low", "trend_colour_neutral_high"]
    },
    "Two-In-Three": {
      "two_in_three": ["two_in_three_limit", "two_in_three_highlight_series", "twointhree_colour_improvement", "twointhree_colour_deterioration", "twointhree_colour_neutral_low", "twointhree_colour_neutral_high"]
    }
  },
  nhs_icons: {
    "show_variation_icons": ["variation_icons_locations", "variation_icons_scaling"],
    "show_assurance_icons": ["assurance_icons_locations", "assurance_icons_scaling"]
  },
  lines: {
    "Main": {
      "show_main": ["width_main", "type_main", "colour_main"]
    },
    "Target": {
      "show_target": ["width_target", "type_target", "colour_target", "ttip_show_target", "ttip_label_target"],
      "ttip_show_target": ["ttip_label_target"]
    },
    "Alt. Target": {
      "show_alt_target": ["alt_target", "multiplier_alt_target", "width_alt_target", "type_alt_target", "colour_alt_target", "ttip_show_alt_target", "ttip_label_alt_target"],
      "ttip_show_alt_target": ["ttip_label_alt_target"]
    },
    "68% Limits": {
      "show_68": ["width_68", "type_68", "colour_68", "ttip_show_68", "ttip_label_68"],
      "ttip_show_68": ["ttip_label_68"]
    },
    "95% Limits": {
      "show_95": ["width_95", "type_95", "colour_95", "ttip_show_95", "ttip_label_95"],
      "ttip_show_95": ["ttip_label_95"]
    },
    "99% Limits": {
      "show_99": ["width_99", "type_99", "colour_99", "ttip_show_99", "ttip_label_99"],
      "ttip_show_99": ["ttip_label_99"]
    },
    "Specification Limits": {
      "show_specification": ["specification_upper", "specification_lower", "multiplier_specification", "width_specification", "type_specification", "colour_specification", "ttip_show_specification", "ttip_label_specification"],
      "ttip_show_specification": ["ttip_label_specification"]
    }
  }
}

export default defaultSettings;
