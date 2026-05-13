import { FormattingComponent } from "./common";

const downloadSettings = {
  description: "Download Options",
  displayName: "Download Options",
  settingsGroups: {
    "all": {
      show_button: {
        displayName: "Show Download Button",
        type: FormattingComponent.ToggleSwitch,
        default: false
      }
    }
  }
};

export default downloadSettings;
