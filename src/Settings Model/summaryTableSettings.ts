import { FormattingComponent, textOptions, borderOptions, defaultColours } from "./common";

const summaryTableSettings = {
  description: "Summary Table Settings",
  displayName: "Summary Table Settings",
  settingsGroups: {
    "General": {
      show_table: {
        displayName: "Show Summary Table",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      table_variation_filter: {
        displayName: "Filter by Variation Type",
        type: FormattingComponent.Dropdown,
        default: "all",
        valid: ["all", "common", "special", "improvement", "deterioration", "neutral"],
        items: [
          { displayName : "All",                           value : "all" },
          { displayName : "Common Cause",                  value : "common" },
          { displayName : "Special Cause - Any",           value : "special" },
          { displayName : "Special Cause - Improvement",   value : "improvement" },
          { displayName : "Special Cause - Deterioration", value : "deterioration" },
          { displayName : "Special Cause - Neutral",       value : "neutral" }
        ]
      },
      table_assurance_filter: {
        displayName: "Filter by Assurance Type",
        type: FormattingComponent.Dropdown,
        default: "all",
        valid: ["all", "any", "pass", "fail", "inconsistent"],
        items: [
          { displayName : "All",                           value : "all" },
          { displayName : "Consistent - Any",               value : "any" },
          { displayName : "Consistent Pass",               value : "pass" },
          { displayName : "Consistent Fail",               value : "fail" },
          { displayName : "Inconsistent",                  value : "inconsistent" }
        ]
      },
      table_text_overflow: {
        displayName: "Text Overflow Handling",
        type: FormattingComponent.Dropdown,
        default: textOptions.text_overflow.default,
        valid: textOptions.text_overflow.valid,
        items: [
          { displayName : "Ellipsis", value : "ellipsis" },
          { displayName : "Truncate",     value : "clip" },
          { displayName : "None",     value : "none" }
        ]
      },
      table_opacity: {
        displayName: "Default Opacity",
        type: FormattingComponent.NumUpDown,
        default: 1,
        options: { minValue: { value: 0 }, maxValue: { value: 1 } }
      },
      table_opacity_selected: {
        displayName: "Opacity if Selected",
        type: FormattingComponent.NumUpDown,
        default: 1,
        options: { minValue: { value: 0 }, maxValue: { value: 1 } }
      },
      table_opacity_unselected: {
        displayName: "Opacity if Unselected",
        type: FormattingComponent.NumUpDown,
        default: 0.2,
        options: { minValue: { value: 0 }, maxValue: { value: 1 } }
      },
      table_outer_border_style: {
        displayName: "Outer Border Style",
        type: FormattingComponent.Dropdown,
        default: borderOptions.style.default,
        valid: borderOptions.style.valid,
        items: borderOptions.style.items
      },
      table_outer_border_width: {
        displayName: "Outer Border Width",
        type: FormattingComponent.NumUpDown,
        default: borderOptions.width.default,
        options: borderOptions.width.options
      },
      table_outer_border_colour: {
        displayName: "Outer Border Colour",
        type: FormattingComponent.ColorPicker,
        default: borderOptions.colour.default,
      },
      table_outer_border_top: {
        displayName: "Outer Border Top",
        type: FormattingComponent.ToggleSwitch,
        default: true
      },
      table_outer_border_bottom: {
        displayName: "Outer Border Bottom",
        type: FormattingComponent.ToggleSwitch,
        default: true
      },
      table_outer_border_left: {
        displayName: "Outer Border Left",
        type: FormattingComponent.ToggleSwitch,
        default: true
      },
      table_outer_border_right: {
        displayName: "Outer Border Right",
        type: FormattingComponent.ToggleSwitch,
        default: true
      }
    },
    "Header": {
      table_header_font: {
        displayName: "Header Font",
        type: FormattingComponent.FontPicker,
        default: textOptions.font.default,
        valid: textOptions.font.valid
      },
      table_header_size: {
        displayName: "Header Font Size",
        type: FormattingComponent.NumUpDown,
        default: textOptions.size.default,
        options: { minValue: { value: 0 }, maxValue: { value: 100 } }
      },
      table_header_text_align: {
        displayName: "Text Alignment",
        type: FormattingComponent.AlignmentGroup,
        default: textOptions.text_align.default,
        valid: textOptions.text_align.valid
      },
      table_header_font_weight: {
        displayName: "Header Font Weight",
        type: FormattingComponent.Dropdown,
        default: textOptions.weight.default,
        valid: textOptions.weight.valid,
        items: [
          { displayName : "Normal", value : "normal" },
          { displayName : "Bold",   value : "bold" }
        ]
      },
      table_header_text_transform: {
        displayName: "Header Text Transform",
        type: FormattingComponent.Dropdown,
        default: textOptions.text_transform.default,
        valid: textOptions.text_transform.valid,
        items: [
          { displayName : "Uppercase",   value : "uppercase" },
          { displayName : "Lowercase",   value : "lowercase" },
          { displayName : "Capitalise",  value : "capitalize" },
          { displayName : "None",        value : "none" }
        ]
      },
      table_header_text_padding: {
        displayName: "Padding Around Text",
        type: FormattingComponent.NumUpDown,
        default: 1,
        options: { minValue: { value: 0 }, maxValue: { value: 100 } }
      },
      table_header_colour: {
        displayName: "Header Font Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.standard
      },
      table_header_bg_colour: {
        displayName: "Header Background Colour",
        type: FormattingComponent.ColorPicker,
        default: "#D3D3D3"
      },
      table_header_border_style: {
        displayName: "Header Border Style",
        type: FormattingComponent.Dropdown,
        default: borderOptions.style.default,
        valid: borderOptions.style.valid,
        items: borderOptions.style.items
      },
      table_header_border_width: {
        displayName: "Header Border Width",
        type: FormattingComponent.NumUpDown,
        default: borderOptions.width.default,
        options: borderOptions.width.options
      },
      table_header_border_colour: {
        displayName: "Header Border Colour",
        type: FormattingComponent.ColorPicker,
        default: borderOptions.colour.default,
      },
      table_header_border_bottom: {
        displayName: "Bottom Border",
        type: FormattingComponent.ToggleSwitch,
        default: true
      },
      table_header_border_inner: {
        displayName: "Inner Borders",
        type: FormattingComponent.ToggleSwitch,
        default: true
      }
    },
    "Body": {
      table_body_font: {
        displayName: "Body Font",
        type: FormattingComponent.FontPicker,
        default: textOptions.font.default,
        valid: borderOptions.style.items
      },
      table_body_size: {
        displayName: "Body Font Size",
        type: FormattingComponent.NumUpDown,
        default: textOptions.size.default,
        options: { minValue: { value: 0 }, maxValue: { value: 100 } }
      },
      table_body_text_align: {
        displayName: "Text Alignment",
        type: FormattingComponent.AlignmentGroup,
        default: textOptions.text_align.default,
        valid: textOptions.text_align.valid
      },
      table_body_font_weight: {
        displayName: "Font Weight",
        type: FormattingComponent.Dropdown,
        default: textOptions.weight.default,
        valid: textOptions.weight.valid,
        items: [
          { displayName : "Normal", value : "normal" },
          { displayName : "Bold",   value : "bold" }
        ]
      },
      table_body_text_transform: {
        displayName: "Text Transform",
        type: FormattingComponent.Dropdown,
        default: textOptions.text_transform.default,
        valid: textOptions.text_transform.valid,
        items: [
          { displayName : "Uppercase",   value : "uppercase" },
          { displayName : "Lowercase",   value : "lowercase" },
          { displayName : "Capitalise",  value : "capitalize" },
          { displayName : "None",        value : "none" }
        ]
      },
      table_body_text_padding: {
        displayName: "Padding Around Text",
        type: FormattingComponent.NumUpDown,
        default: 1,
        options: { minValue: { value: 0 }, maxValue: { value: 100 } }
      },
      table_body_colour: {
        displayName: "Body Font Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.standard
      },
      table_body_bg_colour: {
        displayName: "Body Background Colour",
        type: FormattingComponent.ColorPicker,
        default: "#FFFFFF"
      },
      table_body_border_style: {
        displayName: "Body Border Style",
        type: FormattingComponent.Dropdown,
        default: borderOptions.style.default,
        valid: borderOptions.style.valid,
        items: borderOptions.style.items
      },
      table_body_border_width: {
        displayName: "Body Border Width",
        type: FormattingComponent.NumUpDown,
        default: borderOptions.width.default,
        options: borderOptions.width.options
      },
      table_body_border_colour: {
        displayName: "Body Border Colour",
        type: FormattingComponent.ColorPicker,
        default: borderOptions.colour.default,
      },
      table_body_border_top_bottom: {
        displayName: "Top/Bottom Borders",
        type: FormattingComponent.ToggleSwitch,
        default: true
      },
      table_body_border_left_right: {
        displayName: "Left/Right Borders",
        type: FormattingComponent.ToggleSwitch,
        default: true
      }
    }
  }
};

export default summaryTableSettings;
