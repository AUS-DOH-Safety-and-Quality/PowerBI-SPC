import {
  toggleOption, numberOption,
  fontOption, fontSizeOption, colourOption, dropdownOption,
  borderStyleOption, borderWidthOption,
  fontWeightOption, textTransformOption
} from "powerbi-visuals-core/settings";

/** Auto aligns numbers right, text left and icons centrally */
function textAlignOption(displayName: string, description: string) {
  return dropdownOption(displayName, description, "auto", ["auto", "left", "center", "right"], "sentence");
}

const summaryTableSettings = {
  description: "Summary Table Settings",
  displayName: "Summary Table Settings",
  settingsGroups: {
    "General": {
      show_table: toggleOption("Show Summary Table",
                               "Shows the points as a table instead of a chart. Data with more than one summary table group "
                               + "is always shown as a table.", false),
      table_variation_filter: dropdownOption(
        "Filter by Variation Type", "Shows only the groups whose variation icon matches.", "all",
        ["all", "common", "special", "improvement", "deterioration", "neutral"], "none",
        [
          "All", "Common Cause", "Special Cause - Any", "Special Cause - Improvement",
          "Special Cause - Deterioration", "Special Cause - Neutral"
        ]
      ),
      table_assurance_filter: dropdownOption(
        "Filter by Assurance Type", "Shows only the groups whose assurance icon matches.", "all", ["all", "any", "pass", "fail", "inconsistent"], "none",
        ["All", "Consistent - Any", "Consistent Pass", "Consistent Fail", "Inconsistent"]
      ),
      table_text_overflow: dropdownOption("Text Overflow Handling",
                                          "Text too long for its column: ellipsis or clip cuts it short, none lets it wrap.",
                                          "none", ["ellipsis", "clip", "none"], "sentence"),
      table_opacity: numberOption("Default Opacity", "Row opacity while nothing is selected.", 1, { min: 0, max: 1 }),
      table_opacity_selected: numberOption("Opacity if Selected", "Opacity of selected rows while a selection is active.", 1, { min: 0, max: 1 }),
      table_opacity_unselected: numberOption("Opacity if Unselected", "Opacity of the other rows while a selection is active.",
                                             0.2, { min: 0, max: 1 }),
      table_outer_border_style: borderStyleOption("Outer Border Style", "Line style of the border around the table.", "none"),
      table_outer_border_width: borderWidthOption("Outer Border Width", "Width of the border around the table, in pixels."),
      table_outer_border_colour: colourOption("Outer Border Colour", "Colour of the border around the table.", "standard"),
      table_outer_border_top: toggleOption("Outer Border Top", "Draws the top of the border around the table.", true),
      table_outer_border_bottom: toggleOption("Outer Border Bottom", "Draws the bottom of the border around the table.", true),
      table_outer_border_left: toggleOption("Outer Border Left", "Draws the left side of the border around the table.", true),
      table_outer_border_right: toggleOption("Outer Border Right", "Draws the right side of the border around the table.", true)
    },
    "Header": {
      table_header_font: fontOption("Header Font", "Font of the column headers."),
      table_header_size: fontSizeOption("Header Font Size", "Font size of the column headers, in pixels."),
      table_header_text_align: textAlignOption("Text Alignment",
                                               "Alignment of the headers; auto puts numbers right, text left and icons in the centre."),
      table_header_font_weight: fontWeightOption("Header Font Weight", "Font weight of the column headers.", "bold"),
      table_header_text_transform: textTransformOption("Header Text Transform", "Changes the case of the column headers."),
      table_header_text_padding: numberOption("Padding Around Text", "Space around each header, in pixels.", 3, { min: 0, max: 100 }),
      table_header_colour: colourOption("Header Font Colour", "Colour of the column headers.", "standard"),
      table_header_bg_colour: colourOption("Header Background Colour", "Background colour of the header row.", "white"),
      table_header_border_style: borderStyleOption("Header Border Style", "Line style of the header borders."),
      table_header_border_width: borderWidthOption("Header Border Width", "Width of the header borders, in pixels."),
      table_header_border_colour: colourOption("Header Border Colour", "Colour of the header borders.", "standard"),
      table_header_border_bottom: toggleOption("Bottom Border", "Draws a border under the header row.", true),
      table_header_border_inner: toggleOption("Inner Borders", "Draws borders between the headers.", false)
    },
    "Body": {
      table_body_font: fontOption("Body Font", "Font of the table cells."),
      table_body_size: fontSizeOption("Body Font Size", "Font size of the table cells, in pixels."),
      table_body_text_align: textAlignOption("Text Alignment",
                                             "Alignment of the cells; auto puts numbers right, text left and icons in the centre."),
      table_body_font_weight: fontWeightOption("Font Weight", "Font weight of the table cells."),
      table_body_text_transform: textTransformOption("Text Transform", "Changes the case of the table cells."),
      table_body_text_padding: numberOption("Padding Around Text", "Space around each cell's text, in pixels.", 3, { min: 0, max: 100 }),
      table_body_colour: colourOption("Body Font Colour", "Colour of the cell text.", "standard"),
      table_body_bg_colour: colourOption("Body Background Colour", "Background colour of the rows.", "white"),
      table_body_border_style: borderStyleOption("Body Border Style", "Line style of the cell borders."),
      table_body_border_width: borderWidthOption("Body Border Width", "Width of the cell borders, in pixels."),
      table_body_border_colour: colourOption("Body Border Colour", "Colour of the cell borders.", "lightgray"),
      table_body_border_top_bottom: toggleOption("Top/Bottom Borders", "Draws borders between rows.", true),
      table_body_border_left_right: toggleOption("Left/Right Borders", "Draws borders between columns.", false)
    }
  }
};

export default summaryTableSettings;
