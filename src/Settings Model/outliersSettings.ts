import { defaultColours, colourOption, numberOptionMin, toggleOption, dropdownOption } from "./common";

const outliersSettings = {
  description: "Outlier Settings",
  displayName: "Outlier Settings",
  settingsGroups: {
    "General" : {
      process_flag_type: dropdownOption("Type of Change to Flag", "both", ["both", "improvement", "deterioration"], "sentence"),
      improvement_direction: dropdownOption("Improvement Direction", "increase", ["increase", "neutral", "decrease"], "sentence")
    },
    "Astronomical Points" : {
      astronomical: toggleOption("Highlight Astronomical Points", false),
      astronomical_limit: dropdownOption("Limit for Astronomical Points", "3 Sigma", ["1 Sigma", "2 Sigma", "3 Sigma", "Specification"]),
      ast_colour_improvement: colourOption("Imp. Ast. Colour", defaultColours.improvement),
      ast_colour_deterioration: colourOption("Det. Ast. Colour", defaultColours.deterioration),
      ast_colour_neutral_low: colourOption("Neutral (Low) Ast. Colour", defaultColours.neutral_low),
      ast_colour_neutral_high: colourOption("Neutral (High) Ast. Colour", defaultColours.neutral_high)
    },
    "Shifts": {
      shift: toggleOption("Highlight Shifts", false),
      shift_n: numberOptionMin("Shift Points", 7, 1),
      shift_colour_improvement: colourOption("Imp. Shift Colour", defaultColours.improvement),
      shift_colour_deterioration: colourOption("Det. Shift Colour", defaultColours.deterioration),
      shift_colour_neutral_low: colourOption("Neutral (Low) Shift Colour", defaultColours.neutral_low),
      shift_colour_neutral_high: colourOption("Neutral (High) Shift Colour", defaultColours.neutral_high)
    },
    "Trends": {
      trend: toggleOption("Highlight Trends", false),
      trend_n: numberOptionMin("Trend Points", 5, 1),
      trend_colour_improvement: colourOption("Imp. Trend Colour", defaultColours.improvement),
      trend_colour_deterioration: colourOption("Det. Trend Colour", defaultColours.deterioration),
      trend_colour_neutral_low: colourOption("Neutral (Low) Trend Colour", defaultColours.neutral_low),
      trend_colour_neutral_high: colourOption("Neutral (High) Trend Colour", defaultColours.neutral_high)
    },
    "Two-In-Three": {
      two_in_three: toggleOption("Highlight Two-in-Three", false),
      two_in_three_highlight_series: toggleOption("Highlight all in Pattern", false),
      two_in_three_limit: dropdownOption("Warning Limit for Two-in-Three", "2 Sigma", ["1 Sigma", "2 Sigma", "3 Sigma", "Specification"]),
      twointhree_colour_improvement: colourOption("Imp. Two-in-Three Colour", defaultColours.improvement),
      twointhree_colour_deterioration: colourOption("Det. Two-in-Three Colour", defaultColours.deterioration),
      twointhree_colour_neutral_low: colourOption("Neutral (Low) Two-in-Three Colour", defaultColours.neutral_low),
      twointhree_colour_neutral_high: colourOption("Neutral (High) Two-in-Three Colour", defaultColours.neutral_high)
    }
  }
};

export default outliersSettings;
