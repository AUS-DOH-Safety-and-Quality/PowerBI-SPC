import { FormattingComponent, defaultColours, textOptions } from "./common";

const xAxisSettings = {
  description: "X Axis Settings",
  displayName: "X Axis Settings",
  settingsGroups: {
    "Axis": {
      xlimit_show: {
        displayName: "Show X Axis",
        type: FormattingComponent.ToggleSwitch,
        default: true
      },
      xlimit_colour: {
        displayName: "Axis Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.standard
      },
      xlimit_l: {
        displayName: "Lower Limit",
        type: FormattingComponent.NumUpDown,
        default: undefined as number | undefined
      },
      xlimit_u: {
        displayName: "Upper Limit",
        type: FormattingComponent.NumUpDown,
        default: undefined as number | undefined
      }
    },
    "Ticks": {
      xlimit_ticks: {
        displayName: "Draw Ticks",
        type: FormattingComponent.ToggleSwitch,
        default: true
      },
      xlimit_tick_count: {
        displayName: "Maximum Ticks",
        type: FormattingComponent.NumUpDown,
        default: 10,
        options: { minValue: { value: 0 }, maxValue: { value: 100 } }
      },
      xlimit_tick_font: {
        displayName: "Tick Font",
        type: FormattingComponent.FontPicker,
        default: textOptions.font.default,
        valid: textOptions.font.valid
      },
      xlimit_tick_size: {
        displayName: "Tick Font Size",
        type: FormattingComponent.NumUpDown,
        default: textOptions.size.default,
        options: { minValue: { value: 0 }, maxValue: { value: 100 } }
      },
      xlimit_tick_colour: {
        displayName: "Tick Font Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.standard
      },
      xlimit_tick_rotation: {
        displayName: "Tick Rotation (Degrees)",
        type: FormattingComponent.NumUpDown,
        default: -35,
        options: { minValue: { value: -360 }, maxValue: { value: 360 } }
      }
    },
    "Label": {
      xlimit_label: {
        displayName: "Label",
        type: FormattingComponent.TextInput,
        default: undefined as string | undefined
      },
      xlimit_label_font: {
        displayName: "Label Font",
        type: FormattingComponent.FontPicker,
        default: textOptions.font.default,
        valid: textOptions.font.valid
      },
      xlimit_label_size: {
        displayName: "Label Font Size",
        type: FormattingComponent.NumUpDown,
        default: textOptions.size.default,
        options: { minValue: { value: 0 }, maxValue: { value: 100 } }
      },
      xlimit_label_colour: {
        displayName: "Label Font Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.standard
      }
    }
  }
};

export default xAxisSettings;
