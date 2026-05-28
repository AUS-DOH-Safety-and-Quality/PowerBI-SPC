import {
  colourOption,
  numberOptionMinMax, toggleOption, dropdownOption
} from "./common";

const scatterSettings = {
  description: "Scatter Settings",
  displayName: "Scatter Settings",
  settingsGroups: {
    "all": {
      show_dots: toggleOption("Show Scatter", true),
      shape: dropdownOption("Shape", "Circle", ["Circle", "Cross", "Diamond", "Square", "Star", "Triangle", "Wye"]),
      size: numberOptionMinMax("Size", 2.5, 0, 100),
      colour: colourOption("Colour", "common_cause"),
      colour_outline: colourOption("Outline Colour", "common_cause"),
      width_outline: numberOptionMinMax("Outline Width", 1, 0, 100),
      opacity: numberOptionMinMax("Default Opacity", 1, 0, 1),
      opacity_selected: numberOptionMinMax("Opacity if Selected", 1, 0, 1),
      opacity_unselected: numberOptionMinMax("Opacity if Unselected", 0.2, 0, 1)
    }
  }
};

export default scatterSettings;
