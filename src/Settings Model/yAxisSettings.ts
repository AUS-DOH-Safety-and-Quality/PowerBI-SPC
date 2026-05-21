import { FormattingComponent, defaultColours, textOptions } from "./common";

const yAxisSettings = {
  description: "Y Axis Settings",
  displayName: "Y Axis Settings",
  settingsGroups: {
    "Axis": {
      ylimit_show: {
        displayName: "Show Y Axis",
        type: FormattingComponent.ToggleSwitch,
        default: true
      },
      ylimit_colour: {
        displayName: "Axis Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.standard
      },
      limit_multiplier: {
        displayName: "Axis Scaling Factor",
        type: FormattingComponent.NumUpDown,
        default: 1.5,
        options: { minValue: { value: 0 } }
      },
      ylimit_sig_figs: {
        displayName: "Tick Decimal Places",
        type: FormattingComponent.NumUpDown,
        default: undefined as number | undefined,
        options: { minValue: { value: 0 }, maxValue: { value: 100 } }
      },
      ylimit_l: {
        displayName: "Lower Limit",
        type: FormattingComponent.NumUpDown,
        default: undefined as number | undefined
      },
      ylimit_u: {
        displayName: "Upper Limit",
        type: FormattingComponent.NumUpDown,
        default: undefined as number | undefined
      }
    },
    "Ticks": {
      ylimit_ticks: {
        displayName: "Draw Ticks",
        type: FormattingComponent.ToggleSwitch,
        default: true
      },
      ylimit_tick_count: {
        displayName: "Maximum Ticks",
        type: FormattingComponent.NumUpDown,
        default: 10,
        options: { minValue: { value: 0 }, maxValue: { value: 100 } }
      },
      ylimit_tick_font: {
        displayName: "Tick Font",
        type: FormattingComponent.FontPicker,
        default: textOptions.font.default,
        valid: textOptions.font.valid
      },
      ylimit_tick_size: {
        displayName: "Tick Font Size",
        type: FormattingComponent.NumUpDown,
        default: textOptions.size.default,
        options: { minValue: { value: 0 }, maxValue: { value: 100 } }
      },
      ylimit_tick_colour: {
        displayName: "Tick Font Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.standard
      },
      ylimit_tick_rotation: {
        displayName: "Tick Rotation (Degrees)",
        type: FormattingComponent.NumUpDown,
        default: 0,
        options: { minValue: { value: -360 }, maxValue: { value: 360 } }
      }
    },
    "Label": {
      ylimit_label: {
        displayName: "Label",
        type: FormattingComponent.TextInput,
        default: undefined as string | undefined
      },
      ylimit_label_font: {
        displayName: "Label Font",
        type: FormattingComponent.FontPicker,
        default: textOptions.font.default,
        valid: textOptions.font.valid
      },
      ylimit_label_size: {
        displayName: "Label Font Size",
        type: FormattingComponent.NumUpDown,
        default: textOptions.size.default,
        options: { minValue: { value: 0 }, maxValue: { value: 100 } }
      },
      ylimit_label_colour: {
        displayName: "Label Font Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.standard
      }
    }
  }
};

export default yAxisSettings;
