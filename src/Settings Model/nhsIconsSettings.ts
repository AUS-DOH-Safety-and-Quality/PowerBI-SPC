import { FormattingComponent } from "./common";

const nhsIconsSettings = {
  description: "NHS Icons Settings",
  displayName: "NHS Icons Settings",
  settingsGroups: {
    "all": {
      show_variation_icons: {
        displayName: "Show Variation Icons",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      flag_last_point: {
        displayName: "Flag Only Last Point",
        type: FormattingComponent.ToggleSwitch,
        default: true
      },
      variation_icons_locations: {
        displayName: "Variation Icon Locations",
        type: FormattingComponent.Dropdown,
        default: "Top Right",
        valid: ["Top Right", "Bottom Right", "Top Left", "Bottom Left"],
        items: [
          { displayName : "Top Right",    value : "Top Right" },
          { displayName : "Bottom Right", value : "Bottom Right" },
          { displayName : "Top Left",     value : "Top Left" },
          { displayName : "Bottom Left",  value : "Bottom Left" }
        ]
      },
      variation_icons_scaling: {
        displayName: "Scale Variation Icon Size",
        type: FormattingComponent.NumUpDown,
        default: 1,
        options: { minValue: { value: 0 } }
      },
      show_assurance_icons: {
        displayName: "Show Assurance Icons",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      assurance_icons_locations: {
        displayName: "Assurance Icon Locations",
        type: FormattingComponent.Dropdown,
        default: "Top Right",
        valid: ["Top Right", "Bottom Right", "Top Left", "Bottom Left"],
        items: [
          { displayName : "Top Right",    value : "Top Right" },
          { displayName : "Bottom Right", value : "Bottom Right" },
          { displayName : "Top Left",     value : "Top Left" },
          { displayName : "Bottom Left",  value : "Bottom Left" }
        ]
      },
      assurance_icons_scaling: {
        displayName: "Scale Assurance Icon Size",
        type: FormattingComponent.NumUpDown,
        default: 1,
        options: { minValue: { value: 0 } }
      }
    }
  }
};

export default nhsIconsSettings;
