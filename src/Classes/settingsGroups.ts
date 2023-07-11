/**
 * Base class defining the two types of settings values that are stored:
 *   - default: The initial default value
 *   - value: The value provided/chosen by the user
 */
 class settingsPair<T> {
  default: T;
  value: T;

  constructor(initialValue?: T) {
    this.default = initialValue;
    this.value = initialValue;
  }
}

type SettingsBaseTypedT<T extends object> = {
  [K in keyof T]: T[K] extends settingsPair<any> ? T[K]['default'] : T[K];
}

class canvasSettings {
  lower_padding: settingsPair<number>;
  upper_padding: settingsPair<number>;
  left_padding: settingsPair<number>;
  right_padding: settingsPair<number>;

  constructor() {
    this.lower_padding = new settingsPair(50);
    this.upper_padding = new settingsPair(10);
    this.left_padding = new settingsPair(50);
    this.right_padding = new settingsPair(10);
  }
}

class datesSettings {
  date_format_day: settingsPair<string>;
  date_format_month: settingsPair<string>;
  date_format_year: settingsPair<string>;
  date_format_delim: settingsPair<string>;
  date_format_locale: settingsPair<string>;

  constructor() {
    this.date_format_day = new settingsPair("DD");
    this.date_format_month = new settingsPair("MM");
    this.date_format_year = new settingsPair("YYYY");
    this.date_format_delim = new settingsPair("/");
    this.date_format_locale = new settingsPair("en-GB");
  }
}

class spcSettings {
  chart_type: settingsPair<string>;
  outliers_in_limits: settingsPair<boolean>;
  multiplier: settingsPair<number>;
  sig_figs: settingsPair<number>;
  perc_labels: settingsPair<string>;
  split_on_click: settingsPair<boolean>;
  ll_truncate: settingsPair<number>;
  ul_truncate: settingsPair<number>;
  alt_target: settingsPair<number>;

  constructor() {
    this.chart_type = new settingsPair("i");
    this.outliers_in_limits = new settingsPair(false);
    this.perc_labels = new settingsPair("Automatic");
    this.multiplier = new settingsPair(1);
    this.sig_figs = new settingsPair(2);
    this.split_on_click = new settingsPair(false);
    this.ul_truncate = new settingsPair<number>(null);
    this.ll_truncate = new settingsPair<number>(null);
    this.alt_target = new settingsPair<number>(null);
  }
}

class scatterSettings {
  size: settingsPair<number>;
  colour: settingsPair<string>;
  opacity: settingsPair<number>;
  opacity_unselected: settingsPair<number>;

  constructor() {
    this.size = new settingsPair(2.5);
    this.colour = new settingsPair("#000000");
    this.opacity = new settingsPair(1);
    this.opacity_unselected = new settingsPair(0.2);
  }
}

class lineSettings {
  width_99: settingsPair<number>;
  width_95: settingsPair<number>;
  width_main: settingsPair<number>;
  width_target: settingsPair<number>;
  width_alt_target: settingsPair<number>;
  type_99: settingsPair<string>;
  type_95: settingsPair<string>;
  type_main: settingsPair<string>;
  type_target: settingsPair<string>;
  type_alt_target: settingsPair<string>;
  colour_99: settingsPair<string>;
  colour_95: settingsPair<string>;
  colour_main: settingsPair<string>;
  colour_target: settingsPair<string>;
  colour_alt_target: settingsPair<string>;

  constructor() {
    this.width_99 = new settingsPair(2);
    this.width_95 = new settingsPair(2);
    this.width_main = new settingsPair(1);
    this.width_target = new settingsPair(1.5);
    this.width_alt_target = new settingsPair(1.5);
    this.type_99 = new settingsPair("10 10");
    this.type_95 = new settingsPair("2 5");
    this.type_main = new settingsPair("10 0");
    this.type_target = new settingsPair("10 0");
    this.type_alt_target = new settingsPair("10 0");
    this.colour_99 = new settingsPair("#6495ED");
    this.colour_95 = new settingsPair("#6495ED");
    this.colour_main = new settingsPair("#000000");
    this.colour_target = new settingsPair("#000000");
    this.colour_alt_target = new settingsPair("#000000");
  }
}

class xAxisSettings {
  xlimit_colour: settingsPair<string>;
  xlimit_ticks: settingsPair<boolean>;
  xlimit_tick_font: settingsPair<string>;
  xlimit_tick_size: settingsPair<number>;
  xlimit_tick_colour: settingsPair<string>;
  xlimit_tick_rotation: settingsPair<number>;
  xlimit_tick_count: settingsPair<number>;
  xlimit_label: settingsPair<string>;
  xlimit_label_font: settingsPair<string>;
  xlimit_label_size: settingsPair<number>;
  xlimit_label_colour: settingsPair<string>;
  xlimit_l: settingsPair<number>;
  xlimit_u: settingsPair<number>;

  constructor() {
    this.xlimit_colour = new settingsPair("#000000");
    this.xlimit_ticks = new settingsPair(true);
    this.xlimit_tick_font = new settingsPair("'Arial', sans-serif");
    this.xlimit_tick_size = new settingsPair(10);
    this.xlimit_tick_colour = new settingsPair("#000000");
    this.xlimit_tick_rotation = new settingsPair(-35);
    this.xlimit_tick_count = new settingsPair<number>(null);
    this.xlimit_label = new settingsPair<string>(null);
    this.xlimit_label_font = new settingsPair("'Arial', sans-serif");
    this.xlimit_label_size = new settingsPair(10);
    this.xlimit_label_colour = new settingsPair("#000000");
    this.xlimit_l = new settingsPair<number>(null);
    this.xlimit_u = new settingsPair<number>(null);
  }
}

class yAxisSettings {
  ylimit_colour: settingsPair<string>;
  ylimit_ticks: settingsPair<boolean>;
  ylimit_tick_font: settingsPair<string>;
  ylimit_tick_size: settingsPair<number>;
  ylimit_tick_colour: settingsPair<string>;
  ylimit_tick_rotation: settingsPair<number>;
  ylimit_tick_count: settingsPair<number>;
  ylimit_label: settingsPair<string>;
  ylimit_label_font: settingsPair<string>;
  ylimit_label_size: settingsPair<number>;
  ylimit_label_colour: settingsPair<string>;
  limit_multiplier: settingsPair<number>;
  ylimit_l: settingsPair<number>;
  ylimit_u: settingsPair<number>;
  ylimit_sig_figs: settingsPair<number>;

  constructor() {
    this.ylimit_colour = new settingsPair("#000000");
    this.ylimit_ticks = new settingsPair(true);
    this.ylimit_sig_figs = new settingsPair<number>(null);
    this.ylimit_tick_font = new settingsPair("'Arial', sans-serif");
    this.ylimit_tick_size = new settingsPair(10);
    this.ylimit_tick_colour = new settingsPair("#000000");
    this.ylimit_tick_rotation = new settingsPair(0);
    this.ylimit_tick_count = new settingsPair<number>(null);
    this.ylimit_label = new settingsPair<string>(null);
    this.ylimit_label_font = new settingsPair("'Arial', sans-serif");
    this.ylimit_label_size = new settingsPair(10);
    this.ylimit_label_colour = new settingsPair("#000000");
    this.limit_multiplier = new settingsPair(1.5);
    this.ylimit_l = new settingsPair<number>(null);
    this.ylimit_u = new settingsPair<number>(null);
  }
}

class outliersSettings {
  process_flag_type: settingsPair<string>;
  improvement_direction: settingsPair<string>;
  astronomical: settingsPair<boolean>;
  ast_colour_improvement: settingsPair<string>;
  ast_colour_deterioration: settingsPair<string>;
  ast_colour_neutral_low: settingsPair<string>;
  ast_colour_neutral_high: settingsPair<string>;
  shift: settingsPair<boolean>;
  shift_n: settingsPair<number>;
  shift_colour_improvement: settingsPair<string>;
  shift_colour_deterioration: settingsPair<string>;
  shift_colour_neutral_low: settingsPair<string>;
  shift_colour_neutral_high: settingsPair<string>;
  trend: settingsPair<boolean>;
  trend_n: settingsPair<number>;
  trend_colour_improvement: settingsPair<string>;
  trend_colour_deterioration: settingsPair<string>;
  trend_colour_neutral_low: settingsPair<string>;
  trend_colour_neutral_high: settingsPair<string>;
  two_in_three: settingsPair<boolean>;
  twointhree_colour_improvement: settingsPair<string>;
  twointhree_colour_deterioration: settingsPair<string>;
  twointhree_colour_neutral_low: settingsPair<string>;
  twointhree_colour_neutral_high: settingsPair<string>;

  constructor() {
    this.process_flag_type = new settingsPair("both");
    this.improvement_direction = new settingsPair("increase");
    this.astronomical = new settingsPair(false);
    this.ast_colour_improvement = new settingsPair("#E1C233");
    this.ast_colour_deterioration = new settingsPair("#E1C233");
    this.ast_colour_neutral_low = new settingsPair("#E1C233");
    this.ast_colour_neutral_high = new settingsPair("#E1C233");
    this.shift = new settingsPair(false);
    this.shift_n = new settingsPair(7);
    this.shift_colour_improvement = new settingsPair("#E1C233");
    this.shift_colour_deterioration = new settingsPair("#E1C233");
    this.shift_colour_neutral_low = new settingsPair("#E1C233");
    this.shift_colour_neutral_high = new settingsPair("#E1C233");
    this.trend = new settingsPair(false);
    this.trend_n = new settingsPair(5);
    this.trend_colour_improvement = new settingsPair("#E1C233");
    this.trend_colour_deterioration = new settingsPair("#E1C233");
    this.trend_colour_neutral_low = new settingsPair("#E1C233");
    this.trend_colour_neutral_high = new settingsPair("#E1C233");
    this.two_in_three = new settingsPair(false);
    this.twointhree_colour_improvement = new settingsPair("#E1C233");
    this.twointhree_colour_deterioration = new settingsPair("#E1C233");
    this.twointhree_colour_neutral_low = new settingsPair("#E1C233");
    this.twointhree_colour_neutral_high = new settingsPair("#E1C233");
  }
}

class nhsIconSettings {
  show_variation_icons: settingsPair<boolean>;
  flag_variation_last: settingsPair<boolean>;
  variation_icons_locations: settingsPair<string>;
  variation_icons_scaling: settingsPair<number>;

  constructor() {
    this.show_variation_icons = new settingsPair(false);
    this.flag_variation_last = new settingsPair(true);
    this.variation_icons_locations = new settingsPair("Top Right");
    this.variation_icons_scaling = new settingsPair(1.0);
  }
}

type AllSettingsTypes = SettingsBaseTypedT<canvasSettings> | SettingsBaseTypedT<spcSettings> |
                        SettingsBaseTypedT<outliersSettings> | SettingsBaseTypedT<scatterSettings> |
                        SettingsBaseTypedT<lineSettings> | SettingsBaseTypedT<xAxisSettings> |
                        SettingsBaseTypedT<yAxisSettings> | SettingsBaseTypedT<nhsIconSettings> |
                        SettingsBaseTypedT<datesSettings>;

export {
  canvasSettings,
  spcSettings,
  scatterSettings,
  lineSettings,
  xAxisSettings,
  yAxisSettings,
  outliersSettings,
  nhsIconSettings,
  SettingsBaseTypedT,
  datesSettings,
  AllSettingsTypes
}
