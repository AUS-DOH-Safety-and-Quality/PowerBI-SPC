import {
  dropdownOption,
  toggleOption, numberOption,
  fontOption, fontSizeOption, textOption, colourOption
} from "powerbi-visuals-core/settings";

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
      xlimit_tick_marks: toggleOption("Draw Tick Marks", true),
      xlimit_tick_count: numberOption("Maximum Ticks", 10, { min: 0, max: 100 }),
      xlimit_tick_font: fontOption("Tick Font"),
      xlimit_tick_size: fontSizeOption("Tick Font Size"),
      xlimit_tick_colour: colourOption("Tick Font Colour", "standard"),
      xlimit_tick_rotation: numberOption("Tick Rotation (Degrees)", -35, { min: -360, max: 360 })
    },
    "Label": {
      xlimit_label: textOption("Label", ""),
      xlimit_label_font: fontOption("Label Font"),
      xlimit_label_size: fontSizeOption("Label Font Size"),
      xlimit_label_colour: colourOption("Label Font Colour", "standard"),
      xlimit_label_style: dropdownOption("Label Font Style", "normal", ["normal", "italic"], "sentence"),
      xlimit_label_align: dropdownOption("Label Alignment", "center", ["left", "center", "right"], "sentence")
    },
    "Gridlines": {
      xlimit_grid_show: toggleOption("Show Gridlines", false),
      xlimit_grid_colour: colourOption("Gridline Colour", "lightgray"),
      xlimit_grid_width: numberOption("Gridline Width", 1, { min: 0 })
    }
  }
};

export default xAxisSettings;
