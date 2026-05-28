import {
  colourOption, defaultColours,
  numberOptionMin, numberOptionMinMax, numberOption,
  toggleOption, fontOption, fontSizeOption, textOption
} from "./common";

const yAxisSettings = {
  description: "Y Axis Settings",
  displayName: "Y Axis Settings",
  settingsGroups: {
    "Axis": {
      ylimit_show: toggleOption("Show Y Axis", true),
      ylimit_colour: colourOption("Axis Colour", defaultColours.standard),
      limit_multiplier: numberOptionMin("Axis Scaling Factor", 1.5, 0),
      ylimit_sig_figs: numberOptionMinMax("Tick Decimal Places", undefined, 0, 100),
      ylimit_l: numberOption("Lower Limit", undefined),
      ylimit_u: numberOption("Upper Limit", undefined)
    },
    "Ticks": {
      ylimit_ticks: toggleOption("Draw Ticks", true),
      ylimit_tick_count: numberOptionMinMax("Maximum Ticks", 10, 0, 100),
      ylimit_tick_font: fontOption("Tick Font"),
      ylimit_tick_size: fontSizeOption("Tick Font Size"),
      ylimit_tick_colour: colourOption("Tick Font Colour", defaultColours.standard),
      ylimit_tick_rotation: numberOptionMinMax("Tick Rotation (Degrees)", 0, -360, 360)
    },
    "Label": {
      ylimit_label: textOption("Label", ""),
      ylimit_label_font: fontOption("Label Font"),
      ylimit_label_size: fontSizeOption("Label Font Size"),
      ylimit_label_colour: colourOption("Label Font Colour", defaultColours.standard)
    }
  }
};

export default yAxisSettings;
