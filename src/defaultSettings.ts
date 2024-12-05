import { textOptions, lineOptions, iconOptions, colourOptions, borderOptions } from "./validSettingValues";

const defaultSettings = {
  canvas: {
    show_errors: { default: true },
    lower_padding: { default: 10 },
    upper_padding: { default: 10 },
    left_padding: { default: 10 },
    right_padding: { default: 10 }
  },
  spc: {
    chart_type: { default: "i", valid: ["run", "i", "i_m", "i_mm", "mr", "p", "pp", "u", "up", "c", "xbar", "s", "g", "t"] },
    outliers_in_limits: { default: false },
    multiplier: { default: 1, valid: { numberRange: { min: 0 } } },
    sig_figs: { default: 2, valid: { numberRange: { min: 0, max: 20 } } },
    perc_labels: { default: "Automatic", valid: ["Automatic", "Yes", "No"]},
    split_on_click: { default: false },
    num_points_subset: {default: <number>null },
    subset_points_from: { default: "Start", valid: ["Start", "End"] },
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
    astronomical_limit: { default: "3 Sigma", valid: ["1 Sigma", "2 Sigma", "3 Sigma", "Specification"]},
    ast_colour_improvement: colourOptions.improvement,
    ast_colour_deterioration: colourOptions.deterioration,
    ast_colour_neutral_low: colourOptions.neutral_low,
    ast_colour_neutral_high: colourOptions.neutral_high,
    shift: { default: false },
    shift_n: { default: 7, valid: { numberRange: { min: 1 } } },
    shift_colour_improvement: colourOptions.improvement,
    shift_colour_deterioration: colourOptions.deterioration,
    shift_colour_neutral_low: colourOptions.neutral_low,
    shift_colour_neutral_high: colourOptions.neutral_high,
    trend: { default: false },
    trend_n: { default: 5, valid: { numberRange: { min: 1 } } },
    trend_colour_improvement: colourOptions.improvement,
    trend_colour_deterioration: colourOptions.deterioration,
    trend_colour_neutral_low: colourOptions.neutral_low,
    trend_colour_neutral_high: colourOptions.neutral_high,
    two_in_three: { default: false },
    two_in_three_highlight_series: { default: false },
    two_in_three_limit: { default: "2 Sigma", valid: ["1 Sigma", "2 Sigma", "3 Sigma", "Specification"]},
    twointhree_colour_improvement: colourOptions.improvement,
    twointhree_colour_deterioration: colourOptions.deterioration,
    twointhree_colour_neutral_low: colourOptions.neutral_low,
    twointhree_colour_neutral_high: colourOptions.neutral_high
  },
  nhs_icons: {
    flag_last_point: { default: true },
    show_variation_icons: { default: false },
    variation_icons_locations: iconOptions.location,
    variation_icons_scaling: iconOptions.scaling,
    show_assurance_icons: { default: false },
    assurance_icons_locations: iconOptions.location,
    assurance_icons_scaling: iconOptions.scaling
  },
  scatter: {
    size: { default: 2.5, valid: { numberRange: { min: 0, max: 100 }}},
    colour: colourOptions.standard,
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
    width_99: { default: 2, valid: lineOptions.width.valid },
    width_95: { default: 2, valid: lineOptions.width.valid },
    width_68: { default: 2, valid: lineOptions.width.valid },
    width_main: { default: 1, valid: lineOptions.width.valid },
    width_target: { default: 1.5, valid: lineOptions.width.valid },
    width_alt_target: { default: 1.5, valid: lineOptions.width.valid },
    width_specification: { default: 2, valid: lineOptions.width.valid },
    type_99: { default: "10 10", valid: lineOptions.type.valid },
    type_95: { default: "2 5", valid: lineOptions.type.valid },
    type_68: { default: "2 5", valid: lineOptions.type.valid },
    type_main: { default: "10 0", valid: lineOptions.type.valid },
    type_target: { default: "10 0", valid: lineOptions.type.valid },
    type_alt_target: { default: "10 0", valid: lineOptions.type.valid },
    type_specification: { default: "10 10", valid: lineOptions.type.valid },
    colour_99: colourOptions.limits,
    colour_95: colourOptions.limits,
    colour_68: colourOptions.limits,
    colour_main: colourOptions.standard,
    colour_target: colourOptions.standard,
    colour_alt_target: colourOptions.standard,
    colour_specification: colourOptions.limits,
    ttip_show_99: { default: true },
    ttip_show_95: { default: false },
    ttip_show_68: { default: false },
    ttip_show_target: { default: true },
    ttip_show_alt_target: { default: true },
    ttip_show_specification: { default: true },
    ttip_label_99: { default: "99% Limit" },
    ttip_label_99_prefix_lower: { default: "Lower " },
    ttip_label_99_prefix_upper: { default: "Upper " },
    ttip_label_95: { default: "95% Limit" },
    ttip_label_95_prefix_lower: { default: "Lower " },
    ttip_label_95_prefix_upper: { default: "Upper " },
    ttip_label_68: { default: "68% Limit" },
    ttip_label_68_prefix_lower: { default: "Lower " },
    ttip_label_68_prefix_upper: { default: "Upper " },
    ttip_label_target: { default: "Centerline" },
    ttip_label_alt_target: { default: "Alt. Target" },
    ttip_label_specification: { default: "Specification Limit" },
    ttip_label_specification_prefix_lower: { default: "Lower " },
    ttip_label_specification_prefix_upper: { default: "Upper " },
    alt_target: { default: <number>null },
    specification_upper: { default: <number>null },
    specification_lower: { default: <number>null },
    multiplier_alt_target: { default: false },
    multiplier_specification: { default: false }
  },
  x_axis: {
    xlimit_colour: colourOptions.standard,
    xlimit_ticks: { default: true },
    xlimit_tick_font: textOptions.font,
    xlimit_tick_size: textOptions.size,
    xlimit_tick_colour: colourOptions.standard,
    xlimit_tick_rotation: { default: -35, valid: { numberRange: { min: -360, max: 360 }}},
    xlimit_tick_count: { default: 10, valid: { numberRange: { min: 0, max: 100 }}},
    xlimit_label: { default: <string>null },
    xlimit_label_font: textOptions.font,
    xlimit_label_size: textOptions.size,
    xlimit_label_colour: colourOptions.standard,
    xlimit_l: { default: <number>null },
    xlimit_u: { default: <number>null }
  },
  y_axis: {
    ylimit_colour: colourOptions.standard,
    ylimit_ticks: { default: true },
    ylimit_tick_font: textOptions.font,
    ylimit_tick_size: textOptions.size,
    ylimit_tick_colour: colourOptions.standard,
    ylimit_tick_rotation: { default: 0, valid: { numberRange: { min: -360, max: 360 }}},
    ylimit_tick_count: { default: 10, valid: { numberRange: { min: 0, max: 100 }}},
    ylimit_label: { default: <string>null },
    ylimit_label_font: textOptions.font,
    ylimit_label_size: textOptions.size,
    ylimit_label_colour: colourOptions.standard,
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
  },
  summary_table: {
    show_table: { default: false },
    table_text_overflow: textOptions.text_overflow,
    table_opacity: { default: 1, valid: { numberRange: { min: 0, max: 1 } } },
    table_opacity_unselected: { default: 0.2, valid: { numberRange: { min: 0, max: 1 } } },
    table_variation_filter: { default: "all", valid: ["all", "common", "special", "improvement", "deterioration", "neutral"] },
    table_assurance_filter: { default: "all", valid: ["all", "any", "pass", "fail", "inconsistent"] },
    table_outer_border_style: borderOptions.style,
    table_outer_border_width: borderOptions.width,
    table_outer_border_colour: borderOptions.colour,
    table_outer_border_top: { default: true },
    table_outer_border_bottom: { default: true },
    table_outer_border_left: { default: true },
    table_outer_border_right: { default: true },
    table_header_font: textOptions.font,
    table_header_font_weight: textOptions.weight,
    table_header_text_transform: textOptions.text_transform,
    table_header_text_align: textOptions.text_align,
    table_header_text_padding: {default: 1, valid: { numberRange: { min: 0, max: 100 }}},
    table_header_size: textOptions.size,
    table_header_colour: colourOptions.standard,
    table_header_bg_colour: { default: "#D3D3D3" },
    table_header_border_style: borderOptions.style,
    table_header_border_width: borderOptions.width,
    table_header_border_colour: borderOptions.colour,
    table_header_border_bottom: { default: true },
    table_header_border_inner: { default: true },
    table_body_font: textOptions.font,
    table_body_font_weight: textOptions.weight,
    table_body_text_transform: textOptions.text_transform,
    table_body_text_align: textOptions.text_align,
    table_body_text_padding: {default: 1, valid: { numberRange: { min: 0, max: 100 }}},
    table_body_size: textOptions.size,
    table_body_colour: colourOptions.standard,
    table_body_bg_colour: { default: "#FFFFFF" },
    table_body_border_style: borderOptions.style,
    table_body_border_width: borderOptions.width,
    table_body_border_colour: borderOptions.colour,
    table_body_border_top_bottom: { default: true },
    table_body_border_left_right: { default: true }
  },
  download_options: {
    show_button: { default: false }
  },
  label_options: {
    show_labels: { default: true },
    label_font: textOptions.font,
    label_size: textOptions.size,
    label_colour: colourOptions.standard
  }
};


type DefaultTypes<T> = T[Extract<keyof T, "default">];
export type NestedKeysOf<T>
  = T extends object
    ? { [K in keyof T]: K extends string ? K : never; }[keyof T]
    : never;

export type defaultSettingsType = {
  [K in keyof typeof defaultSettings]: {
    [L in keyof typeof defaultSettings[K]]: DefaultTypes<typeof defaultSettings[K][L]>
  }
}
export type defaultSettingsKeys = keyof defaultSettingsType;
export type defaultSettingsNestedKeys = NestedKeysOf<defaultSettingsType[defaultSettingsKeys]>;

export const settingsPaneGroupings: Partial<Record<defaultSettingsKeys, Record<string, defaultSettingsNestedKeys[]>>> = {
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
    "68% Limits": ["show_68", "width_68", "type_68", "colour_68", "ttip_show_68", "ttip_label_68", "ttip_label_68_prefix_lower", "ttip_label_68_prefix_upper"],
    "95% Limits": ["show_95", "width_95", "type_95", "colour_95", "ttip_show_95", "ttip_label_95", "ttip_label_95_prefix_lower", "ttip_label_95_prefix_upper"],
    "99% Limits": ["show_99", "width_99", "type_99", "colour_99", "ttip_show_99", "ttip_label_99", "ttip_label_99_prefix_lower", "ttip_label_99_prefix_upper"],
    "Specification Limits": ["show_specification", "specification_upper", "specification_lower", "multiplier_specification", "width_specification", "type_specification", "colour_specification", "ttip_show_specification", "ttip_label_specification", "ttip_label_specification_prefix_lower", "ttip_label_specification_prefix_upper"]
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
  },
  summary_table: {
    "General": ["show_table", "table_variation_filter", "table_assurance_filter", "table_text_overflow", "table_opacity", "table_opacity_unselected", "table_outer_border_style", "table_outer_border_width", "table_outer_border_colour", "table_outer_border_top", "table_outer_border_bottom", "table_outer_border_left", "table_outer_border_right"],
    "Header": ["table_header_font", "table_header_size", "table_header_text_align", "table_header_font_weight", "table_header_text_transform", "table_header_text_padding", "table_header_colour", "table_header_bg_colour", "table_header_border_style", "table_header_border_width", "table_header_border_colour", "table_header_border_bottom", "table_header_border_inner"],
    "Body": ["table_body_font", "table_body_size", "table_body_text_align", "table_body_font_weight", "table_body_text_transform", "table_body_text_padding", "table_body_colour", "table_body_bg_colour", "table_body_border_style", "table_body_border_width", "table_body_border_colour", "table_body_border_top_bottom", "table_body_border_left_right"]
  }
}

export default defaultSettings;
