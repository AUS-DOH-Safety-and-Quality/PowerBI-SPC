import { textOptions, lineOptions, iconOptions, colourOptions, borderOptions, labelOptions } from "./validSettingValues";

const defaultSettings = {
  canvas: {
    show_errors: { type: "ToggleSwitch", default: true },
    lower_padding: { type: "NumUpDown", default: 10 },
    upper_padding: { type: "NumUpDown", default: 10 },
    left_padding: { type: "NumUpDown", default: 10 },
    right_padding: { type: "NumUpDown", default: 10 }
  },
  spc: {
    chart_type: { type: "Dropdown", default: "i", valid: ["run", "i", "i_m", "i_mm", "mr", "p", "pp", "u", "up", "c", "xbar", "s", "g", "t"] },
    outliers_in_limits: { type: "ToggleSwitch", default: false },
    multiplier: { type: "NumUpDown", default: 1, valid: { numberRange: { min: 0 } } },
    sig_figs: { type: "NumUpDown", default: 2, valid: { numberRange: { min: 0, max: 20 } } },
    perc_labels: { type: "Dropdown", default: "Automatic", valid: ["Automatic", "Yes", "No"]},
    split_on_click: { type: "ToggleSwitch", default: false },
    num_points_subset: { type: "NumUpDown", default: <number>null },
    subset_points_from: { type: "Dropdown", default: "Start", valid: ["Start", "End"] },
    ttip_show_numerator: { type: "ToggleSwitch", default: true },
    ttip_label_numerator: { type: "TextInput", default: "Numerator"},
    ttip_show_denominator: { type: "ToggleSwitch", default: true },
    ttip_label_denominator: { type: "TextInput", default: "Denominator"},
    ttip_show_value: { type: "ToggleSwitch", default: true },
    ttip_label_value: { type: "TextInput", default: "Automatic"},
    ll_truncate: { type: "NumUpDown", default: <number>null },
    ul_truncate: { type: "NumUpDown", default: <number>null }
  },
  outliers: {
    process_flag_type: { type: "Dropdown", default: "both", valid: ["both", "improvement", "deterioration"]},
    improvement_direction: { type: "Dropdown", default: "increase", valid: ["increase", "neutral", "decrease"]},
    astronomical: { type: "ToggleSwitch", default: false },
    astronomical_limit: { type: "Dropdown", default: "3 Sigma", valid: ["1 Sigma", "2 Sigma", "3 Sigma", "Specification"]},
    ast_colour_improvement: colourOptions.improvement,
    ast_colour_deterioration: colourOptions.deterioration,
    ast_colour_neutral_low: colourOptions.neutral_low,
    ast_colour_neutral_high: colourOptions.neutral_high,
    shift: { type: "ToggleSwitch", default: false },
    shift_n: { type: "NumUpDown", default: 7, valid: { numberRange: { min: 1 } } },
    shift_colour_improvement: colourOptions.improvement,
    shift_colour_deterioration: colourOptions.deterioration,
    shift_colour_neutral_low: colourOptions.neutral_low,
    shift_colour_neutral_high: colourOptions.neutral_high,
    trend: { type: "ToggleSwitch", default: false },
    trend_n: { type: "NumUpDown", default: 5, valid: { numberRange: { min: 1 } } },
    trend_colour_improvement: colourOptions.improvement,
    trend_colour_deterioration: colourOptions.deterioration,
    trend_colour_neutral_low: colourOptions.neutral_low,
    trend_colour_neutral_high: colourOptions.neutral_high,
    two_in_three: { type: "ToggleSwitch", default: false },
    two_in_three_highlight_series: { type: "ToggleSwitch", default: false },
    two_in_three_limit: { type: "Dropdown", default: "2 Sigma", valid: ["1 Sigma", "2 Sigma", "3 Sigma", "Specification"]},
    twointhree_colour_improvement: colourOptions.improvement,
    twointhree_colour_deterioration: colourOptions.deterioration,
    twointhree_colour_neutral_low: colourOptions.neutral_low,
    twointhree_colour_neutral_high: colourOptions.neutral_high
  },
  nhs_icons: {
    flag_last_point: { type: "ToggleSwitch", default: true },
    show_variation_icons: { type: "ToggleSwitch", default: false },
    variation_icons_locations: iconOptions.location,
    variation_icons_scaling: iconOptions.scaling,
    show_assurance_icons: { type: "ToggleSwitch", default: false },
    assurance_icons_locations: iconOptions.location,
    assurance_icons_scaling: iconOptions.scaling
  },
  scatter: {
    shape: { type: "Dropdown", default: "Circle", valid: ["Circle", "Cross", "Diamond", "Square", "Star", "Triangle", "Wye"]},
    size: { type: "NumUpDown", default: 2.5, valid: { numberRange: { min: 0, max: 100 }}},
    colour: colourOptions.common_cause,
    colour_outline: colourOptions.common_cause,
    width_outline: { type: "NumUpDown", default: 1, valid: lineOptions.width.valid },
    opacity: { type: "NumUpDown", default: 1, valid: { numberRange: { min: 0, max: 1 } } },
    opacity_selected: { type: "NumUpDown", default: 1, valid: { numberRange: { min: 0, max: 1 } } },
    opacity_unselected: { type: "NumUpDown", default: 0.2, valid: { numberRange: { min: 0, max: 1 } } }
  },
  lines: {
    show_99: { type: "ToggleSwitch", default: true },
    show_95: { type: "ToggleSwitch", default: true },
    show_68: { type: "ToggleSwitch", default: false },
    show_main: { type: "ToggleSwitch", default: true },
    show_target: { type: "ToggleSwitch", default: true },
    show_alt_target: { type: "ToggleSwitch", default: false },
    show_specification: { type: "ToggleSwitch", default: false },
    width_99: { type: "NumUpDown", default: 2, valid: lineOptions.width.valid },
    width_95: { type: "NumUpDown", default: 2, valid: lineOptions.width.valid },
    width_68: { type: "NumUpDown", default: 2, valid: lineOptions.width.valid },
    width_main: { type: "NumUpDown", default: 1, valid: lineOptions.width.valid },
    width_target: { type: "NumUpDown", default: 1.5, valid: lineOptions.width.valid },
    width_alt_target: { type: "NumUpDown", default: 1.5, valid: lineOptions.width.valid },
    width_specification: { type: "NumUpDown", default: 2, valid: lineOptions.width.valid },
    type_99: { type: "Dropdown", default: "10 10", valid: lineOptions.type.valid },
    type_95: { type: "Dropdown", default: "2 5", valid: lineOptions.type.valid },
    type_68: { type: "Dropdown", default: "2 5", valid: lineOptions.type.valid },
    type_main: { type: "Dropdown", default: "10 0", valid: lineOptions.type.valid },
    type_target: { type: "Dropdown", default: "10 0", valid: lineOptions.type.valid },
    type_alt_target: { type: "Dropdown", default: "10 0", valid: lineOptions.type.valid },
    type_specification: { type: "Dropdown", default: "10 10", valid: lineOptions.type.valid },
    colour_99: colourOptions.limits,
    colour_95: colourOptions.limits,
    colour_68: colourOptions.limits,
    colour_main: colourOptions.common_cause,
    colour_target: colourOptions.standard,
    colour_alt_target: colourOptions.standard,
    colour_specification: colourOptions.limits,
    ttip_show_99: { type: "ToggleSwitch", default: true },
    ttip_show_95: { type: "ToggleSwitch", default: false },
    ttip_show_68: { type: "ToggleSwitch", default: false },
    ttip_show_target: { type: "ToggleSwitch", default: true },
    ttip_show_alt_target: { type: "ToggleSwitch", default: true },
    ttip_show_specification: { type: "ToggleSwitch", default: true },
    ttip_label_99: { type: "TextInput", default: "99% Limit" },
    ttip_label_99_prefix_lower: { type: "TextInput", default: "Lower " },
    ttip_label_99_prefix_upper: { type: "TextInput", default: "Upper " },
    ttip_label_95: { type: "TextInput", default: "95% Limit" },
    ttip_label_95_prefix_lower: { type: "TextInput", default: "Lower " },
    ttip_label_95_prefix_upper: { type: "TextInput", default: "Upper " },
    ttip_label_68: { type: "TextInput", default: "68% Limit" },
    ttip_label_68_prefix_lower: { type: "TextInput", default: "Lower " },
    ttip_label_68_prefix_upper: { type: "TextInput", default: "Upper " },
    ttip_label_target: { type: "TextInput", default: "Centerline" },
    ttip_label_alt_target: { type: "TextInput", default: "Alt. Target" },
    ttip_label_specification: { type: "TextInput", default: "Specification Limit" },
    ttip_label_specification_prefix_lower: { type: "TextInput", default: "Lower " },
    ttip_label_specification_prefix_upper: { type: "TextInput", default: "Upper " },
    opacity_99: { type: "NumUpDown", default: 1, valid: { numberRange: { min: 0, max: 1 } } },
    opacity_unselected_99: { type: "NumUpDown", default: 0.2, valid: { numberRange: { min: 0, max: 1 } } },
    opacity_95: { type: "NumUpDown", default: 1, valid: { numberRange: { min: 0, max: 1 } } },
    opacity_unselected_95: { type: "NumUpDown", default: 0.2, valid: { numberRange: { min: 0, max: 1 } } },
    opacity_68: { type: "NumUpDown", default: 1, valid: { numberRange: { min: 0, max: 1 } } },
    opacity_unselected_68: { type: "NumUpDown", default: 0.2, valid: { numberRange: { min: 0, max: 1 } } },
    opacity_main: { type: "NumUpDown", default: 1, valid: { numberRange: { min: 0, max: 1 } } },
    opacity_unselected_main: { type: "NumUpDown", default: 0.2, valid: { numberRange: { min: 0, max: 1 } } },
    opacity_target: { type: "NumUpDown", default: 1, valid: { numberRange: { min: 0, max: 1 } } },
    opacity_unselected_target: { type: "NumUpDown", default: 0.2, valid: { numberRange: { min: 0, max: 1 } } },
    opacity_alt_target: { type: "NumUpDown", default: 1, valid: { numberRange: { min: 0, max: 1 } } },
    opacity_unselected_alt_target: { type: "NumUpDown", default: 0.2, valid: { numberRange: { min: 0, max: 1 } } },
    opacity_specification: { type: "NumUpDown", default: 1, valid: { numberRange: { min: 0, max: 1 } } },
    opacity_unselected_specification: { type: "NumUpDown", default: 0.2, valid: { numberRange: { min: 0, max: 1 } } },
    alt_target: { type: "NumUpDown", default:<number>null },
    specification_upper: { type: "NumUpDown", default:<number>null },
    specification_lower: { type: "NumUpDown", default:<number>null },
    multiplier_alt_target: { type: "ToggleSwitch", default: false },
    multiplier_specification: { type: "ToggleSwitch", default: false },
    plot_label_show_99: { type: "ToggleSwitch", default: false },
    plot_label_show_95: { type: "ToggleSwitch", default: false },
    plot_label_show_68: { type: "ToggleSwitch", default: false },
    plot_label_show_main: { type: "ToggleSwitch", default: false },
    plot_label_show_target: { type: "ToggleSwitch", default: false },
    plot_label_show_alt_target: { type: "ToggleSwitch", default: false },
    plot_label_show_specification: { type: "ToggleSwitch", default: false },
    plot_label_show_all_99: { type: "ToggleSwitch", default: false },
    plot_label_show_all_95: { type: "ToggleSwitch", default: false },
    plot_label_show_all_68: { type: "ToggleSwitch", default: false },
    plot_label_show_all_main: { type: "ToggleSwitch", default: false },
    plot_label_show_all_target: { type: "ToggleSwitch", default: false },
    plot_label_show_all_alt_target: { type: "ToggleSwitch", default: false },
    plot_label_show_all_specification: { type: "ToggleSwitch", default: false },
    plot_label_show_n_99: { type: "NumUpDown", default: 1, valid: { numberRange: { min: 1 } } },
    plot_label_show_n_95: { type: "NumUpDown", default: 1, valid: { numberRange: { min: 1 } } },
    plot_label_show_n_68: { type: "NumUpDown", default: 1, valid: { numberRange: { min: 1 } } },
    plot_label_show_n_main: { type: "NumUpDown", default: 1, valid: { numberRange: { min: 1 } } },
    plot_label_show_n_target: { type: "NumUpDown", default: 1, valid: { numberRange: { min: 1 } } },
    plot_label_show_n_alt_target: { type: "NumUpDown", default: 1, valid: { numberRange: { min: 1 } } },
    plot_label_show_n_specification: { type: "NumUpDown", default: 1, valid: { numberRange: { min: 1 } } },
    plot_label_position_99: labelOptions.limits,
    plot_label_position_95: labelOptions.limits,
    plot_label_position_68: labelOptions.limits,
    plot_label_position_main: labelOptions.standard,
    plot_label_position_target: labelOptions.standard,
    plot_label_position_alt_target: labelOptions.standard,
    plot_label_position_specification: labelOptions.limits,
    plot_label_vpad_99: { type: "NumUpDown", default: 0 },
    plot_label_vpad_95: { type: "NumUpDown", default: 0 },
    plot_label_vpad_68: { type: "NumUpDown", default: 0 },
    plot_label_vpad_main: { type: "NumUpDown", default: 0 },
    plot_label_vpad_target: { type: "NumUpDown", default: 0 },
    plot_label_vpad_alt_target: { type: "NumUpDown", default: 0 },
    plot_label_vpad_specification: { type: "NumUpDown", default: 0 },
    plot_label_hpad_99: { type: "NumUpDown", default: 10 },
    plot_label_hpad_95: { type: "NumUpDown", default: 10 },
    plot_label_hpad_68: { type: "NumUpDown", default: 10 },
    plot_label_hpad_main: { type: "NumUpDown", default: 10 },
    plot_label_hpad_target: { type: "NumUpDown", default: 10 },
    plot_label_hpad_alt_target: { type: "NumUpDown", default: 10 },
    plot_label_hpad_specification: { type: "NumUpDown", default: 10 },
    plot_label_font_99: textOptions.font,
    plot_label_font_95: textOptions.font,
    plot_label_font_68: textOptions.font,
    plot_label_font_main: textOptions.font,
    plot_label_font_target: textOptions.font,
    plot_label_font_alt_target: textOptions.font,
    plot_label_font_specification: textOptions.font,
    plot_label_size_99: textOptions.size,
    plot_label_size_95: textOptions.size,
    plot_label_size_68: textOptions.size,
    plot_label_size_main: textOptions.size,
    plot_label_size_target: textOptions.size,
    plot_label_size_alt_target: textOptions.size,
    plot_label_size_specification: textOptions.size,
    plot_label_colour_99: colourOptions.standard,
    plot_label_colour_95: colourOptions.standard,
    plot_label_colour_68: colourOptions.standard,
    plot_label_colour_main: colourOptions.standard,
    plot_label_colour_target: colourOptions.standard,
    plot_label_colour_alt_target: colourOptions.standard,
    plot_label_colour_specification: colourOptions.standard,
    plot_label_prefix_99: { type: "TextInput", default: "" },
    plot_label_prefix_95: { type: "TextInput", default: "" },
    plot_label_prefix_68: { type: "TextInput", default: "" },
    plot_label_prefix_main: { type: "TextInput", default: "" },
    plot_label_prefix_target: { type: "TextInput", default: "" },
    plot_label_prefix_alt_target: { type: "TextInput", default: "" },
    plot_label_prefix_specification: { type: "TextInput", default: "" },
    join_rebaselines_99: { type: "ToggleSwitch", default: false },
    join_rebaselines_95: { type: "ToggleSwitch", default: false },
    join_rebaselines_68: { type: "ToggleSwitch", default: false },
    join_rebaselines_main: { type: "ToggleSwitch", default: false },
    join_rebaselines_target: { type: "ToggleSwitch", default: false },
    join_rebaselines_alt_target: { type: "ToggleSwitch", default: false },
    join_rebaselines_specification: { type: "ToggleSwitch", default: false }
  },
  x_axis: {
    xlimit_colour: colourOptions.standard,
    xlimit_ticks: { type: "ToggleSwitch", default: true },
    xlimit_tick_font: textOptions.font,
    xlimit_tick_size: textOptions.size,
    xlimit_tick_colour: colourOptions.standard,
    xlimit_tick_rotation: { type: "NumUpDown", default: -35, valid: { numberRange: { min: -360, max: 360 }}},
    xlimit_tick_count: { type: "NumUpDown", default: 10, valid: { numberRange: { min: 0, max: 100 }}},
    xlimit_label: { type: "TextInput", default: <string>null },
    xlimit_label_font: textOptions.font,
    xlimit_label_size: textOptions.size,
    xlimit_label_colour: colourOptions.standard,
    xlimit_l: { type: "NumUpDown", default:<number>null },
    xlimit_u: { type: "NumUpDown", default:<number>null }
  },
  y_axis: {
    ylimit_colour: colourOptions.standard,
    ylimit_ticks: { type: "ToggleSwitch", default: true },
    ylimit_tick_font: textOptions.font,
    ylimit_tick_size: textOptions.size,
    ylimit_tick_colour: colourOptions.standard,
    ylimit_tick_rotation: { type: "NumUpDown", default: 0, valid: { numberRange: { min: -360, max: 360 }}},
    ylimit_tick_count: { type: "NumUpDown", default: 10, valid: { numberRange: { min: 0, max: 100 }}},
    ylimit_label: { type: "TextInput", default: <string>null },
    ylimit_label_font: textOptions.font,
    ylimit_label_size: textOptions.size,
    ylimit_label_colour: colourOptions.standard,
    ylimit_l: { type: "NumUpDown", default:<number>null },
    ylimit_u: { type: "NumUpDown", default:<number>null },
    limit_multiplier: { type: "NumUpDown", default: 1.5, valid: { numberRange: { min: 0} } },
    ylimit_sig_figs: { type: "NumUpDown", default:<number>null }
  },
  dates: {
    date_format_day: { type: "Dropdown", default: "DD", valid: ["DD", "Thurs DD", "Thursday DD", "(blank)"]},
    date_format_month: { type: "Dropdown", default: "MM", valid: ["MM", "Mon", "Month", "(blank)"]},
    date_format_year: { type: "Dropdown", default: "YYYY", valid: ["YYYY", "YY", "(blank)"]},
    date_format_delim: { type: "Dropdown", default: "/", valid: ["/", "-", " "]},
    date_format_locale: { type: "Dropdown", default: "en-GB", valid: ["en-GB", "en-US"]}
  },
  summary_table: {
    show_table: { type: "ToggleSwitch", default: false },
    table_text_overflow: textOptions.text_overflow,
    table_opacity: { type: "NumUpDown", default: 1, valid: { numberRange: { min: 0, max: 1 } } },
    table_opacity_selected: { type: "NumUpDown", default: 1, valid: { numberRange: { min: 0, max: 1 } } },
    table_opacity_unselected: { type: "NumUpDown", default: 0.2, valid: { numberRange: { min: 0, max: 1 } } },
    table_variation_filter: { type: "Dropdown", default: "all", valid: ["all", "common", "special", "improvement", "deterioration", "neutral"] },
    table_assurance_filter: { type: "Dropdown", default: "all", valid: ["all", "any", "pass", "fail", "inconsistent"] },
    table_outer_border_style: borderOptions.style,
    table_outer_border_width: borderOptions.width,
    table_outer_border_colour: borderOptions.colour,
    table_outer_border_top: { type: "ToggleSwitch", default: true },
    table_outer_border_bottom: { type: "ToggleSwitch", default: true },
    table_outer_border_left: { type: "ToggleSwitch", default: true },
    table_outer_border_right: { type: "ToggleSwitch", default: true },
    table_header_font: textOptions.font,
    table_header_font_weight: textOptions.weight,
    table_header_text_transform: textOptions.text_transform,
    table_header_text_align: textOptions.text_align,
    table_header_text_padding: { type: "NumUpDown", default: 1, valid: { numberRange: { min: 0, max: 100 }}},
    table_header_size: textOptions.size,
    table_header_colour: colourOptions.standard,
    table_header_bg_colour: { type: "ColorPicker", default: "#D3D3D3" },
    table_header_border_style: borderOptions.style,
    table_header_border_width: borderOptions.width,
    table_header_border_colour: borderOptions.colour,
    table_header_border_bottom: { type: "ToggleSwitch", default: true },
    table_header_border_inner: { type: "ToggleSwitch", default: true },
    table_body_font: textOptions.font,
    table_body_font_weight: textOptions.weight,
    table_body_text_transform: textOptions.text_transform,
    table_body_text_align: textOptions.text_align,
    table_body_text_padding: { type: "NumUpDown", default: 1, valid: { numberRange: { min: 0, max: 100 }}},
    table_body_size: textOptions.size,
    table_body_colour: colourOptions.standard,
    table_body_bg_colour: { type: "ColorPicker", default: "#FFFFFF" },
    table_body_border_style: borderOptions.style,
    table_body_border_width: borderOptions.width,
    table_body_border_colour: borderOptions.colour,
    table_body_border_top_bottom: { type: "ToggleSwitch", default: true },
    table_body_border_left_right: { type: "ToggleSwitch", default: true }
  },
  download_options: {
    show_button: { type: "ToggleSwitch", default: false }
  },
  labels: {
    show_labels: { type: "ToggleSwitch", default: true },
    label_position: { type: "Dropdown", default: "top", valid: ["top", "bottom"] },
    label_y_offset: { type: "NumUpDown", default: 20 },
    label_line_offset: { type: "NumUpDown", default: 5 },
    label_angle_offset: { type: "NumUpDown", default: 0, valid: { numberRange: { min: -90, max: 90 }}},
    label_font: textOptions.font,
    label_size: textOptions.size,
    label_colour: colourOptions.standard,
    label_line_colour: colourOptions.standard,
    label_line_width: { type: "NumUpDown", default: 1, valid: lineOptions.width.valid },
    label_line_type: { type: "Dropdown", default: "10 0", valid: lineOptions.type.valid },
    label_line_max_length: { type: "NumUpDown", default: 1000, valid: { numberRange: { min: 0, max: 10000 }}},
    label_marker_show: { type: "ToggleSwitch", default: true },
    label_marker_offset: { type: "NumUpDown", default: 5 },
    label_marker_size: { type: "NumUpDown", default: 3, valid: { numberRange: { min: 0, max: 100 }}},
    label_marker_colour: colourOptions.standard,
    label_marker_outline_colour: colourOptions.standard
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
    "Main": ["show_main", "width_main", "type_main", "colour_main", "opacity_main", "opacity_unselected_main", "join_rebaselines_main", "plot_label_show_main", "plot_label_show_all_main", "plot_label_show_n_main", "plot_label_position_main", "plot_label_vpad_main", "plot_label_hpad_main", "plot_label_font_main", "plot_label_size_main", "plot_label_colour_main", "plot_label_prefix_main"],
    "Target": ["show_target", "width_target", "type_target", "colour_target", "opacity_target", "opacity_unselected_target", "join_rebaselines_target", "ttip_show_target", "ttip_label_target", "plot_label_show_target", "plot_label_show_all_target", "plot_label_show_n_target", "plot_label_position_target", "plot_label_vpad_target", "plot_label_hpad_target", "plot_label_font_target", "plot_label_size_target", "plot_label_colour_target", "plot_label_prefix_target"],
    "Alt. Target": ["show_alt_target", "alt_target", "multiplier_alt_target", "width_alt_target", "type_alt_target", "colour_alt_target", "opacity_alt_target", "opacity_unselected_alt_target", "join_rebaselines_alt_target", "ttip_show_alt_target", "ttip_label_alt_target", "plot_label_show_alt_target", "plot_label_show_all_alt_target", "plot_label_show_n_alt_target", "plot_label_position_alt_target", "plot_label_vpad_alt_target", "plot_label_hpad_alt_target", "plot_label_font_alt_target", "plot_label_size_alt_target", "plot_label_colour_alt_target", "plot_label_prefix_alt_target"],
    "68% Limits": ["show_68", "width_68", "type_68", "colour_68", "opacity_68", "opacity_unselected_68", "join_rebaselines_68", "ttip_show_68", "ttip_label_68", "ttip_label_68_prefix_lower", "ttip_label_68_prefix_upper", "plot_label_show_68", "plot_label_show_all_68", "plot_label_show_n_68", "plot_label_position_68", "plot_label_vpad_68", "plot_label_hpad_68", "plot_label_font_68", "plot_label_size_68", "plot_label_colour_68", "plot_label_prefix_68"],
    "95% Limits": ["show_95", "width_95", "type_95", "colour_95", "opacity_95", "opacity_unselected_95", "join_rebaselines_95", "ttip_show_95", "ttip_label_95", "ttip_label_95_prefix_lower", "ttip_label_95_prefix_upper", "plot_label_show_95", "plot_label_show_all_95", "plot_label_show_n_95", "plot_label_position_95", "plot_label_vpad_95", "plot_label_hpad_95", "plot_label_font_95", "plot_label_size_95", "plot_label_colour_95", "plot_label_prefix_95"],
    "99% Limits": ["show_99", "width_99", "type_99", "colour_99", "opacity_99", "opacity_unselected_99", "join_rebaselines_99", "ttip_show_99", "ttip_label_99", "ttip_label_99_prefix_lower", "ttip_label_99_prefix_upper", "plot_label_show_99", "plot_label_show_all_99", "plot_label_show_n_99", "plot_label_position_99", "plot_label_vpad_99", "plot_label_hpad_99", "plot_label_font_99", "plot_label_size_99", "plot_label_colour_99", "plot_label_prefix_99"],
    "Specification Limits": ["show_specification", "specification_upper", "specification_lower", "multiplier_specification", "width_specification", "type_specification", "colour_specification", "opacity_specification", "opacity_unselected_specification", "join_rebaselines_specification", "ttip_show_specification", "ttip_label_specification", "ttip_label_specification_prefix_lower", "ttip_label_specification_prefix_upper", "plot_label_show_specification", "plot_label_show_all_specification", "plot_label_show_n_specification", "plot_label_position_specification", "plot_label_vpad_specification", "plot_label_hpad_specification", "plot_label_font_specification", "plot_label_size_specification", "plot_label_colour_specification", "plot_label_prefix_specification"]
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
    "General": ["show_table", "table_variation_filter", "table_assurance_filter", "table_text_overflow", "table_opacity", "table_opacity_selected", "table_opacity_unselected", "table_outer_border_style", "table_outer_border_width", "table_outer_border_colour", "table_outer_border_top", "table_outer_border_bottom", "table_outer_border_left", "table_outer_border_right"],
    "Header": ["table_header_font", "table_header_size", "table_header_text_align", "table_header_font_weight", "table_header_text_transform", "table_header_text_padding", "table_header_colour", "table_header_bg_colour", "table_header_border_style", "table_header_border_width", "table_header_border_colour", "table_header_border_bottom", "table_header_border_inner"],
    "Body": ["table_body_font", "table_body_size", "table_body_text_align", "table_body_font_weight", "table_body_text_transform", "table_body_text_padding", "table_body_colour", "table_body_bg_colour", "table_body_border_style", "table_body_border_width", "table_body_border_colour", "table_body_border_top_bottom", "table_body_border_left_right"]
  }
}

export const formattingPaneTesting: Record<defaultSettingsKeys, {description: string, displayName: string}> = {
  spc: {
    description: "SPC Settings",
    displayName: "Data Settings"
  },
  outliers: {
    description: "Outlier Settings",
    displayName: "Outlier Settings"
  },
  nhs_icons: {
    description: "NHS Icons Settings",
    displayName: "NHS Icons Settings"
  },
  canvas: {
    description: "Canvas Settings",
    displayName: "Canvas Settings"
  },
  scatter: {
    description: "Scatter Settings",
    displayName: "Scatter Settings"
  },
  dates: {
    description: "Date Settings",
    displayName: "Date Settings"
  },
  lines: {
    description: "Line Settings",
    displayName: "Line Settings"
  },
  x_axis: {
    description: "X Axis Settings",
    displayName: "X Axis Settings"
  },
  y_axis: {
    description: "Y Axis Settings",
    displayName: "Y Axis Settings"
  },
  summary_table: {
    description: "Summary Table Settings",
    displayName: "Summary Table Settings"
  },
  download_options: {
    description: "Download Options",
    displayName: "Download Options"
  },
  labels: {
    description: "Labels Settings",
    displayName: "Labels Settings"
  }
};

export default defaultSettings;
