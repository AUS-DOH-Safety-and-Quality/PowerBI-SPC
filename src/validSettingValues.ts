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
    type: "NumUpDown",
    default: 10,
    valid: { numberRange: { min: 0, max: 100 } }
  },
  weight: {
    type: "Dropdown",
    default: "normal",
    valid: ["normal", "bold", "bolder", "lighter"]
  },
  text_transform: {
    type: "Dropdown",
    default: "uppercase",
    valid: ["uppercase", "lowercase", "capitalize", "none"]
  },
  text_overflow: {
    type: "Dropdown",
    default: "ellipsis",
    valid: ["ellipsis", "clip", "none"]
  },
  text_align: {
    type: "Dropdown",
    default: "center",
    valid: ["center", "left", "right"]
  }
}

const lineOptions = {
  type: {
    type: "Dropdown",
    valid: ["10 0", "10 10", "2 5"]
  },
  width: {
    type: "NumUpDown",
    valid: { numberRange: { min: 0, max: 100 } }
  }
}

const iconOptions = {
  location: {
    type: "Dropdown",
    default: "Top Right",
    valid: ["Top Right", "Bottom Right", "Top Left", "Bottom Left"]
  },
  scaling: {
    type: "NumUpDown",
    default: 1,
    valid: { numberRange: { min: 0 } }
  }
}

const colourOptions = {
  improvement: { type: "ColorPicker", default: "#00B0F0" },
  deterioration: { type: "ColorPicker", default: "#E46C0A" },
  neutral_low: { type: "ColorPicker", default: "#490092" },
  neutral_high: { type: "ColorPicker", default: "#490092" },
  common_cause: { type: "ColorPicker", default: "#A6A6A6" },
  limits: { type: "ColorPicker", default: "#6495ED" },
  standard: { type: "ColorPicker", default: "#000000" }
}

const borderOptions = {
  width: {
    type: "NumUpDown",
    default: 1,
    valid: { numberRange: { min: 0 } }
  },
  style: {
    type: "Dropdown",
    default: "solid",
    valid: ["solid", "dotted", "dashed", "double", "groove", "ridge", "inset", "outset", "none"]
  },
  colour: {
    type: "ColorPicker",
    default: "#000000"
  }
}

const labelOptions = {
  limits: { type: "Dropdown", default: "beside", valid: ["outside", "inside", "above", "below", "beside"] },
  standard: { type: "Dropdown", default: "beside", valid: ["above", "below", "beside"] }
}

export {
  textOptions,
  lineOptions,
  iconOptions,
  colourOptions,
  borderOptions,
  labelOptions
}
