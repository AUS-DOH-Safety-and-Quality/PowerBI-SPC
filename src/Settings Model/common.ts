const enum FormattingComponent {
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
};

const defaultColours = {
  improvement: "#00B0F0",
  deterioration: "#E46C0A",
  neutral_low: "#490092",
  neutral_high: "#490092",
  common_cause: "#A6A6A6",
  limits: "#6495ED",
  standard: "#000000"
};

const textOptions = {
  font: {
    type: "Dropdown",
    default: "'Arial', sans-serif",
    valid: [
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
    ]
  },
  size: {
    default: 10,
    options: { minValue: { value: 0 }, maxValue: { value: 100 } }
  },
  weight: {
    default: "normal",
    valid: ["normal", "bold", "bolder", "lighter"]
  },
  text_transform: {
    default: "uppercase",
    valid: ["uppercase", "lowercase", "capitalize", "none"]
  },
  text_overflow: {
    default: "ellipsis",
    valid: ["ellipsis", "clip", "none"]
  },
  text_align: {
    default: "center",
    valid: ["center", "left", "right"]
  }
};

const borderOptions = {
  width: {
    default: 1,
    options: { minValue: { value: 0 } }
  },
  style: {
    default: "solid",
    valid: ["solid", "dotted", "dashed", "double", "groove", "ridge", "inset", "outset", "none"],
    items: [
      { displayName: "Solid", value: "solid" },
      { displayName: "Dashed", value: "dashed" },
      { displayName: "Dotted", value: "dotted" },
      { displayName: "Double", value: "double" },
      { displayName: "Groove", value: "groove" },
      { displayName: "Ridge", value: "ridge" },
      { displayName: "Inset", value: "inset" },
      { displayName: "Outset", value: "outset" }
    ]
  },
  colour: {
    default: "#000000"
  }
};

const lineOptions = {
  type: {
    valid: ["10 0", "10 10", "2 5"],
    items: [
      { displayName: "Solid", value: "10 0" },
      { displayName: "Dashed", value: "10 10" },
      { displayName: "Dotted", value: "2 5" }
    ]
  }
};

export {
  FormattingComponent,
  defaultColours,
  textOptions,
  borderOptions,
  lineOptions
};
