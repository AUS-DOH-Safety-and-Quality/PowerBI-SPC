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

This setting should be used in conjunction with the **Improvement Direction** setting below.

## Improvement Direction
This setting determines which direction is deemed to be the improvement direction for the measure. That is, the measure is getting better in this direction. The various options can be selected in the drop down menu:

![Improvement Direction](images\outlierHighlighting\ImprovementDirection.png)

- **Increase** - The measure increasing is a favourable outcome, and signals improvement in the measure (default).
- **Neutral** - There is no direction set, and the measure increasing or decreasing does not signal improvement or deterioration. This setting is used to detect any statistical variation.
- **Decrease** - The measure decreasing is a favourable outcome, and signals improvement in the measure.

To use these with the conditional formatting, the values must be set to only **increase**, **neutral** and **decrease** respectfully.

This setting should be used in conjunction with the **Type of Change to Flag** setting above.

## Highlight all in Pattern
The toggle to highlight all in pattern allows the user to set whether if all points that contribute to the pattern are highlighted, or only the final point that triggers the pattern (i.e. the seventh point in a shift). This is set to all on default.

![Highlight All In Pattern](images\outlierHighlighting\HighlightAllInPattern.png)

## Common Pattern Options
Further options for each of the patterns can be set by navigating through the dropdown box.

![Outlier Pattern List](images\outlierHighlighting\OutlierPatternList.png)

This section covers the settings that are common across all the pattern types. The below shows the example for astronomical points:

![Pattern Common Options](images\outlierHighlighting\PatternCommonOptions.png)

- **Toggle** - The toggle to set whether the pattern is displayed
- **Imp. Colour** - Colour for the points when improvement is detected for this pattern. Only available if **Improvement Direction** is set to *Increase* or *Decrease*.
- **Det. Colour** - Colour for the points when deterioration is detected for this pattern. Only available if **Improvement Direction** is not set to *Increase* or *Decrease*.
- **Neutral (Low) Colour** - Colour for the points when a pattern is detected and on the lower part of the chart. Only available if **Improvement Direction** is set to *Neutral*.
- **Neutral (Higher) Colour** - Colour for the points when a pattern is detected and on the higher part of the chart. Only available if **Improvement Direction** is set to *Neutral*.

The default colours are consistent with the NHS theme.

## Shift Points
Sets the number of points required in order to detect a shift. The default is seven.

![Shift Points](images\outlierHighlighting\ShiftPoints.png)

## Trend Points
Sets the number of points required in order to detect a trend. The default is five.

![Trend Points](images\outlierHighlighting\TrendPoints.png)

