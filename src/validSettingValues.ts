const textOptions = {
  font: {
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
    valid: { numberRange: { min: 0, max: 100 } }
  },
}

const lineOptions = {
  type: {
    valid: ["10 0", "10 10", "2 5"]
  },
  width: {
    valid: { numberRange: { min: 0, max: 100 } }
  }
}

const iconOptions = {
  location: {
    default: "Top Right",
    valid: ["Top Right", "Bottom Right", "Top Left", "Bottom Left"]
  },
  scaling: {
    default: 1,
    valid: { numberRange: { min: 0 } }
  }
}

const colourOptions = {
  improvement: { default: "#00B0F0" },
  deterioration: { default: "#E46C0A" },
  neutral_low: { default: "#490092" },
  neutral_high: { default: "#490092" },
  limits: { default: "#6495ED" },
  standard: { default: "#000000" }
}

export {
  textOptions,
  lineOptions,
  iconOptions,
  colourOptions
}
