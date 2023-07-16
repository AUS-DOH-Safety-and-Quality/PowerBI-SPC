let defaultSettings = {
  canvas: {
    lower_padding: 50,
    upper_padding: 10,
    left_padding: 50,
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
    ul_truncate: <number>(null),
    alt_target: <number>(null)
  },
  outliers: {
    process_flag_type: "both",
    improvement_direction: "increase",
    astronomical: false,
    ast_colour_improvement: "#E1C233",
    ast_colour_deterioration: "#E1C233",
    ast_colour_neutral_low: "#E1C233",
    ast_colour_neutral_high: "#E1C233",
    shift: false,
    shift_n: 7,
    shift_colour_improvement: "#E1C233",
    shift_colour_deterioration: "#E1C233",
    shift_colour_neutral_low: "#E1C233",
    shift_colour_neutral_high: "#E1C233",
    trend: false,
    trend_n: 5,
    trend_colour_improvement: "#E1C233",
    trend_colour_deterioration: "#E1C233",
    trend_colour_neutral_low: "#E1C233",
    trend_colour_neutral_high: "#E1C233",
    two_in_three: false,
    twointhree_colour_improvement: "#E1C233",
    twointhree_colour_deterioration: "#E1C233",
    twointhree_colour_neutral_low: "#E1C233",
    twointhree_colour_neutral_high: "#E1C233"
  },
  nhs_icons: {
    show_variation_icons: false,
    flag_variation_last: true,
    variation_icons_locations: "Top Right",
    variation_icons_scaling: 1
  },
  scatter: {
    size: 2.5,
    colour: "#000000",
    opacity: 1,
    opacity_unselected: 0.2
  },
  lines: {
    width_99: 2,
    width_95: 2,
    width_main: 1,
    width_target: 1.5,
    width_alt_target: 1.5,
    type_99: "10 10",
    type_95: "2 5",
    type_main: "10 0",
    type_target: "10 0",
    type_alt_target: "10 0",
    colour_99: "#6495ED",
    colour_95: "#6495ED",
    colour_main: "#000000",
    colour_target: "#000000",
    colour_alt_target: "#000000"
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
    ylimit_tick_rotation: -35,
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
}

type defaultSettingsType = typeof defaultSettings;
type defaultSettingsKey = keyof defaultSettingsType;
type settingsScalarTypes = number | string | boolean

export { defaultSettingsType, defaultSettingsKey, settingsScalarTypes }
export default defaultSettings;