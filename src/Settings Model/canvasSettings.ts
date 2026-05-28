import { paddingOption, toggleOption } from "./common";

const canvasSettings = {
  description: "Canvas Settings",
  displayName: "Canvas Settings",
  settingsGroups: {
    "all": {
      show_errors: toggleOption("Show Errors on Canvas", true),
      lower_padding: paddingOption("Padding Below Plot (pixels):"),
      upper_padding: paddingOption("Padding Above Plot (pixels):"),
      left_padding: paddingOption("Padding Left of Plot (pixels):"),
      right_padding: paddingOption("Padding Right of Plot (pixels):")
    }
  }
};

export default canvasSettings;
