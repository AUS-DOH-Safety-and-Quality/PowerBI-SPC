import { toggleOption, numberOption, dropdownOption } from "powerbi-visuals-core/settings";

const iconLocations = ["Top Right", "Bottom Right", "Top Left", "Bottom Left"] as const;

const nhsIconsSettings = {
  description: "NHS Icons Settings",
  displayName: "NHS Icons Settings",
  settingsGroups: {
    "all": {
      show_variation_icons: toggleOption("Show Variation Icons",
                                         "Draws the NHS variation icons for the flagged points, or adds them as a summary table column.", false),
      flag_last_point: toggleOption("Flag Only Last Point", "Bases the variation icons on the last point only; off uses every point.", true),
      variation_icons_locations: dropdownOption("Variation Icon Locations", "Corner of the chart for the variation icons.",
                                                "Top Right", iconLocations),
      variation_icons_scaling: numberOption("Scale Variation Icon Size", "Multiplies the size of the variation icons.", 1, { min: 0 }),
      show_assurance_icons: toggleOption("Show Assurance Icons",
                                         "Draws the NHS assurance icon, comparing the alt. target with the last point's three-sigma limits. "
                                         + "Needs the alt. target line and an increase or decrease improvement direction.", false),
      assurance_icons_locations: dropdownOption("Assurance Icon Locations", "Corner of the chart for the assurance icon.",
                                                "Top Right", iconLocations),
      assurance_icons_scaling: numberOption("Scale Assurance Icon Size", "Multiplies the size of the assurance icon.", 1, { min: 0 })
    }
  }
};

export default nhsIconsSettings;
