import { FormattingComponent, defaultColours } from "./common";

const outliersSettings = {
  description: "Outlier Settings",
  displayName: "Outlier Settings",
  settingsGroups: {
    "General" : {
      process_flag_type: {
        displayName: "Type of Change to Flag",
        type: FormattingComponent.Dropdown,
        default: "both",
        valid: ["both", "improvement", "deterioration"],
        items: [
          { displayName : "Both",                 value : "both" },
          { displayName : "Improvement (Imp.)",   value : "improvement" },
          { displayName : "Deterioration (Det.)", value : "deterioration" }
        ]
      },
      improvement_direction: {
        displayName: "Improvement Direction",
        type: FormattingComponent.Dropdown,
        default: "increase",
        valid: ["increase", "neutral", "decrease"],
        items: [
          { displayName : "Increase", value : "increase" },
          { displayName : "Neutral",  value : "neutral" },
          { displayName : "Decrease", value : "decrease" }
        ]
      }
    },
    "Astronomical Points" : {
      astronomical: {
        displayName: "Highlight Astronomical Points",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      astronomical_limit: {
        displayName: "Limit for Astronomical Points",
        type: FormattingComponent.Dropdown,
        default: "3 Sigma",
        valid: ["1 Sigma", "2 Sigma", "3 Sigma", "Specification"],
        items: [
          { displayName : "1 Sigma", value : "1 Sigma" },
          { displayName : "2 Sigma", value : "2 Sigma" },
          { displayName : "3 Sigma", value : "3 Sigma" },
          { displayName : "Specification", value : "Specification" }
        ]
      },
      ast_colour_improvement: {
        displayName: "Imp. Ast. Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.improvement
      },
      ast_colour_deterioration: {
        displayName: "Det. Ast. Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.deterioration
      },
      ast_colour_neutral_low: {
        displayName: "Neutral (Low) Ast. Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.neutral_low
      },
      ast_colour_neutral_high: {
        displayName: "Neutral (High) Ast. Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.neutral_high
      }
    },
    "Shifts": {
      shift: {
        displayName: "Highlight Shifts",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      shift_n: {
        displayName: "Shift Points",
        type: FormattingComponent.NumUpDown,
        default: 7,
        options: { minValue: { value: 1 } }
      },
      shift_colour_improvement: {
        displayName: "Imp. Shift Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.improvement
      },
      shift_colour_deterioration: {
        displayName: "Det. Shift Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.deterioration
      },
      shift_colour_neutral_low: {
        displayName: "Neutral (Low) Shift Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.neutral_low
      },
      shift_colour_neutral_high: {
        displayName: "Neutral (High) Shift Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.neutral_high
      }
    },
    "Trends": {
      trend: {
        displayName: "Highlight Trends",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      trend_n: {
        displayName: "Trend Points",
        type: FormattingComponent.NumUpDown,
        default: 5,
        options: { minValue: { value: 1 } }
      },
      trend_colour_improvement: {
        displayName: "Imp. Trend Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.improvement
      },
      trend_colour_deterioration: {
        displayName: "Det. Trend Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.deterioration
      },
      trend_colour_neutral_low: {
        displayName: "Neutral (Low) Trend Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.neutral_low
      },
      trend_colour_neutral_high: {
        displayName: "Neutral (High) Trend Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.neutral_high
      }
    },
    "Two-In-Three": {
      two_in_three: {
        displayName: "Highlight Two-in-Three",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      two_in_three_highlight_series: {
        displayName: "Highlight all in Pattern",
        type: FormattingComponent.ToggleSwitch,
        default: false
      },
      two_in_three_limit: {
        displayName: "Warning Limit for Two-in-Three",
        type: FormattingComponent.Dropdown,
        default: "2 Sigma",
        valid: ["1 Sigma", "2 Sigma", "3 Sigma", "Specification"],
        items: [
          { displayName : "1 Sigma", value : "1 Sigma" },
          { displayName : "2 Sigma", value : "2 Sigma" },
          { displayName : "3 Sigma", value : "3 Sigma" },
          { displayName : "Specification", value : "Specification" }
        ]
      },
      twointhree_colour_improvement: {
        displayName: "Imp. Two-in-Three Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.improvement
      },
      twointhree_colour_deterioration: {
        displayName: "Det. Two-in-Three Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.deterioration
      },
      twointhree_colour_neutral_low: {
        displayName: "Neutral (Low) Two-in-Three Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.neutral_low
      },
      twointhree_colour_neutral_high: {
        displayName: "Neutral (High) Two-in-Three Colour",
        type: FormattingComponent.ColorPicker,
        default: defaultColours.neutral_high
      }
    }
  }
};

export default outliersSettings;
