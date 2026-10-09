import { toggleOption, dotOptions } from "powerbi-visuals-core/settings";

const scatterSettings = {
  description: "Scatter Settings",
  displayName: "Scatter Settings",
  settingsGroups: {
    "all": {
      show_dots: toggleOption("Show Scatter", true),
      ...dotOptions()
    }
  }
};

export default scatterSettings;
