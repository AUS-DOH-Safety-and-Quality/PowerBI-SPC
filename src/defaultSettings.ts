const defaultSettings = {
  canvas: {
    lower_padding: 10,
    upper_padding: 10,
    left_padding: 10,
    right_padding: 10
  },
  spc: {
    chart_type: "i",
    outliers_in_limits: false,
    multiplier: 1,
    sig_figs: 2,
    perc_labels: "Automatic",
    split_on_click: false,
    ll_truncate: <number>(null),
    ul_truncate: <number>(null)
  },
  outliers: {
    process_flag_type: "both",
    improvement_direction: "increase",
    flag_series: true,
    astronomical: false,
    ast_colour_improvement: "#00B0F0",
    ast_colour_deterioration: "#E46C0A",
    ast_colour_neutral_low: "#490092",
    ast_colour_neutral_high: "#490092",
    shift: false,
    shift_n: 7,
    shift_colour_improvement: "#00B0F0",
    shift_colour_deterioration: "#E46C0A",
    shift_colour_neutral_low: "#490092",
    shift_colour_neutral_high: "#490092",
    trend: false,
    trend_n: 5,
    trend_colour_improvement: "#00B0F0",
    trend_colour_deterioration: "#E46C0A",
    trend_colour_neutral_low: "#490092",
    trend_colour_neutral_high: "#490092",
    two_in_three: false,
    twointhree_colour_improvement: "#00B0F0",
    twointhree_colour_deterioration: "#E46C0A",
    twointhree_colour_neutral_low: "#490092",
    twointhree_colour_neutral_high: "#490092"
  },
  nhs_icons: {
    show_variation_icons: false,
    flag_variation_last: true,
    variation_icons_locations: "Top Right",
    variation_icons_scaling: 1,
    show_assurance_icons: false,
    assurance_icons_locations: "Top Right",
    assurance_icons_scaling: 1
  },
  scatter: {
    size: 2.5,
    colour: "#000000",
    opacity: 1,
    opacity_unselected: 0.2
  },
  lines: {
    show_99: true,
    show_95: true,
    show_68: false,
    show_main: true,
    show_target: true,
    show_alt_target: false,
    width_99: 2,
    width_95: 2,
    width_68: 2,
    width_main: 1,
    width_target: 1.5,
    width_alt_target: 1.5,
    type_99: "10 10",
    type_95: "2 5",
    type_68: "2 5",
    type_main: "10 0",
    type_target: "10 0",
    type_alt_target: "10 0",
    colour_99: "#6495ED",
    colour_95: "#6495ED",
    colour_68: "#6495ED",
    colour_main: "#000000",
    colour_target: "#000000",
    colour_alt_target: "#000000",
    ttip_show_99: true,
    ttip_show_95: false,
    ttip_show_68: false,
    ttip_show_target: true,
    ttip_show_alt_target: true,
    ttip_label_99: "99% Limit",
    ttip_label_95: "95% Limit",
    ttip_label_68: "68% Limit",
    ttip_label_target: "Centerline",
    ttip_label_alt_target: "Additional Target",
    alt_target: <number>(null)
  },
  x_axis: {
    xlimit_colour: "#000000",
    xlimit_ticks: true,
    xlimit_tick_font: "'Arial', sans-serif",
    xlimit_tick_size: 10,
    xlimit_tick_colour: "#000000",
    xlimit_tick_rotation: -35,
    xlimit_tick_count: <number>(null),
    xlimit_label:<string>(null),
    xlimit_label_font: "'Arial', sans-serif",
    xlimit_label_size: 10,
    xlimit_label_colour: "#000000",
    xlimit_l: <number>(null),
    xlimit_u: <number>(null)
  },
  y_axis: {
    ylimit_colour: "#000000",
    ylimit_ticks: true,
    ylimit_tick_font: "'Arial', sans-serif",
    ylimit_tick_size: 10,
    ylimit_tick_colour: "#000000",
    ylimit_tick_rotation: 0,
    ylimit_tick_count: <number>(null),
    ylimit_label:<string>(null),
    ylimit_label_font: "'Arial', sans-serif",
    ylimit_label_size: 10,
    ylimit_label_colour: "#000000",
    ylimit_l: <number>(null),
    ylimit_u: <number>(null),
    limit_multiplier: 1.5,
    ylimit_sig_figs: <number>(null)
  },
  dates: {
    date_format_day: "DD",
    date_format_month: "MM",
    date_format_year: "YYYY",
    date_format_delim: "/",
    date_format_locale: "en-GB"
  }
};

export const settingsPaneGroupings = {
  outliers: {
    "Astronomical Points": ["process_flag_type", "improvement_direction", "flag_series", "astronomical", "ast_colour_improvement", "ast_colour_deterioration", "ast_colour_neutral_low", "ast_colour_neutral_high"],
    "Shifts": ["process_flag_type", "improvement_direction", "flag_series", "shift", "shift_n", "shift_colour_improvement", "shift_colour_deterioration", "shift_colour_neutral_low", "shift_colour_neutral_high"],
    "Trends": ["process_flag_type", "improvement_direction", "flag_series", "trend", "trend_n", "trend_colour_improvement", "trend_colour_deterioration", "trend_colour_neutral_low", "trend_colour_neutral_high"],
    "Two-In-Three": ["process_flag_type", "improvement_direction", "flag_series", "two_in_three", "twointhree_colour_improvement", "twointhree_colour_deterioration", "twointhree_colour_neutral_low", "twointhree_colour_neutral_high"]
  },
  nhs_icons: {
    "Variation": ["show_variation_icons", "flag_variation_last", "variation_icons_locations", "variation_icons_scaling"],
    "Assurance": ["show_assurance_icons", "assurance_icons_locations", "assurance_icons_scaling"]
  },
  lines: {
    "Main": ["show_main", "width_main", "type_main", "colour_main"],
    "Target": ["show_target", "width_target", "type_target", "colour_target", "ttip_show_target", "ttip_label_target"],
    "Alt. Target": ["show_alt_target", "alt_target", "width_alt_target", "type_alt_target", "colour_alt_target", "ttip_show_alt_target", "ttip_label_alt_target"],
    "68% Limits": ["show_68", "width_68", "type_68", "colour_68", "ttip_show_68", "ttip_label_68"],
    "95% Limits": ["show_95", "width_95", "type_95", "colour_95", "ttip_show_95", "ttip_label_95"],
    "99% Limits": ["show_99", "width_99", "type_99", "colour_99", "ttip_show_99", "ttip_label_99"]
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
  lines: {
    "Main": {
      "show_main": ["width_main", "type_main", "colour_main"]
    },
    "Target": {
      "show_target": ["width_target", "type_target", "colour_target", "ttip_show_target", "ttip_label_target"],
      "ttip_show_target": ["ttip_label_target"]
    },
    "Alt. Target": {
      "show_alt_target": ["alt_target", "width_alt_target", "type_alt_target", "colour_alt_target", "ttip_show_alt_target", "ttip_label_alt_target"],
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
    }
  }
}

export default defaultSettings;
