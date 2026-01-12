// Shared constants and factory functions for settings

// Re-declare FormattingComponent here to avoid circular dependency
export const enum FormattingComponent {
  AlignmentGroup = "AlignmentGroup",
  ColorPicker = "ColorPicker",
  ConditionalFormattingControl = "ConditionalFormattingControl",
  DatePicker = "DatePicker",
  Dropdown = "Dropdown",
  DurationPicker = "DurationPicker",
  EmptyControl = "EmptyControl",
  ErrorRangeControl = "ErrorRangeControl",
  FieldPicker = "FieldPicker",
  FlagsSelection = "FlagsSelection",
  FontControl = "FontControl",
  FontPicker = "FontPicker",
  GradientBar = "GradientBar",
  ImageUpload = "ImageUpload",
  Link = "Link",
  ListEditor = "ListEditor",
  MarginPadding = "MarginPadding",
  NumUpDown = "NumUpDown",
  ReadOnlyText = "ReadOnlyText",
  SeriesDialogLink = "SeriesDialogLink",
  ShapeMapSelector = "ShapeMapSelector",
  Slider = "Slider",
  TextArea = "TextArea",
  TextInput = "TextInput",
  ToggleSwitch = "ToggleSwitch",
}

export const FONT_LIST = [
  "'Arial', sans-serif",
  "Arial",
  "'Arial Black'",
  "'Arial Unicode MS'",
  "Calibri",
  "Cambria",
  "'Cambria Math'",
  "Candara",
  "'Comic Sans MS'",
  "Consolas",
  "Constantia",
  "Corbel",
  "'Courier New'",
  "wf_standard-font, helvetica, arial, sans-serif",
  "wf_standard-font_light, helvetica, arial, sans-serif",
  "Georgia",
  "'Lucida Sans Unicode'",
  "'Segoe UI', wf_segoe-ui_normal, helvetica, arial, sans-serif",
  "'Segoe UI Light', wf_segoe-ui_light, helvetica, arial, sans-serif",
  "'Segoe UI Semibold', wf_segoe-ui_semibold, helvetica, arial, sans-serif",
  "'Segoe UI Bold', wf_segoe-ui_bold, helvetica, arial, sans-serif",
  "Symbol",
  "Tahoma",
  "'Times New Roman'",
  "'Trebuchet MS'",
  "Verdana",
  "Wingdings"
];

export const LINE_TYPE_ITEMS = [
  { displayName: "Solid", value: "10 0" },
  { displayName: "Dashed", value: "10 10" },
  { displayName: "Dotted", value: "2 5" }
];

export const LINE_TYPE_VALID = ["10 0", "10 10", "2 5"];

export const POSITION_ITEMS_BASIC = [
  { displayName: "Above", value: "above" },
  { displayName: "Below", value: "below" },
  { displayName: "Beside", value: "beside" }
];

export const POSITION_ITEMS_EXTENDED = [
  { displayName: "Outside", value: "outside" },
  { displayName: "Inside", value: "inside" },
  ...POSITION_ITEMS_BASIC
];

export const BORDER_STYLE_ITEMS = [
  { displayName: "Solid", value: "solid" },
  { displayName: "Dashed", value: "dashed" },
  { displayName: "Dotted", value: "dotted" },
  { displayName: "Double", value: "double" },
  { displayName: "Groove", value: "groove" },
  { displayName: "Ridge", value: "ridge" },
  { displayName: "Inset", value: "inset" },
  { displayName: "Outset", value: "outset" }
];

export const BORDER_STYLE_VALID = ["solid", "dotted", "dashed", "double", "groove", "ridge", "inset", "outset", "none"];

// Factory function for line width
export const lineWidth = (displayName: string, defaultValue: number) => ({
  displayName,
  type: FormattingComponent.NumUpDown,
  default: defaultValue,
  options: { minValue: { value: 0 }, maxValue: { value: 100 } }
});

// Factory function for line type
export const lineType = (displayName: string, defaultValue: string) => ({
  displayName,
  type: FormattingComponent.Dropdown,
  default: defaultValue,
  valid: LINE_TYPE_VALID,
  items: LINE_TYPE_ITEMS
});

// Factory function for opacity
export const opacity = (displayName: string, defaultValue: number) => ({
  displayName,
  type: FormattingComponent.NumUpDown,
  default: defaultValue,
  options: { minValue: { value: 0 }, maxValue: { value: 1 } }
});

// Factory function for font picker
export const fontPicker = (displayName: string, defaultValue: string) => ({
  displayName,
  type: FormattingComponent.FontPicker,
  default: defaultValue,
  valid: FONT_LIST
});

// Factory function for font size
export const fontSize = (displayName: string, defaultValue: number) => ({
  displayName,
  type: FormattingComponent.NumUpDown,
  default: defaultValue,
  options: { minValue: { value: 0 }, maxValue: { value: 100 } }
});

// Factory for complete plot label settings
export const createPlotLabelSettings = (
  prefix: string,
  useExtendedPositions: boolean = false
) => {
  const positionItems = useExtendedPositions ? POSITION_ITEMS_EXTENDED : POSITION_ITEMS_BASIC;
  const positionValid = positionItems.map(i => i.value);

  return {
    [`plot_label_show_${prefix}`]: {
      displayName: "Show Value on Plot",
      type: FormattingComponent.ToggleSwitch,
      default: false
    },
    [`plot_label_show_all_${prefix}`]: {
      displayName: "Show Value at all Re-Baselines",
      type: FormattingComponent.ToggleSwitch,
      default: false
    },
    [`plot_label_show_n_${prefix}`]: {
      displayName: "Show Value at Last N Re-Baselines",
      type: FormattingComponent.NumUpDown,
      default: 1,
      options: { minValue: { value: 1 } }
    },
    [`plot_label_position_${prefix}`]: {
      displayName: "Position of Value on Line(s)",
      type: FormattingComponent.Dropdown,
      default: "beside",
      valid: positionValid,
      items: positionItems
    },
    [`plot_label_vpad_${prefix}`]: {
      displayName: "Value Vertical Padding",
      type: FormattingComponent.NumUpDown,
      default: 0
    },
    [`plot_label_hpad_${prefix}`]: {
      displayName: "Value Horizontal Padding",
      type: FormattingComponent.NumUpDown,
      default: 10
    },
    [`plot_label_font_${prefix}`]: fontPicker("Value Font", "'Arial', sans-serif"),
    [`plot_label_size_${prefix}`]: fontSize("Value Font Size", 10),
    [`plot_label_colour_${prefix}`]: {
      displayName: "Value Colour",
      type: FormattingComponent.ColorPicker,
      default: "#000000"
    },
    [`plot_label_prefix_${prefix}`]: {
      displayName: "Value Prefix",
      type: FormattingComponent.TextInput,
      default: ""
    }
  };
};

// Factory for outlier colour settings
export const createOutlierColours = (prefix: string, defaultColours: any) => {
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  return {
    [`${prefix}_colour_improvement`]: {
      displayName: `Imp. ${capitalize(prefix)} Colour`,
      type: FormattingComponent.ColorPicker,
      default: defaultColours.improvement
    },
    [`${prefix}_colour_deterioration`]: {
      displayName: `Det. ${capitalize(prefix)} Colour`,
      type: FormattingComponent.ColorPicker,
      default: defaultColours.deterioration
    },
    [`${prefix}_colour_neutral_low`]: {
      displayName: `Neutral (Low) ${capitalize(prefix)} Colour`,
      type: FormattingComponent.ColorPicker,
      default: defaultColours.neutral_low
    },
    [`${prefix}_colour_neutral_high`]: {
      displayName: `Neutral (High) ${capitalize(prefix)} Colour`,
      type: FormattingComponent.ColorPicker,
      default: defaultColours.neutral_high
    }
  };
};

// Factory for limit line settings (68%, 95%, 99%, specification)
export const createLimitLineSettings = (
  name: string,
  displayName: string,
  defaults: {
    show: boolean;
    width: number;
    type: string;
    colour: string;
    opacity: number;
    opacity_unselected: number;
  },
  hasUpperLower: boolean = true
) => {
  const settings: any = {
    [`show_${name}`]: {
      displayName: `Show ${displayName} Lines`,
      type: FormattingComponent.ToggleSwitch,
      default: defaults.show
    },
    [`width_${name}`]: lineWidth("Line Width", defaults.width),
    [`type_${name}`]: lineType("Line Type", defaults.type),
    [`colour_${name}`]: {
      displayName: "Line Colour",
      type: FormattingComponent.ColorPicker,
      default: defaults.colour
    },
    [`opacity_${name}`]: opacity("Default Opacity", defaults.opacity),
    [`opacity_unselected_${name}`]: opacity("Opacity if Any Selected", defaults.opacity_unselected),
    [`join_rebaselines_${name}`]: {
      displayName: "Connect Rebaselined Limits",
      type: FormattingComponent.ToggleSwitch,
      default: false
    },
    [`ttip_show_${name}`]: {
      displayName: "Show value in tooltip",
      type: FormattingComponent.ToggleSwitch,
      default: true
    },
    [`ttip_label_${name}`]: {
      displayName: "Tooltip Label",
      type: FormattingComponent.TextInput,
      default: `${displayName} Limit`
    }
  };

  if (hasUpperLower) {
    settings[`ttip_label_${name}_prefix_lower`] = {
      displayName: "Tooltip Label - Lower Prefix",
      type: FormattingComponent.TextInput,
      default: "Lower "
    };
    settings[`ttip_label_${name}_prefix_upper`] = {
      displayName: "Tooltip Label - Upper Prefix",
      type: FormattingComponent.TextInput,
      default: "Upper "
    };
  }

  return {
    ...settings,
    ...createPlotLabelSettings(name, hasUpperLower)
  };
};

// Factory for single line settings (main, target, alt_target, trend)
export const createSingleLineSettings = (
  name: string,
  displayName: string,
  defaults: {
    show: boolean;
    width: number;
    type: string;
    colour: string;
    opacity: number;
    opacity_unselected: number;
    tooltip_label?: string;
  },
  includeTooltip: boolean = false
) => {
  const settings: any = {
    [`show_${name}`]: {
      displayName: `Show ${displayName}`,
      type: FormattingComponent.ToggleSwitch,
      default: defaults.show
    },
    [`width_${name}`]: lineWidth(`${displayName === "Main Line" ? "Main Line Width" : "Line Width"}`, defaults.width),
    [`type_${name}`]: lineType(`${displayName === "Main Line" ? "Main Line Type" : "Line Type"}`, defaults.type),
    [`colour_${name}`]: {
      displayName: `${displayName === "Main Line" ? "Main Line Colour" : "Line Colour"}`,
      type: FormattingComponent.ColorPicker,
      default: defaults.colour
    },
    [`opacity_${name}`]: opacity("Default Opacity", defaults.opacity),
    [`opacity_unselected_${name}`]: opacity(`Opacity if Any Selected`, defaults.opacity_unselected),
    [`join_rebaselines_${name}`]: {
      displayName: "Connect Rebaselined Limits",
      type: FormattingComponent.ToggleSwitch,
      default: false
    }
  };

  if (includeTooltip) {
    settings[`ttip_show_${name}`] = {
      displayName: "Show value in tooltip",
      type: FormattingComponent.ToggleSwitch,
      default: true
    };
    settings[`ttip_label_${name}`] = {
      displayName: "Tooltip Label",
      type: FormattingComponent.TextInput,
      default: defaults.tooltip_label || displayName
    };
  }

  return {
    ...settings,
    ...createPlotLabelSettings(name, false)
  };
};
