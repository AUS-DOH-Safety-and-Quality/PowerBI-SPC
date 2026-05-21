import { FormattingComponent } from "./common";

const canvasSettings = {
  description: "Canvas Settings",
  displayName: "Canvas Settings",
  settingsGroups: {
    "all": {
      show_errors: {
        displayName: "Show Errors on Canvas",
        type: FormattingComponent.ToggleSwitch,
        default: true
      },
      lower_padding: {
        displayName: "Padding Below Plot (pixels):",
        type: FormattingComponent.NumUpDown,
        default: 10
      },
      upper_padding: {
        displayName: "Padding Above Plot (pixels):",
        type: FormattingComponent.NumUpDown,
        default: 10
      },
      left_padding: {
        displayName: "Padding Left of Plot (pixels):",
        type: FormattingComponent.NumUpDown,
        default: 10
      },
      right_padding: {
        displayName: "Padding Right of Plot (pixels):",
        type: FormattingComponent.NumUpDown,
        default: 10
      }
    }
  }
};

export default canvasSettings;
