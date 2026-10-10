import { colourOption, numberOption, toggleOption, dropdownOption, flagDirectionOptions } from "powerbi-visuals-core/settings";

const outliersSettings = {
  description: "Outlier Settings",
  displayName: "Outlier Settings",
  settingsGroups: {
    "General" : flagDirectionOptions(),
    "Astronomical Points" : {
      astronomical: toggleOption("Highlight Astronomical Points", "Flags points beyond the chosen limit.", false),
      astronomical_limit: dropdownOption("Limit for Astronomical Points",
                                         "Limit a point must be beyond. Specification needs the specification lines shown.",
                                         "3 Sigma", ["1 Sigma", "2 Sigma", "3 Sigma", "Specification"]),
      ast_colour_improvement: colourOption("Imp. Ast. Colour", "Colour for astronomical points that are an improvement.", "improvement"),
      ast_colour_deterioration: colourOption("Det. Ast. Colour", "Colour for astronomical points that are a deterioration.", "deterioration"),
      ast_colour_neutral_low: colourOption("Neutral (Low) Ast. Colour",
                                           "Colour for points beyond the lower limit when the improvement direction is neutral.", "neutral_low"),
      ast_colour_neutral_high: colourOption("Neutral (High) Ast. Colour",
                                            "Colour for points beyond the upper limit when the improvement direction is neutral.", "neutral_high")
    },
    "Shifts": {
      shift: toggleOption("Highlight Shifts", "Flags runs of points on one side of the centreline.", false),
      shift_n: numberOption("Shift Points", "Points needed for a shift; points on the centreline neither count nor break it.",
                            7, { min: 1, integer: true }),
      shift_colour_improvement: colourOption("Imp. Shift Colour", "Colour for shifts that are an improvement.", "improvement"),
      shift_colour_deterioration: colourOption("Det. Shift Colour", "Colour for shifts that are a deterioration.", "deterioration"),
      shift_colour_neutral_low: colourOption("Neutral (Low) Shift Colour",
                                             "Colour for shifts below the centreline when the improvement direction is neutral.", "neutral_low"),
      shift_colour_neutral_high: colourOption("Neutral (High) Shift Colour",
                                              "Colour for shifts above the centreline when the improvement direction is neutral.", "neutral_high")
    },
    "Trends": {
      trend: toggleOption("Highlight Trends", "Flags runs of steadily rising or falling points.", false),
      trend_n: numberOption("Trend Points", "Points needed for a trend, including its first; repeated values count once.",
                            5, { min: 2, integer: true }),
      trend_colour_improvement: colourOption("Imp. Trend Colour", "Colour for trends that are an improvement.", "improvement"),
      trend_colour_deterioration: colourOption("Det. Trend Colour", "Colour for trends that are a deterioration.", "deterioration"),
      trend_colour_neutral_low: colourOption("Neutral (Low) Trend Colour",
                                             "Colour for falling trends when the improvement direction is neutral.", "neutral_low"),
      trend_colour_neutral_high: colourOption("Neutral (High) Trend Colour",
                                              "Colour for rising trends when the improvement direction is neutral.", "neutral_high")
    },
    "Two-In-Three": {
      two_in_three: toggleOption("Highlight Two-in-Three", "Flags two of three consecutive points beyond the same warning limit.", false),
      two_in_three_highlight_series: toggleOption("Highlight all in Pattern",
                                                  "Also flags the third point in the window, unless it is beyond the opposite limit.", false),
      two_in_three_limit: dropdownOption("Warning Limit for Two-in-Three",
                                         "Limit the points must be beyond. Specification needs the specification lines shown.",
                                         "2 Sigma", ["1 Sigma", "2 Sigma", "3 Sigma", "Specification"]),
      twointhree_colour_improvement: colourOption("Imp. Two-in-Three Colour",
                                                  "Colour for two-in-three points that are an improvement.", "improvement"),
      twointhree_colour_deterioration: colourOption("Det. Two-in-Three Colour",
                                                    "Colour for two-in-three points that are a deterioration.", "deterioration"),
      twointhree_colour_neutral_low: colourOption("Neutral (Low) Two-in-Three Colour",
                                                  "Colour for two-in-three patterns at the lower limit when the improvement direction is neutral.", "neutral_low"),
      twointhree_colour_neutral_high: colourOption("Neutral (High) Two-in-Three Colour",
                                                   "Colour for two-in-three patterns at the upper limit when the improvement direction is neutral.", "neutral_high")
    }
  }
};

export default outliersSettings;
