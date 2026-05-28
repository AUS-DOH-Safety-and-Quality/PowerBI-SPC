import {
  defaultColours, fontOption, toggleOption,
  colourOption, fontSizeOption, lineTypeOption,
  numberOption,
  numberOptionMinMax, dropdownOption
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
      label_angle_offset: numberOptionMinMax("Label Angle Offset (degrees)", 0, -90, 90),
      label_font: fontOption("Label Font"),
      label_size: fontSizeOption("Label Font Size"),
      label_colour: colourOption("Label Font Colour", defaultColours.standard),
      label_line_colour: colourOption("Connecting Line Colour", defaultColours.standard),
      label_line_width: numberOptionMinMax("Connecting Line Width", 1, 0, 100),
      label_line_type: lineTypeOption("Connecting Line Type", "10 0"),
      label_line_max_length: numberOptionMinMax("Max Connecting Line Length (px)", 1000, 0, 10000),
      label_marker_show: toggleOption("Show Line Markers", true),
      label_marker_offset: numberOption("Marker Offset from Value (px)", 5),
      label_marker_size: numberOptionMinMax("Marker Size", 3, 0, 100),
      label_marker_colour: colourOption("Marker Fill Colour", defaultColours.standard),
      label_marker_outline_colour: colourOption("Marker Outline Colour", defaultColours.standard)
    }
  }
};

export default labelsSettings;
