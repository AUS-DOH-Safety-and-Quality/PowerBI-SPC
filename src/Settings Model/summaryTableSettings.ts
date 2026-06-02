import {
  toggleOption, numberOption,
  fontOption, fontSizeOption, colourOption, dropdownOption,
  borderStyleOption, borderWidthOption, alignmentOption,
  fontWeightOption, textTransformOption
} from "./common";

const summaryTableSettings = {
  description: "Summary Table Settings",
  displayName: "Summary Table Settings",
  settingsGroups: {
    "General": {
      show_table: toggleOption("Show Summary Table", false),
      table_variation_filter: dropdownOption(
        "Filter by Variation Type", "all",
        ["all", "common", "special", "improvement", "deterioration", "neutral"], "none",
        [
          "All", "Common Cause", "Special Cause - Any", "Special Cause - Improvement",
          "Special Cause - Deterioration", "Special Cause - Neutral"
        ]
      ),
      table_assurance_filter: dropdownOption(
        "Filter by Assurance Type", "all", ["all", "any", "pass", "fail", "inconsistent"], "none",
        ["All", "Consistent - Any", "Consistent Pass", "Consistent Fail", "Inconsistent"]
      ),
      table_text_overflow: dropdownOption("Text Overflow Handling", "ellipsis", ["ellipsis", "clip", "none"], "sentence"),
      table_opacity: numberOption("Default Opacity", 1, { min: 0, max: 1 }),
      table_opacity_selected: numberOption("Opacity if Selected", 1, { min: 0, max: 1 }),
      table_opacity_unselected: numberOption("Opacity if Unselected", 0.2, { min: 0, max: 1 }),
      table_outer_border_style: borderStyleOption("Outer Border Style"),
      table_outer_border_width: borderWidthOption("Outer Border Width"),
      table_outer_border_colour: colourOption("Outer Border Colour", "standard"),
      table_outer_border_top: toggleOption("Outer Border Top", true),
      table_outer_border_bottom: toggleOption("Outer Border Bottom", true),
      table_outer_border_left: toggleOption("Outer Border Left", true),
      table_outer_border_right: toggleOption("Outer Border Right", true)
    },
    "Header": {
      table_header_font: fontOption("Header Font"),
      table_header_size: fontSizeOption("Header Font Size"),
      table_header_text_align: alignmentOption("Text Alignment"),
      table_header_font_weight: fontWeightOption("Header Font Weight"),
      table_header_text_transform: textTransformOption("Header Text Transform"),
      table_header_text_padding: numberOption("Padding Around Text", 1, { min: 0, max: 100 }),
      table_header_colour: colourOption("Header Font Colour", "standard"),
      table_header_bg_colour: colourOption("Header Background Colour", "lightgray"),
      table_header_border_style: borderStyleOption("Header Border Style"),
      table_header_border_width: borderWidthOption("Header Border Width"),
      table_header_border_colour: colourOption("Header Border Colour", "standard"),
      table_header_border_bottom: toggleOption("Bottom Border", true),
      table_header_border_inner: toggleOption("Inner Borders", true)
    },
    "Body": {
      table_body_font: fontOption("Body Font"),
      table_body_size: fontSizeOption("Body Font Size"),
      table_body_text_align: alignmentOption("Text Alignment"),
      table_body_font_weight: fontWeightOption("Font Weight"),
      table_body_text_transform: textTransformOption("Text Transform"),
      table_body_text_padding: numberOption("Padding Around Text", 1, { min: 0, max: 100 }),
      table_body_colour: colourOption("Body Font Colour", "standard"),
      table_body_bg_colour: colourOption("Body Background Colour", "white"),
      table_body_border_style: borderStyleOption("Body Border Style"),
      table_body_border_width: borderWidthOption("Body Border Width"),
      table_body_border_colour: colourOption("Body Border Colour", "standard"),
      table_body_border_top_bottom: toggleOption("Top/Bottom Borders", true),
      table_body_border_left_right: toggleOption("Left/Right Borders", true)
    }
  }
};

export default summaryTableSettings;
