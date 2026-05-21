import { FormattingComponent, textOptions, defaultColours, lineOptions } from "./common";

const labelsSettings = {
  description: "Labels Settings",
  displayName: "Labels Settings",
  settingsGroups: {
    "all": {
      show_labels: {
        displayName: "Show Value Labels",
        type: FormattingComponent.ToggleSwitch,
        default: true
      },
      label_position: {
        displayName: "Label Position",
        type: FormattingComponent.Dropdown,
        default: "top",
        valid: ["top", "bottom"],
        items: [
          { displayName : "Top",    value : "top" },
          { displayName : "Bottom", value : "bottom" }
        ]
      },
      label_y_offset: {
        displayName: "Label Offset from Top/Bottom (px)",
        type: FormattingComponent.NumUpDown,
        default: 20
      },
      label_line_offset: {
        displayName: "Label Offset from Connecting Line (px)",
        type: FormattingComponent.NumUpDown,
        default: 5
      },
      label_angle_offset: {
        displayName: "Label Angle Offset (degrees)",
        type: FormattingComponent.NumUpDown,
        default: 0,
        options: { minValue: { value: -90 }, maxValue: { value: 90 } }
      },
      label_font: {
        displayName: "Label Font",
        type: FormattingComponent.FontPicker,
        default: textOptions.font.default,
        valid: textOptions.font.valid
      },
      label_size: {
        displayName: "Label Font Size",
        type: FormattingComponent.NumUpDown,
        default: textOptions.size.default,
        options: { minValue: { value: 0 }, maxValue: { value: 100 } }
      },
      label_colour: {
        displayName: "Label Font Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.standard
      },
      label_line_colour: {
        displayName: "Connecting Line Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.standard
      },
      label_line_width: {
        displayName: "Connecting Line Width",
        type: FormattingComponent.NumUpDown,
        default: 1,
        options: { minValue: { value: 0 }, maxValue: { value: 100 } }
      },
      label_line_type: {
        displayName: "Connecting Line Type",
        type: FormattingComponent.Dropdown,
        default: "10 0",
        valid: lineOptions.type.valid,
        items: lineOptions.type.items
      },
      label_line_max_length: {
        displayName: "Max Connecting Line Length (px)",
        type: FormattingComponent.NumUpDown,
        default: 1000,
        options: { minValue: { value: 0 }, maxValue: { value: 10000 } }
      },
      label_marker_show: {
        displayName: "Show Line Markers",
        type: FormattingComponent.ToggleSwitch,
        default: true
      },
      label_marker_offset: {
        displayName: "Marker Offset from Value (px)",
        type: FormattingComponent.NumUpDown,
        default: 5
      },
      label_marker_size: {
        displayName: "Marker Size",
        type: FormattingComponent.NumUpDown,
        default: 3,
        options: { minValue: { value: 0 }, maxValue: { value: 100 } }
      },
      label_marker_colour: {
        displayName: "Marker Fill Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.standard
      },
      label_marker_outline_colour: {
        displayName: "Marker Outline Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.standard
      }
    }
  }
};

export default labelsSettings;
