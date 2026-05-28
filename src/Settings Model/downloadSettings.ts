import { toggleOption } from "./common";

const downloadSettings = {
  description: "Download Options",
  displayName: "Download Options",
  settingsGroups: {
    "all": {
      show_button: toggleOption("Show Download Button", false)
    }
  }
};

export default downloadSettings;
