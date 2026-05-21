import { FormattingComponent, defaultColours } from "./common";

const scatterSettings = {
  description: "Scatter Settings",
  displayName: "Scatter Settings",
  settingsGroups: {
    "all": {
      show_dots: {
        displayName: "Show Scatter",
        type: FormattingComponent.ToggleSwitch,
        default: true
      },
      shape: {
        displayName: "Shape",
        type: FormattingComponent.Dropdown,
        default: "Circle",
        valid: ["Circle", "Cross", "Diamond", "Square", "Star", "Triangle", "Wye"],
        items: [
          { displayName : "Circle", value : "Circle" },
          { displayName : "Cross", value : "Cross" },
          { displayName : "Diamond", value : "Diamond" },
          { displayName : "Square", value : "Square" },
          { displayName : "Star", value : "Star" },
          { displayName : "Triangle", value : "Triangle" },
          { displayName : "Wye", value : "Wye" }
        ]
      },
      size: {
        displayName: "Size",
        type: FormattingComponent.NumUpDown,
        default: 2.5,
        options: { minValue: { value: 0 }, maxValue: { value: 100 } }
      },
      colour: {
        displayName: "Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.common_cause
      },
      colour_outline: {
        displayName: "Outline Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.common_cause
      },
      width_outline: {
        displayName: "Outline Width",
        type: FormattingComponent.NumUpDown,
        default: 1,
        options: { minValue: { value: 0 }, maxValue: { value: 100 } }
      },
      opacity: {
        displayName: "Default Opacity",
        type: FormattingComponent.NumUpDown,
        default: 1,
        options: { minValue: { value: 0 }, maxValue: { value: 1 } }
      },
      opacity_selected: {
        displayName: "Opacity if Selected",
        type: FormattingComponent.NumUpDown,
        default: 1,
        options: { minValue: { value: 0 }, maxValue: { value: 1 } }
      },
      opacity_unselected: {
        displayName: "Opacity if Unselected",
        type: FormattingComponent.NumUpDown,
        default: 0.2,
        options: { minValue: { value: 0 }, maxValue: { value: 1 } }
      }
    }
  }
};

export default scatterSettings;
