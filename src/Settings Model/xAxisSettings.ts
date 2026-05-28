import {
  toggleOption, numberOption, numberOptionMinMax,
  fontOption, fontSizeOption, textOption, colourOption
} from "./common";

const xAxisSettings = {
  description: "X Axis Settings",
  displayName: "X Axis Settings",
  settingsGroups: {
    "Axis": {
      xlimit_show: toggleOption("Show X Axis", true),
      xlimit_colour: colourOption("Axis Colour", "standard"),
      xlimit_l: numberOption("Lower Limit", undefined),
      xlimit_u: numberOption("Upper Limit", undefined)
    },
    "Ticks": {
      xlimit_ticks: toggleOption("Draw Ticks", true),
      xlimit_tick_count: numberOptionMinMax("Maximum Ticks", 10, 0, 100),
      xlimit_tick_font: fontOption("Tick Font"),
      xlimit_tick_size: fontSizeOption("Tick Font Size"),
      xlimit_tick_colour: colourOption("Tick Font Colour", "standard"),
      xlimit_tick_rotation: numberOptionMinMax("Tick Rotation (Degrees)", -35, -360, 360)
    },
    "Label": {
      xlimit_label: textOption("Label", ""),
      xlimit_label_font: fontOption("Label Font"),
      xlimit_label_size: fontSizeOption("Label Font Size"),
      xlimit_label_colour: colourOption("Label Font Colour", "standard")
    }
  }
};

export default xAxisSettings;
