import { createSummaryTableCard, dropdownOption } from "powerbi-visuals-core/settings";

const summaryTableSettings = createSummaryTableCard({
  showDescription: "Shows the points as a table instead of a chart. Data with more than one summary table group "
    + "is always shown as a table."
}, {
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
  )
});

export default summaryTableSettings;
