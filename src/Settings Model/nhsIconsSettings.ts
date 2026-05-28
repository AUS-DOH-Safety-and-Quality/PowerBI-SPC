import { toggleOption, numberOptionMin, dropdownOption } from "./common";

const iconLocations: string[] = ["Top Right", "Bottom Right", "Top Left", "Bottom Left"];

const nhsIconsSettings = {
  description: "NHS Icons Settings",
  displayName: "NHS Icons Settings",
  settingsGroups: {
    "all": {
      show_variation_icons: toggleOption("Show Variation Icons", false),
      flag_last_point: toggleOption("Flag Only Last Point", true),
      variation_icons_locations: dropdownOption("Variation Icon Locations", "Top Right", iconLocations),
      variation_icons_scaling: numberOptionMin("Scale Variation Icon Size", 1, 0),
      show_assurance_icons: toggleOption("Show Assurance Icons", false),
      assurance_icons_locations: dropdownOption("Assurance Icon Locations", "Top Right", iconLocations),
      assurance_icons_scaling: numberOptionMin("Scale Assurance Icon Size", 1, 0)
    }
  }
};

export default nhsIconsSettings;
