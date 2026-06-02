import {
  fontOption, toggleOption,
  colourOption, fontSizeOption, lineTypeOption,
  numberOption, dropdownOption
 } from "./common";

const labelsSettings = {
  description: "Labels Settings",
  displayName: "Labels Settings",
  settingsGroups: {
    "all": {
      show_labels: toggleOption("Show Value Labels", true),
      label_position: dropdownOption("Label Position", "top", ["top", "bottom"], "sentence"),
      label_y_offset: numberOption("Label Offset from Top/Bottom (px)", 20),
      label_line_offset: numberOption("Label Offset from Connecting Line (px)", 5),
      label_angle_offset: numberOption("Label Angle Offset (degrees)", 0, { min: -90, max: 90 }),
      label_font: fontOption("Label Font"),
      label_size: fontSizeOption("Label Font Size"),
      label_colour: colourOption("Label Font Colour", "standard"),
      label_line_colour: colourOption("Connecting Line Colour", "standard"),
      label_line_width: numberOption("Connecting Line Width", 1, { min: 0, max: 100 }),
      label_line_type: lineTypeOption("Connecting Line Type", "10 0"),
      label_line_max_length: numberOption("Max Connecting Line Length (px)", 1000, { min: 0, max: 10000 }),
      label_marker_show: toggleOption("Show Line Markers", true),
      label_marker_offset: numberOption("Marker Offset from Value (px)", 5),
      label_marker_size: numberOption("Marker Size", 3, { min: 0, max: 100 }),
      label_marker_colour: colourOption("Marker Fill Colour", "standard"),
      label_marker_outline_colour: colourOption("Marker Outline Colour", "standard")
    }
  }
};

export default labelsSettings;
