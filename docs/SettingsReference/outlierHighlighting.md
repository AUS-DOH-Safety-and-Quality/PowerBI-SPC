---
title: Outlier Highlighting
layout: page
parent: Settings Reference
nav_order: 7.2
---

# Pattern Detection Configuration & Aesthetics
SPC patterns can be displayed and formatted in this section.

## Type of Change to Flag
This setting determines whether improvement and deterioration are both flagged, or only one of these directions are flagged. These apply across all the enabled patterns. The various options can be selected in the drop down menu:

![Type of Change to Flag](images\outlierHighlighting\TypeChangeFlag.png)

- **Both** - Both improvement and deterioration patterns are highlighted (default)
- **Improvement (Imp.)** - Only improvement patterns are highlighted
- **Deterioration (Det.)** - Only deterioration patterns are highlighted

To use these with the conditional formatting, the values must be set to only **both**, **improvement** and **deterioration** respectfully.

This setting should be used in conjunction with the **Improvement Direction** setting below. With a **Neutral** improvement direction there is no improvement or deterioration to choose between, so patterns on both sides are always highlighted.

## Improvement Direction
This setting determines which direction is deemed to be the improvement direction for the measure. That is, the measure is getting better in this direction. The various options can be selected in the drop down menu:

![Improvement Direction](images\outlierHighlighting\ImprovementDirection.png)

- **Increase** - The measure increasing is a favourable outcome, and signals improvement in the measure (default).
- **Neutral** - There is no direction set, and the measure increasing or decreasing does not signal improvement or deterioration. This setting is used to detect any statistical variation.
- **Decrease** - The measure decreasing is a favourable outcome, and signals improvement in the measure.

To use these with the conditional formatting, the values must be set to only **increase**, **neutral** and **decrease** respectfully.

This setting should be used in conjunction with the **Type of Change to Flag** setting above.

## Highlight all in Pattern
This toggle applies to the two-in-three pattern. When off (the default), only the points beyond the warning limit are highlighted. When on, every point in the three-point window is highlighted, except any point beyond the opposite warning limit. Shifts and trends always highlight every point in the pattern.

![Highlight All In Pattern](images\outlierHighlighting\HighlightAllInPattern.png)

## Common Pattern Options
Further options for each of the patterns can be set by navigating through the dropdown box.

![Outlier Pattern List](images\outlierHighlighting\OutlierPatternList.png)

This section covers the settings that are common across all the pattern types. The below shows the example for astronomical points:

![Pattern Common Options](images\outlierHighlighting\PatternCommonOptions.png)

Each pattern's settings are listed under [All Settings](#all-settings). The default colours are consistent with the NHS theme.

## Shift Points
Sets the number of points required in order to detect a shift. The default is seven.

![Shift Points](images\outlierHighlighting\ShiftPoints.png)

## Trend Points
Sets the number of points required in order to detect a trend. The default is five.

![Trend Points](images\outlierHighlighting\TrendPoints.png)

## All Settings

{% include settings/outliers.md %}
