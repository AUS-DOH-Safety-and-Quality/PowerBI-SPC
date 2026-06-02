import { colourOption, numberOption, toggleOption, dropdownOption } from "./common";

const scatterSettings = {
  description: "Scatter Settings",
  displayName: "Scatter Settings",
  settingsGroups: {
    "all": {
      show_dots: toggleOption("Show Scatter", true),
      shape: dropdownOption("Shape", "Circle", ["Circle", "Cross", "Diamond", "Square", "Star", "Triangle", "Wye"]),
      size: numberOption("Size", 2.5, { min: 0, max: 100 }),
      colour: colourOption("Colour", "common_cause"),
      colour_outline: colourOption("Outline Colour", "common_cause"),
      width_outline: numberOption("Outline Width", 1, { min: 0, max: 100 }),
      opacity: numberOption("Default Opacity", 1, { min: 0, max: 1 }),
      opacity_selected: numberOption("Opacity if Selected", 1, { min: 0, max: 1 }),
      opacity_unselected: numberOption("Opacity if Unselected", 0.2, { min: 0, max: 1 })
    }
  }
};

export default scatterSettings;
