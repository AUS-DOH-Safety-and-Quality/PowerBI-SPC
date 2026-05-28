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


type UndefinedOrNumT<T> = T extends undefined ? undefined | number : T;

function numberOption<T>(displayName: string, defaultValue: T) {
  return {
    displayName: displayName,
    type: FormattingComponent.NumUpDown,
    default: defaultValue as UndefinedOrNumT<T>
  }
}

function numberOptionMin<T>(displayName: string, defaultValue: T, minValue: number) {
  return {
    displayName: displayName,
    type: FormattingComponent.NumUpDown,
    default: defaultValue as UndefinedOrNumT<T>,
    options: { minValue: { value: minValue } }
  }
}
function numberOptionMinMax<T>(displayName: string, defaultValue: T,
                            minValue: number, maxValue: number) {
  return {
    displayName: displayName,
    type: FormattingComponent.NumUpDown,
    default: defaultValue as UndefinedOrNumT<T>,
    options: { minValue: { value: minValue }, maxValue: { value: maxValue } }
  }
}

function toggleOption(displayName: string, defaultValue: boolean) {
  return {
    displayName: displayName,
    type: FormattingComponent.ToggleSwitch,
    default: defaultValue
  }
}

function paddingOption(displayName: string) {
  return numberOption(displayName, 10);
}

function colourOption(displayName: string, defaultValue: string) {
  return {
    displayName: displayName,
    type: FormattingComponent.ColorPicker,
    default: defaultValue
  }
}

function fontOption(displayName: string) {
  return {
    displayName: displayName,
    type: FormattingComponent.FontPicker,
    default: textOptions.font.default,
    valid: textOptions.font.valid
  }
}

function fontSizeOption(displayName: string) {
  return numberOptionMinMax(displayName, textOptions.size.default, 0, 100);
}



type DropdownItem = { displayName: string; value: string; }
const valueTransforms: Record<string, (x: string) => string> = {
  none: (x: string) => x,
  sentence: (x: string) => x.toLowerCase().replace(/\b\w/g, (char: string) => char.toUpperCase())
};

function dropdownOption(displayName: string, defaultValue: string,
                        validValues: string[], displayTransform?: string,
                        displayNames?: string[]) {
  const numValues: number = validValues.length;
  const rtn = {
    displayName: displayName,
    type: FormattingComponent.Dropdown,
    default: defaultValue,
    valid: validValues,
    items: new Array<DropdownItem>(numValues)
  };

  const transformFun: (x: string) => string = valueTransforms[(displayTransform ?? "none")]

  for (let i: number = 0; i < numValues; i++) {
    rtn.items[i] = {
      displayName: displayNames ? displayNames[i] : transformFun(validValues[i]),
      value: validValues[i]
    }
  }

  return rtn;
}



function lineTypeOption(displayName: string, defaultValue: string) {
  return dropdownOption(displayName, defaultValue, ["10 0", "10 10", "2 5"], "none", ["Solid", "Dashed", "Dotted"])
}

function textOption(displayName: string, defaultValue: string) {
  return {
    displayName: displayName,
    type: FormattingComponent.TextInput,
    default: defaultValue
  }
}



function lineLabelPositionOption() {
  return dropdownOption("Position of Value on Line(s)", "beside",
                        ["outside", "inside", "above", "below", "beside"],
                        "sentence");
}

function borderStyleOption(displayName: string) {
  return {
    displayName: displayName,
    type: FormattingComponent.Dropdown,
    default: borderOptions.style.default,
    valid: borderOptions.style.valid,
    items: borderOptions.style.items
  }
}

function borderWidthOption(displayName: string) {
  return {
    displayName: displayName,
    type: FormattingComponent.NumUpDown,
    default: borderOptions.width.default,
    options: borderOptions.width.options
  }
}

function alignmentOption(displayName: string) {
  return {
    displayName: displayName,
    type: FormattingComponent.AlignmentGroup,
    default: textOptions.text_align.default,
    valid: textOptions.text_align.valid
  }
}

function fontWeightOption(displayName: string) {
  return dropdownOption(
    displayName,
    textOptions.weight.default,
    textOptions.weight.valid,
    "sentence"
  )
}

function textTransformOption(displayName: string) {
  return dropdownOption(
    displayName,
    textOptions.text_transform.default,
    textOptions.text_transform.valid,
    "sentence"
  )
}

export {
  FormattingComponent,
  defaultColours,
  textOptions,
  borderOptions,
  paddingOption,
  colourOption,
  fontOption,
  fontSizeOption,
  lineTypeOption,
  toggleOption,
  numberOption,
  numberOptionMin,
  numberOptionMinMax,
  textOption,
  lineLabelPositionOption,
  dropdownOption,
  borderStyleOption,
  borderWidthOption,
  alignmentOption,
  fontWeightOption,
  textTransformOption
};
