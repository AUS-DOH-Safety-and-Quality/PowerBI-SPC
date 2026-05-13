import { FormattingComponent, defaultColours, textOptions } from "./common";

const linesSettings = {
  description: "Line Settings",
  displayName: "Line Settings",
  settingsGroups: {
    "Main": {
      show_main: {
        displayName: "Show Main Line",
        type: FormattingComponent.ToggleSwitch,
        default: true
      },
      width_main: {
        displayName: "Main Line Width",
        type: FormattingComponent.NumUpDown,
        default: 1,
        options: { minValue: { value: 0 }, maxValue: { value: 100 } }
      },
      type_main: {
        displayName: "Main Line Type",
        type: FormattingComponent.Dropdown,
        default: "10 0",
        valid: ["10 0", "10 10", "2 5"],
        items: [
          { displayName : "Solid",  value : "10 0" },
          { displayName : "Dashed", value : "10 10" },
          { displayName : "Dotted", value : "2 5" }
        ]
      },
      colour_main: {
        displayName: "Main Line Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.common_cause
      },
      opacity_main: {
        displayName: "Default Opacity",
        type: FormattingComponent.NumUpDown,
        default: 1,
        options: { minValue: { value: 0 }, maxValue: { value: 1 } }
      },
      opacity_unselected_main: {
        displayName: "Opacity if Any Selected",
        type: FormattingComponent.NumUpDown,
        default: 0.2,
        options: { minValue: { value: 0 }, maxValue: { value: 1 } }
      },
      join_rebaselines_main: {
        displayName: "Connect Rebaselined Limits",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      plot_label_show_main: {
        displayName: "Show Value on Plot",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      plot_label_show_all_main: {
        displayName: "Show Value at all Re-Baselines",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      plot_label_show_n_main: {
        displayName: "Show Value at Last N Re-Baselines",
        type: FormattingComponent.NumUpDown,
        default: 1,
        options: { minValue: { value: 1 } }
      },
      plot_label_position_main: {
        displayName: "Position of Value on Line(s)",
        type: FormattingComponent.Dropdown,
        default: "beside",
        valid: ["above", "below", "beside"],
        items: [
          { displayName : "Above",      value : "above" },
          { displayName : "Below",      value : "below" },
          { displayName : "Beside",     value : "beside" }
        ]
      },
      plot_label_vpad_main: {
        displayName: "Value Vertical Padding",
        type: FormattingComponent.NumUpDown,
        default: 0
      },
      plot_label_hpad_main: {
        displayName: "Value Horizontal Padding",
        type: FormattingComponent.NumUpDown,
        default: 10
      },
      plot_label_font_main: {
        displayName: "Value Font",
        type: FormattingComponent.FontPicker,
        default: textOptions.font.default,
        valid: textOptions.font.valid
      },
      plot_label_size_main: {
        displayName: "Value Font Size",
        type: FormattingComponent.NumUpDown,
        default: textOptions.size.default,
        options: textOptions.size.options
      },
      plot_label_colour_main: {
        displayName: "Value Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.standard
      },
      plot_label_prefix_main: {
        displayName: "Value Prefix",
        type: FormattingComponent.TextInput,
        default: ""
      }
    },
    "Target": {
      show_target: {
        displayName: "Show Target",
        type: FormattingComponent.ToggleSwitch,
        default: true
      },
      width_target: {
        displayName: "Line Width",
        type: FormattingComponent.NumUpDown,
        default: 1.5,
        options: { minValue: { value: 0 }, maxValue: { value: 100 } }
      },
      type_target: {
        displayName: "Line Type",
        type: FormattingComponent.Dropdown,
        default: "10 0",
        valid: ["10 0", "10 10", "2 5"],
        items: [
          { displayName : "Solid",  value : "10 0" },
          { displayName : "Dashed", value : "10 10" },
          { displayName : "Dotted", value : "2 5" }
        ]
      },
      colour_target: {
        displayName: "Line Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.standard
      },
      opacity_target: {
        displayName: "Default Opacity",
        type: FormattingComponent.NumUpDown,
        default: 1,
        options: { minValue: { value: 0 }, maxValue: { value: 1 } }
      },
      opacity_unselected_target: {
        displayName: "Opacity if Any Selected",
        type: FormattingComponent.NumUpDown,
        default: 0.2,
        options: { minValue: { value: 0 }, maxValue: { value: 1 } }
      },
      join_rebaselines_target: {
        displayName: "Connect Rebaselined Limits",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      ttip_show_target: {
        displayName: "Show value in tooltip",
        type: FormattingComponent.ToggleSwitch,
        default: true
      },
      ttip_label_target: {
        displayName: "Tooltip Label",
        type: FormattingComponent.TextInput,
        default: "Centerline"
      },
      plot_label_show_target: {
        displayName: "Show Value on Plot",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      plot_label_show_all_target: {
        displayName: "Show Value at all Re-Baselines",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      plot_label_show_n_target: {
        displayName: "Show Value at Last N Re-Baselines",
        type: FormattingComponent.NumUpDown,
        default: 1,
        options: { minValue: { value: 1 } }
      },
      plot_label_position_target: {
        displayName: "Position of Value on Line(s)",
        type: FormattingComponent.Dropdown,
        default: "beside",
        valid: ["above", "below", "beside"],
        items: [
          { displayName : "Above",      value : "above" },
          { displayName : "Below",      value : "below" },
          { displayName : "Beside",     value : "beside" }
        ]
      },
      plot_label_vpad_target: {
        displayName: "Value Vertical Padding",
        type: FormattingComponent.NumUpDown,
        default: 0
      },
      plot_label_hpad_target: {
        displayName: "Value Horizontal Padding",
        type: FormattingComponent.NumUpDown,
        default: 10
      },
      plot_label_font_target: {
        displayName: "Value Font",
        type: FormattingComponent.FontPicker,
        default: textOptions.font.default,
        valid: textOptions.font.valid
      },
      plot_label_size_target: {
        displayName: "Value Font Size",
        type: FormattingComponent.NumUpDown,
        default: textOptions.size.default,
        options: textOptions.size.options
      },
      plot_label_colour_target: {
        displayName: "Value Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.standard
      },
      plot_label_prefix_target: {
        displayName: "Value Prefix",
        type: FormattingComponent.TextInput,
        default: ""
      }
    },
    "Alt. Target": {
      show_alt_target: {
        displayName: "Show Alt. Target Line",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      alt_target: {
        displayName: "Additional Target Value:",
        type: FormattingComponent.NumUpDown,
        default: undefined as number | undefined
      },
      multiplier_alt_target: {
        displayName: "Apply Multiplier to Alt. Target",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      width_alt_target: {
        displayName: "Line Width",
        type: FormattingComponent.NumUpDown,
        default: 1.5,
        options: { minValue: { value: 0 }, maxValue: { value: 100 } }
      },
      type_alt_target: {
        displayName: "Line Type",
        type: FormattingComponent.Dropdown,
        default: "10 0",
        valid: ["10 0", "10 10", "2 5"],
        items: [
          { displayName : "Solid",  value : "10 0" },
          { displayName : "Dashed", value : "10 10" },
          { displayName : "Dotted", value : "2 5" }
        ]
      },
      colour_alt_target: {
        displayName: "Line Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.standard
      },
      opacity_alt_target: {
        displayName: "Default Opacity",
        type: FormattingComponent.NumUpDown,
        default: 1,
        options: { minValue: { value: 0 }, maxValue: { value: 1 } }
      },
      opacity_unselected_alt_target: {
        displayName: "Opacity if Any Selected",
        type: FormattingComponent.NumUpDown,
        default: 0.2,
        options: { minValue: { value: 0 }, maxValue: { value: 1 } }
      },
      join_rebaselines_alt_target: {
        displayName: "Connect Rebaselined Limits",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      ttip_show_alt_target: {
        displayName: "Show value in tooltip",
        type: FormattingComponent.ToggleSwitch,
        default: true
      },
      ttip_label_alt_target: {
        displayName: "Tooltip Label",
        type: FormattingComponent.TextInput,
        default: "Alt. Target"
      },
      plot_label_show_alt_target: {
        displayName: "Show Value on Plot",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      plot_label_show_all_alt_target: {
        displayName: "Show Value at all Re-Baselines",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      plot_label_show_n_alt_target: {
        displayName: "Show Value at Last N Re-Baselines",
        type: FormattingComponent.NumUpDown,
        default: 1,
        options: { minValue: { value: 1 } }
      },
      plot_label_position_alt_target: {
        displayName: "Position of Value on Line(s)",
        type: FormattingComponent.Dropdown,
        default: "beside",
        valid: ["above", "below", "beside"],
        items: [
          { displayName : "Above",      value : "above" },
          { displayName : "Below",      value : "below" },
          { displayName : "Beside",     value : "beside" }
        ]
      },
      plot_label_vpad_alt_target: {
        displayName: "Value Vertical Padding",
        type: FormattingComponent.NumUpDown,
        default: 0
      },
      plot_label_hpad_alt_target: {
        displayName: "Value Horizontal Padding",
        type: FormattingComponent.NumUpDown,
        default: 10
      },
      plot_label_font_alt_target: {
        displayName: "Value Font",
        type: FormattingComponent.FontPicker,
        default: textOptions.font.default,
        valid: textOptions.font.valid
      },
      plot_label_size_alt_target: {
        displayName: "Value Font Size",
        type: FormattingComponent.NumUpDown,
        default: textOptions.size.default,
        options: textOptions.size.options
      },
      plot_label_colour_alt_target: {
        displayName: "Value Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.standard
      },
      plot_label_prefix_alt_target: {
        displayName: "Value Prefix",
        type: FormattingComponent.TextInput,
        default: ""
      }
    },
    "68% Limits": {
      show_68: {
        displayName: "Show 68% Lines",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      width_68: {
        displayName: "Line Width",
        type: FormattingComponent.NumUpDown,
        default: 2,
        options: { minValue: { value: 0 }, maxValue: { value: 100 } }
      },
      type_68: {
        displayName: "Line Type",
        type: FormattingComponent.Dropdown,
        default: "2 5",
        valid: ["10 0", "10 10", "2 5"],
        items: [
          { displayName : "Solid",  value : "10 0" },
          { displayName : "Dashed", value : "10 10" },
          { displayName : "Dotted", value : "2 5" }
        ]
      },
      colour_68: {
        displayName: "Line Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.limits
      },
      opacity_68: {
        displayName: "Default Opacity",
        type: FormattingComponent.NumUpDown,
        default: 1,
        options: { minValue: { value: 0 }, maxValue: { value: 1 } }
      },
      opacity_unselected_68: {
        displayName: "Opacity if Any Selected",
        type: FormattingComponent.NumUpDown,
        default: 0.2,
        options: { minValue: { value: 0 }, maxValue: { value: 1 } }
      },
      join_rebaselines_68: {
        displayName: "Connect Rebaselined Limits",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      ttip_show_68: {
        displayName: "Show value in tooltip",
        type: FormattingComponent.ToggleSwitch,
        default: true
      },
      ttip_label_68: {
        displayName: "Tooltip Label",
        type: FormattingComponent.TextInput,
        default: "68% Limit"
      },
      ttip_label_68_prefix_lower: {
        displayName: "Tooltip Label - Lower Prefix",
        type: FormattingComponent.TextInput,
        default: "Lower "
      },
      ttip_label_68_prefix_upper: {
        displayName: "Tooltip Label - Upper Prefix",
        type: FormattingComponent.TextInput,
        default: "Upper "
      },
      plot_label_show_68: {
        displayName: "Show Value on Plot",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      plot_label_show_all_68: {
        displayName: "Show Value at all Re-Baselines",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      plot_label_show_n_68: {
        displayName: "Show Value at Last N Re-Baselines",
        type: FormattingComponent.NumUpDown,
        default: 1,
        options: { minValue: { value: 1 } }
      },
      plot_label_position_68: {
        displayName: "Position of Value on Line(s)",
        type: FormattingComponent.Dropdown,
        default: "beside",
        valid: ["outside", "inside", "above", "below", "beside"],
        items: [
          { displayName : "Outside",    value : "outside" },
          { displayName : "Inside",     value : "inside" },
          { displayName : "Above",      value : "above" },
          { displayName : "Below",      value : "below" },
          { displayName : "Beside",     value : "beside" }
        ]
      },
      plot_label_vpad_68: {
        displayName: "Value Vertical Padding",
        type: FormattingComponent.NumUpDown,
        default: 0
      },
      plot_label_hpad_68: {
        displayName: "Value Horizontal Padding",
        type: FormattingComponent.NumUpDown,
        default: 10
      },
      plot_label_font_68: {
        displayName: "Value Font",
        type: FormattingComponent.FontPicker,
        default: textOptions.font.default,
        valid: textOptions.font.valid
      },
      plot_label_size_68: {
        displayName: "Value Font Size",
        type: FormattingComponent.NumUpDown,
        default: textOptions.size.default,
        options: textOptions.size.options
      },
      plot_label_colour_68: {
        displayName: "Value Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.standard
      },
      plot_label_prefix_68: {
        displayName: "Value Prefix",
        type: FormattingComponent.TextInput,
        default: ""
      }
    },
    "95% Limits": {
      show_95: {
        displayName: "Show 95% Lines",
        type: FormattingComponent.ToggleSwitch,
        default: true
      },
      width_95: {
        displayName: "Line Width",
        type: FormattingComponent.NumUpDown,
        default: 2,
        options: { minValue: { value: 0 }, maxValue: { value: 100 } }
      },
      type_95: {
        displayName: "Line Type",
        type: FormattingComponent.Dropdown,
        default: "2 5",
        valid: ["10 0", "10 10", "2 5"],
        items: [
          { displayName : "Solid",  value : "10 0" },
          { displayName : "Dashed", value : "10 10" },
          { displayName : "Dotted", value : "2 5" }
        ]
      },
      colour_95: {
        displayName: "Line Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.limits
      },
      opacity_95: {
        displayName: "Default Opacity",
        type: FormattingComponent.NumUpDown,
        default: 1,
        options: { minValue: { value: 0 }, maxValue: { value: 1 } }
      },
      opacity_unselected_95: {
        displayName: "Opacity if Any Selected",
        type: FormattingComponent.NumUpDown,
        default: 0.2,
        options: { minValue: { value: 0 }, maxValue: { value: 1 } }
      },
      join_rebaselines_95: {
        displayName: "Connect Rebaselined Limits",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      ttip_show_95: {
        displayName: "Show value in tooltip",
        type: FormattingComponent.ToggleSwitch,
        default: true
      },
      ttip_label_95: {
        displayName: "Tooltip Label",
        type: FormattingComponent.TextInput,
        default: "95% Limit"
      },
      ttip_label_95_prefix_lower: {
        displayName: "Tooltip Label - Lower Prefix",
        type: FormattingComponent.TextInput,
        default: "Lower "
      },
      ttip_label_95_prefix_upper: {
        displayName: "Tooltip Label - Upper Prefix",
        type: FormattingComponent.TextInput,
        default: "Upper "
      },
      plot_label_show_95: {
        displayName: "Show Value on Plot",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      plot_label_show_all_95: {
        displayName: "Show Value at all Re-Baselines",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      plot_label_show_n_95: {
        displayName: "Show Value at Last N Re-Baselines",
        type: FormattingComponent.NumUpDown,
        default: 1,
        options: { minValue: { value: 1 } }
      },
      plot_label_position_95: {
        displayName: "Position of Value on Line(s)",
        type: FormattingComponent.Dropdown,
        default: "beside",
        valid: ["outside", "inside", "above", "below", "beside"],
        items: [
          { displayName : "Outside",    value : "outside" },
          { displayName : "Inside",     value : "inside" },
          { displayName : "Above",      value : "above" },
          { displayName : "Below",      value : "below" },
          { displayName : "Beside",     value : "beside" }
        ]
      },
      plot_label_vpad_95: {
        displayName: "Value Vertical Padding",
        type: FormattingComponent.NumUpDown,
        default: 0
      },
      plot_label_hpad_95: {
        displayName: "Value Horizontal Padding",
        type: FormattingComponent.NumUpDown,
        default: 10
      },
      plot_label_font_95: {
        displayName: "Value Font",
        type: FormattingComponent.FontPicker,
        default: textOptions.font.default,
        valid: textOptions.font.valid
      },
      plot_label_size_95: {
        displayName: "Value Font Size",
        type: FormattingComponent.NumUpDown,
        default: textOptions.size.default,
        options: textOptions.size.options
      },
      plot_label_colour_95: {
        displayName: "Value Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.standard
      },
      plot_label_prefix_95: {
        displayName: "Value Prefix",
        type: FormattingComponent.TextInput,
        default: ""
      }
    },
    "99% Limits": {
      show_99: {
        displayName: "Show 99% Lines",
        type: FormattingComponent.ToggleSwitch,
        default: true
      },
      width_99: {
        displayName: "Line Width",
        type: FormattingComponent.NumUpDown,
        default: 2,
        options: { minValue: { value: 0 }, maxValue: { value: 100 } }
      },
      type_99: {
        displayName: "Line Type",
        type: FormattingComponent.Dropdown,
        default: "10 10",
        valid: ["10 0", "10 10", "2 5"],
        items: [
          { displayName : "Solid",  value : "10 0" },
          { displayName : "Dashed", value : "10 10" },
          { displayName : "Dotted", value : "2 5" }
        ]
      },
      colour_99: {
        displayName: "Line Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.limits
      },
      opacity_99: {
        displayName: "Default Opacity",
        type: FormattingComponent.NumUpDown,
        default: 1,
        options: { minValue: { value: 0 }, maxValue: { value: 1 } }
      },
      opacity_unselected_99: {
        displayName: "Opacity if Any Selected",
        type: FormattingComponent.NumUpDown,
        default: 0.2,
        options: { minValue: { value: 0 }, maxValue: { value: 1 } }
      },
      join_rebaselines_99: {
        displayName: "Connect Rebaselined Limits",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      ttip_show_99: {
        displayName: "Show value in tooltip",
        type: FormattingComponent.ToggleSwitch,
        default: true
      },
      ttip_label_99: {
        displayName: "Tooltip Label",
        type: FormattingComponent.TextInput,
        default: "99% Limit"
      },
      ttip_label_99_prefix_lower: {
        displayName: "Tooltip Label - Lower Prefix",
        type: FormattingComponent.TextInput,
        default: "Lower "
      },
      ttip_label_99_prefix_upper: {
        displayName: "Tooltip Label - Upper Prefix",
        type: FormattingComponent.TextInput,
        default: "Upper "
      },
      plot_label_show_99: {
        displayName: "Show Value on Plot",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      plot_label_show_all_99: {
        displayName: "Show Value at all Re-Baselines",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      plot_label_show_n_99: {
        displayName: "Show Value at Last N Re-Baselines",
        type: FormattingComponent.NumUpDown,
        default: 1,
        options: { minValue: { value: 1 } }
      },
      plot_label_position_99: {
        displayName: "Position of Value on Line(s)",
        type: FormattingComponent.Dropdown,
        default: "beside",
        valid: ["outside", "inside", "above", "below", "beside"],
        items: [
          { displayName : "Outside",    value : "outside" },
          { displayName : "Inside",     value : "inside" },
          { displayName : "Above",      value : "above" },
          { displayName : "Below",      value : "below" },
          { displayName : "Beside",     value : "beside" }
        ]
      },
      plot_label_vpad_99: {
        displayName: "Value Vertical Padding",
        type: FormattingComponent.NumUpDown,
        default: 0
      },
      plot_label_hpad_99: {
        displayName: "Value Horizontal Padding",
        type: FormattingComponent.NumUpDown,
        default: 10
      },
      plot_label_font_99: {
        displayName: "Value Font",
        type: FormattingComponent.FontPicker,
        default: textOptions.font.default,
        valid: textOptions.font.valid
      },
      plot_label_size_99: {
        displayName: "Value Font Size",
        type: FormattingComponent.NumUpDown,
        default: textOptions.size.default,
        options: textOptions.size.options
      },
      plot_label_colour_99: {
        displayName: "Value Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.standard
      },
      plot_label_prefix_99: {
        displayName: "Value Prefix",
        type: FormattingComponent.TextInput,
        default: ""
      }
    },
    "Specification Limits": {
      show_specification: {
        displayName: "Show Specification Lines",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      specification_upper: {
        displayName: "Upper Specification Limit:",
        type: FormattingComponent.NumUpDown,
        default: undefined as number | undefined
      },
      specification_lower: {
        displayName: "Lower Specification Limit:",
        type: FormattingComponent.NumUpDown,
        default: undefined as number | undefined
      },
      multiplier_specification: {
        displayName: "Apply Multiplier to Specification Limits",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      width_specification: {
        displayName: "Line Width",
        type: FormattingComponent.NumUpDown,
        default: 2,
        options: { minValue: { value: 0 }, maxValue: { value: 100 } }
      },
      type_specification: {
        displayName: "Line Type",
        type: FormattingComponent.Dropdown,
        default: "10 10",
        valid: ["10 0", "10 10", "2 5"],
        items: [
          { displayName : "Solid",  value : "10 0" },
          { displayName : "Dashed", value : "10 10" },
          { displayName : "Dotted", value : "2 5" }
        ]
      },
      colour_specification: {
        displayName: "Line Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.limits
      },
      opacity_specification: {
        displayName: "Default Opacity",
        type: FormattingComponent.NumUpDown,
        default: 1,
        options: { minValue: { value: 0 }, maxValue: { value: 1 } }
      },
      opacity_unselected_specification: {
        displayName: "Opacity if Any Selected",
        type: FormattingComponent.NumUpDown,
        default: 0.2,
        options: { minValue: { value: 0 }, maxValue: { value: 1 } }
      },
      join_rebaselines_specification: {
        displayName: "Connect Rebaselined Limits",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      ttip_show_specification: {
        displayName: "Show value in tooltip",
        type: FormattingComponent.ToggleSwitch,
        default: true
      },
      ttip_label_specification: {
        displayName: "Tooltip Label",
        type: FormattingComponent.TextInput,
        default: "specification Limit"
      },
      ttip_label_specification_prefix_lower: {
        displayName: "Tooltip Label - Lower Prefix",
        type: FormattingComponent.TextInput,
        default: "Lower "
      },
      ttip_label_specification_prefix_upper: {
        displayName: "Tooltip Label - Upper Prefix",
        type: FormattingComponent.TextInput,
        default: "Upper "
      },
      plot_label_show_specification: {
        displayName: "Show Value on Plot",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      plot_label_show_all_specification: {
        displayName: "Show Value at all Re-Baselines",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      plot_label_show_n_specification: {
        displayName: "Show Value at Last N Re-Baselines",
        type: FormattingComponent.NumUpDown,
        default: 1,
        options: { minValue: { value: 1 } }
      },
      plot_label_position_specification: {
        displayName: "Position of Value on Line(s)",
        type: FormattingComponent.Dropdown,
        default: "beside",
        valid: ["outside", "inside", "above", "below", "beside"],
        items: [
          { displayName : "Outside",    value : "outside" },
          { displayName : "Inside",     value : "inside" },
          { displayName : "Above",      value : "above" },
          { displayName : "Below",      value : "below" },
          { displayName : "Beside",     value : "beside" }
        ]
      },
      plot_label_vpad_specification: {
        displayName: "Value Vertical Padding",
        type: FormattingComponent.NumUpDown,
        default: 0
      },
      plot_label_hpad_specification: {
        displayName: "Value Horizontal Padding",
        type: FormattingComponent.NumUpDown,
        default: 10
      },
      plot_label_font_specification: {
        displayName: "Value Font",
        type: FormattingComponent.FontPicker,
        default: textOptions.font.default,
        valid: textOptions.font.valid
      },
      plot_label_size_specification: {
        displayName: "Value Font Size",
        type: FormattingComponent.NumUpDown,
        default: textOptions.size.default,
        options: textOptions.size.options
      },
      plot_label_colour_specification: {
        displayName: "Value Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.standard
      },
      plot_label_prefix_specification: {
        displayName: "Value Prefix",
        type: FormattingComponent.TextInput,
        default: ""
      }
    },
    "Trend": {
      show_trend: {
        displayName: "Show Trend",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      width_trend: {
        displayName: "Line Width",
        type: FormattingComponent.NumUpDown,
        default: 1.5,
        options: { minValue: { value: 0 }, maxValue: { value: 100 } }
      },
      type_trend: {
        displayName: "Line Type",
        type: FormattingComponent.Dropdown,
        default: "10 0",
        valid: ["10 0", "10 10", "2 5"],
        items: [
          { displayName : "Solid",  value : "10 0" },
          { displayName : "Dashed", value : "10 10" },
          { displayName : "Dotted", value : "2 5" }
        ]
      },
      colour_trend: {
        displayName: "Line Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.common_cause
      },
      opacity_trend: {
        displayName: "Default Opacity",
        type: FormattingComponent.NumUpDown,
        default: 1,
        options: { minValue: { value: 0 }, maxValue: { value: 1 } }
      },
      opacity_unselected_trend: {
        displayName: "Opacity if Any Selected",
        type: FormattingComponent.NumUpDown,
        default: 0.2,
        options: { minValue: { value: 0 }, maxValue: { value: 1 } }
      },
      join_rebaselines_trend: {
        displayName: "Connect Rebaselined Limits",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      ttip_show_trend: {
        displayName: "Show value in tooltip",
        type: FormattingComponent.ToggleSwitch,
        default: true
      },
      ttip_label_trend: {
        displayName: "Tooltip Label",
        type: FormattingComponent.TextInput,
        default: "Centerline"
      },
      plot_label_show_trend: {
        displayName: "Show Value on Plot",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      plot_label_show_all_trend: {
        displayName: "Show Value at all Re-Baselines",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      plot_label_show_n_trend: {
        displayName: "Show Value at Last N Re-Baselines",
        type: FormattingComponent.NumUpDown,
        default: 1,
        options: { minValue: { value: 1 } }
      },
      plot_label_position_trend: {
        displayName: "Position of Value on Line(s)",
        type: FormattingComponent.Dropdown,
        default: "beside",
        valid: ["above", "below", "beside"],
        items: [
          { displayName : "Above",      value : "above" },
          { displayName : "Below",      value : "below" },
          { displayName : "Beside",     value : "beside" }
        ]
      },
      plot_label_vpad_trend: {
        displayName: "Value Vertical Padding",
        type: FormattingComponent.NumUpDown,
        default: 0
      },
      plot_label_hpad_trend: {
        displayName: "Value Horizontal Padding",
        type: FormattingComponent.NumUpDown,
        default: 10
      },
      plot_label_font_trend: {
        displayName: "Value Font",
        type: FormattingComponent.FontPicker,
        default: textOptions.font.default,
        valid: textOptions.font.valid
      },
      plot_label_size_trend: {
        displayName: "Value Font Size",
        type: FormattingComponent.NumUpDown,
        default: textOptions.size.default,
        options: textOptions.size.options
      },
      plot_label_colour_trend: {
        displayName: "Value Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.standard
      },
      plot_label_prefix_trend: {
        displayName: "Value Prefix",
        type: FormattingComponent.TextInput,
        default: ""
      }
    }
  }
};

export default linesSettings;
