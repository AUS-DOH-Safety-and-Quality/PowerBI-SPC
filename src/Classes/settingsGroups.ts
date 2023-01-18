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

class axispadSettings {
  x: {
    padding: settingsPair<number>,
    end_padding: settingsPair<number>
  };
  y: {
    padding: settingsPair<number>,
    end_padding: settingsPair<number>
  };

  constructor() {
    this.x = {
      padding: new settingsPair(50),
      end_padding: new settingsPair(10)
    };
    this.y = {
      padding: new settingsPair(50),
      end_padding: new settingsPair(10)
    };
  };
};

class spcSettings {
  chart_type: settingsPair<string>;
  multiplier: settingsPair<number>;
  denom_split: settingsPair<string>;
  ll_truncate: settingsPair<number>;
  ul_truncate: settingsPair<number>;
  alt_target: settingsPair<number>;

  constructor() {
    this.chart_type = new settingsPair("i");
    this.multiplier = new settingsPair(1);
    this.denom_split = new settingsPair<string>(null);
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
  xlimit_date_format: settingsPair<string>;
  xlimit_ticks: settingsPair<boolean>;
  xlimit_tick_font: settingsPair<string>;
  xlimit_tick_size: settingsPair<string>;
  xlimit_tick_colour: settingsPair<string>;
  xlimit_label: settingsPair<string>;
  xlimit_label_font: settingsPair<string>;
  xlimit_label_size: settingsPair<string>;
  xlimit_label_colour: settingsPair<string>;
  xlimit_l: settingsPair<number>;
  xlimit_u: settingsPair<number>;

  constructor() {
    this.xlimit_colour = new settingsPair("#000000");
    this.xlimit_date_format = new settingsPair("DD/MM/YYYY");
    this.xlimit_ticks = new settingsPair(true);
    this.xlimit_tick_font = new settingsPair("'Arial', sans-serif");
    this.xlimit_tick_size = new settingsPair("x-small");
    this.xlimit_tick_colour = new settingsPair("#000000");
    this.xlimit_label = new settingsPair<string>(null);
    this.xlimit_label_font = new settingsPair("'Arial', sans-serif");
    this.xlimit_label_size = new settingsPair("x-small");
    this.xlimit_label_colour = new settingsPair("#000000");
    this.xlimit_l = new settingsPair<number>(null);
    this.xlimit_u = new settingsPair<number>(null);
  };
}

class yAxisSettings {
  ylimit_colour: settingsPair<string>;
  ylimit_ticks: settingsPair<boolean>;
  ylimit_tick_font: settingsPair<string>;
  ylimit_tick_size: settingsPair<string>;
  ylimit_tick_colour: settingsPair<string>;
  ylimit_label: settingsPair<string>;
  ylimit_label_font: settingsPair<string>;
  ylimit_label_size: settingsPair<string>;
  ylimit_label_colour: settingsPair<string>;
  limit_multiplier: settingsPair<number>;
  ylimit_l: settingsPair<number>;
  ylimit_u: settingsPair<number>;

  constructor() {
    this.ylimit_colour = new settingsPair("#000000");
    this.ylimit_ticks = new settingsPair(true);
    this.ylimit_tick_font = new settingsPair("'Arial', sans-serif");
    this.ylimit_tick_size = new settingsPair("x-small");
    this.ylimit_tick_colour = new settingsPair("#000000");
    this.ylimit_label = new settingsPair<string>(null);
    this.ylimit_label_font = new settingsPair("'Arial', sans-serif");
    this.ylimit_label_size = new settingsPair("x-small");
    this.ylimit_label_colour = new settingsPair("#000000");
    this.limit_multiplier = new settingsPair(1.5);
    this.ylimit_l = new settingsPair<number>(null);
    this.ylimit_u = new settingsPair<number>(null);
  };
}

class outliersSettings {
  flag_direction: settingsPair<string>;
  astronomical: settingsPair<boolean>;
  ast_colour_upper: settingsPair<string>;
  ast_colour_lower: settingsPair<string>;
  shift: settingsPair<boolean>;
  shift_n: settingsPair<number>;
  shift_colour_upper: settingsPair<string>;
  shift_colour_lower: settingsPair<string>;
  trend: settingsPair<boolean>;
  trend_n: settingsPair<number>;
  trend_colour_upper: settingsPair<string>;
  trend_colour_lower: settingsPair<string>;
  two_in_three: settingsPair<boolean>;
  twointhree_colour_upper: settingsPair<string>;
  twointhree_colour_lower: settingsPair<string>;

  constructor() {
    this.flag_direction = new settingsPair("both");
    this.astronomical = new settingsPair(false);
    this.ast_colour_upper = new settingsPair("#E1C233");
    this.ast_colour_lower = new settingsPair("#E1C233");
    this.shift = new settingsPair(false);
    this.shift_n = new settingsPair(7);
    this.shift_colour_upper = new settingsPair("#E1C233");
    this.shift_colour_lower = new settingsPair("#E1C233");
    this.trend = new settingsPair(false);
    this.trend_n = new settingsPair(5);
    this.trend_colour_upper = new settingsPair("#E1C233");
    this.trend_colour_lower = new settingsPair("#E1C233");
    this.two_in_three = new settingsPair(false);
    this.twointhree_colour_upper = new settingsPair("#E1C233");
    this.twointhree_colour_lower = new settingsPair("#E1C233");
  };
}

export {
  axispadSettings,
  spcSettings,
  scatterSettings,
  lineSettings,
  xAxisSettings,
  yAxisSettings,
  outliersSettings
}
